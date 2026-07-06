import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, initDb } from './db.js'
import { login, verifyToken } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

const app = express()
app.use(express.json())

// ---------- Auth ----------
app.post('/api/login', login)

// Todo lo que cuelga de /api (menos login) requiere token
const api = express.Router()
api.use(verifyToken)

// ---------- Clientes ----------
api.get('/clientes', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM proyectos p WHERE p.cliente_id = c.id)                    AS proyectos_count,
        (SELECT COUNT(*) FROM proyectos p WHERE p.cliente_id = c.id
           AND p.estado NOT IN ('finalizado','pausado'))                                AS proyectos_activos,
        (SELECT COUNT(*) FROM seguimientos s WHERE s.cliente_id = c.id
           AND s.completado = false AND s.proxima_fecha IS NOT NULL)                     AS pendientes_count
      FROM clientes c
      ORDER BY c.nombre
    `)
    res.json(rows)
  } catch (e) { next(e) }
})

// Ficha 360°: cliente + sus proyectos, cobros y seguimientos
api.get('/clientes/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const [cli, proy, cob, seg] = await Promise.all([
      pool.query('SELECT * FROM clientes WHERE id=$1', [id]),
      pool.query('SELECT * FROM proyectos WHERE cliente_id=$1 ORDER BY created_at DESC', [id]),
      pool.query('SELECT * FROM cobros WHERE cliente_id=$1 ORDER BY periodo DESC', [id]),
      pool.query('SELECT * FROM seguimientos WHERE cliente_id=$1 ORDER BY fecha DESC, id DESC', [id]),
    ])
    if (!cli.rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json({ ...cli.rows[0], proyectos: proy.rows, cobros: cob.rows, seguimientos: seg.rows })
  } catch (e) { next(e) }
})

api.post('/clientes', async (req, res, next) => {
  try {
    const { nombre, email, telefono, proyecto, monto_mensual, moneda, estado,
            notas, dia_cobro, sitio_url, canal, fecha_alta } = req.body
    const { rows } = await pool.query(
      `INSERT INTO clientes
         (nombre, email, telefono, proyecto, monto_mensual, moneda, estado, notas, dia_cobro, sitio_url, canal, fecha_alta)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,'ARS'),COALESCE($7,'activo'),$8,$9,$10,$11,$12)
       RETURNING *`,
      [nombre, email, telefono, proyecto, monto_mensual || 0, moneda, estado, notas,
       dia_cobro || null, sitio_url, canal, fecha_alta || null]
    )
    res.status(201).json(rows[0])
  } catch (e) { next(e) }
})

api.put('/clientes/:id', async (req, res, next) => {
  try {
    const { nombre, email, telefono, proyecto, monto_mensual, moneda, estado,
            notas, dia_cobro, sitio_url, canal, fecha_alta } = req.body
    const { rows } = await pool.query(
      `UPDATE clientes SET nombre=$1, email=$2, telefono=$3, proyecto=$4,
         monto_mensual=$5, moneda=COALESCE($6,'ARS'), estado=$7, notas=$8,
         dia_cobro=$9, sitio_url=$10, canal=$11, fecha_alta=$12
       WHERE id=$13 RETURNING *`,
      [nombre, email, telefono, proyecto, monto_mensual || 0, moneda, estado, notas,
       dia_cobro || null, sitio_url, canal, fecha_alta || null, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json(rows[0])
  } catch (e) { next(e) }
})

api.delete('/clientes/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM clientes WHERE id=$1', [req.params.id])
    res.status(204).end()
  } catch (e) { next(e) }
})

// ---------- Proyectos ----------
api.get('/proyectos', async (req, res, next) => {
  try {
    const { cliente_id, estado } = req.query
    const params = []
    const conds = []
    if (cliente_id) { params.push(cliente_id); conds.push(`p.cliente_id = $${params.length}`) }
    if (estado)     { params.push(estado);     conds.push(`p.estado = $${params.length}`) }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
    const { rows } = await pool.query(
      `SELECT p.*, cl.nombre AS cliente_nombre
         FROM proyectos p JOIN clientes cl ON cl.id = p.cliente_id
         ${where}
         ORDER BY p.created_at DESC`,
      params
    )
    res.json(rows)
  } catch (e) { next(e) }
})

api.post('/proyectos', async (req, res, next) => {
  try {
    const { cliente_id, nombre, descripcion, estado, stack, repo_url, deploy_url,
            monto, moneda, fecha_inicio, fecha_fin } = req.body
    const { rows } = await pool.query(
      `INSERT INTO proyectos
         (cliente_id, nombre, descripcion, estado, stack, repo_url, deploy_url, monto, moneda, fecha_inicio, fecha_fin)
       VALUES ($1,$2,$3,COALESCE($4,'desarrollo'),$5,$6,$7,$8,COALESCE($9,'ARS'),$10,$11)
       RETURNING *`,
      [cliente_id, nombre, descripcion, estado, stack, repo_url, deploy_url,
       monto || 0, moneda, fecha_inicio || null, fecha_fin || null]
    )
    res.status(201).json(rows[0])
  } catch (e) { next(e) }
})

api.put('/proyectos/:id', async (req, res, next) => {
  try {
    const { cliente_id, nombre, descripcion, estado, stack, repo_url, deploy_url,
            monto, moneda, fecha_inicio, fecha_fin } = req.body
    const { rows } = await pool.query(
      `UPDATE proyectos SET cliente_id=$1, nombre=$2, descripcion=$3, estado=$4,
         stack=$5, repo_url=$6, deploy_url=$7, monto=$8, moneda=COALESCE($9,'ARS'),
         fecha_inicio=$10, fecha_fin=$11
       WHERE id=$12 RETURNING *`,
      [cliente_id, nombre, descripcion, estado, stack, repo_url, deploy_url,
       monto || 0, moneda, fecha_inicio || null, fecha_fin || null, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Proyecto no encontrado' })
    res.json(rows[0])
  } catch (e) { next(e) }
})

api.delete('/proyectos/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM proyectos WHERE id=$1', [req.params.id])
    res.status(204).end()
  } catch (e) { next(e) }
})

// ---------- Seguimientos / CRM ----------
api.get('/seguimientos', async (req, res, next) => {
  try {
    const { cliente_id, pendientes } = req.query
    const params = []
    const conds = []
    if (cliente_id) { params.push(cliente_id); conds.push(`s.cliente_id = $${params.length}`) }
    if (pendientes === '1') conds.push(`s.completado = false AND s.proxima_fecha IS NOT NULL`)
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
    // Pendientes: ordenados por próxima fecha ascendente (lo más urgente arriba).
    const order = pendientes === '1'
      ? 'ORDER BY s.proxima_fecha ASC'
      : 'ORDER BY s.fecha DESC, s.id DESC'
    const { rows } = await pool.query(
      `SELECT s.*, cl.nombre AS cliente_nombre, p.nombre AS proyecto_nombre
         FROM seguimientos s
         JOIN clientes cl ON cl.id = s.cliente_id
         LEFT JOIN proyectos p ON p.id = s.proyecto_id
         ${where} ${order}`,
      params
    )
    res.json(rows)
  } catch (e) { next(e) }
})

api.post('/seguimientos', async (req, res, next) => {
  try {
    const { cliente_id, proyecto_id, tipo, titulo, detalle, fecha,
            proxima_accion, proxima_fecha, completado } = req.body
    const { rows } = await pool.query(
      `INSERT INTO seguimientos
         (cliente_id, proyecto_id, tipo, titulo, detalle, fecha, proxima_accion, proxima_fecha, completado)
       VALUES ($1,$2,COALESCE($3,'nota'),$4,$5,COALESCE($6,CURRENT_DATE),$7,$8,COALESCE($9,false))
       RETURNING *`,
      [cliente_id, proyecto_id || null, tipo, titulo, detalle, fecha || null,
       proxima_accion, proxima_fecha || null, completado]
    )
    res.status(201).json(rows[0])
  } catch (e) { next(e) }
})

api.put('/seguimientos/:id', async (req, res, next) => {
  try {
    const { proyecto_id, tipo, titulo, detalle, fecha,
            proxima_accion, proxima_fecha, completado } = req.body
    const { rows } = await pool.query(
      `UPDATE seguimientos SET proyecto_id=$1, tipo=COALESCE($2,tipo), titulo=COALESCE($3,titulo),
         detalle=$4, fecha=COALESCE($5,fecha), proxima_accion=$6, proxima_fecha=$7,
         completado=COALESCE($8,completado)
       WHERE id=$9 RETURNING *`,
      [proyecto_id || null, tipo, titulo, detalle, fecha || null,
       proxima_accion, proxima_fecha || null, completado, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Seguimiento no encontrado' })
    res.json(rows[0])
  } catch (e) { next(e) }
})

api.delete('/seguimientos/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM seguimientos WHERE id=$1', [req.params.id])
    res.status(204).end()
  } catch (e) { next(e) }
})

// ---------- Cobros / Facturación ----------
api.get('/cobros', async (req, res, next) => {
  try {
    const { periodo } = req.query
    const params = []
    let where = ''
    if (periodo) { params.push(periodo); where = 'WHERE c.periodo = $1' }
    const { rows } = await pool.query(
      `SELECT c.*, cl.nombre AS cliente_nombre,
              cl.email AS cliente_email, cl.proyecto AS cliente_proyecto
         FROM cobros c JOIN clientes cl ON cl.id = c.cliente_id
         ${where}
         ORDER BY cl.nombre`,
      params
    )
    res.json(rows)
  } catch (e) { next(e) }
})

// Crea un cobro por cada cliente activo para el período (idempotente).
// Copia moneda del cliente y calcula vencimiento según su día de cobro.
api.post('/cobros/generar', async (req, res, next) => {
  try {
    const { periodo } = req.body
    if (!/^\d{4}-\d{2}$/.test(periodo || '')) {
      return res.status(400).json({ error: 'periodo debe tener formato YYYY-MM' })
    }
    const { rows } = await pool.query(
      `INSERT INTO cobros (cliente_id, periodo, monto, moneda, vencimiento, tipo)
         SELECT id, $1, monto_mensual, moneda,
                CASE WHEN dia_cobro IS NOT NULL
                     THEN (to_date($1 || '-01','YYYY-MM-DD')
                           + (LEAST(dia_cobro, 28) - 1) * INTERVAL '1 day')::date
                     ELSE NULL END,
                'mensual'
           FROM clientes
          WHERE estado = 'activo' AND monto_mensual > 0
       ON CONFLICT (cliente_id, periodo) WHERE tipo = 'mensual' DO NOTHING
       RETURNING *`,
      [periodo]
    )
    res.json({ creados: rows.length, cobros: rows })
  } catch (e) { next(e) }
})

// Cobro manual: cosas viejas / históricas y pagos únicos (setup inicial).
api.post('/cobros', async (req, res, next) => {
  try {
    const { cliente_id, periodo, monto, moneda, estado, tipo, concepto,
            fecha_emision, fecha_pago, vencimiento, metodo_pago, notas } = req.body
    if (!cliente_id) return res.status(400).json({ error: 'Falta el cliente' })
    if (!/^\d{4}-\d{2}$/.test(periodo || '')) {
      return res.status(400).json({ error: 'periodo debe tener formato YYYY-MM' })
    }
    const est = estado || 'pendiente'
    // Si nace pagado y no mandan fecha, usamos hoy.
    const fp = est === 'pagado' ? (fecha_pago || new Date().toISOString().slice(0, 10)) : (fecha_pago || null)
    const { rows } = await pool.query(
      `INSERT INTO cobros
         (cliente_id, periodo, monto, moneda, estado, tipo, concepto, fecha_emision, fecha_pago, vencimiento, metodo_pago, notas)
       VALUES ($1,$2,$3,COALESCE($4,'ARS'),$5,COALESCE($6,'mensual'),$7,
               COALESCE($8,CURRENT_DATE),$9,$10,$11,$12)
       RETURNING *`,
      [cliente_id, periodo, monto || 0, moneda, est, tipo, concepto,
       fecha_emision || null, fp, vencimiento || null, metodo_pago, notas]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    // Choque con el cobro mensual único del período.
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un cobro mensual para ese cliente y período.' })
    }
    next(e)
  }
})

api.put('/cobros/:id', async (req, res, next) => {
  try {
    const { monto, estado, fecha_pago, notas, metodo_pago, tipo, concepto } = req.body
    // Si pasa a pagado y no mandan fecha, usamos hoy; si vuelve a pendiente, la limpiamos.
    const fp = estado === 'pagado' ? (fecha_pago || new Date().toISOString().slice(0, 10))
             : estado === 'pendiente' || estado === 'vencido' ? null
             : fecha_pago
    const { rows } = await pool.query(
      `UPDATE cobros SET monto=COALESCE($1,monto), estado=COALESCE($2,estado),
         fecha_pago=$3, notas=$4, metodo_pago=COALESCE($5,metodo_pago),
         tipo=COALESCE($6,tipo), concepto=COALESCE($7,concepto) WHERE id=$8 RETURNING *`,
      [monto, estado, fp, notas, metodo_pago, tipo, concepto, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Cobro no encontrado' })
    res.json(rows[0])
  } catch (e) { next(e) }
})

api.delete('/cobros/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cobros WHERE id=$1', [req.params.id])
    res.status(204).end()
  } catch (e) { next(e) }
})

// ---------- Resumen del mes (por moneda) ----------
api.get('/resumen', async (req, res, next) => {
  try {
    const { periodo } = req.query
    const { rows } = await pool.query(
      `SELECT moneda,
         COALESCE(SUM(monto),0)                                        AS facturado,
         COALESCE(SUM(monto) FILTER (WHERE estado='pagado'),0)         AS cobrado,
         COALESCE(SUM(monto) FILTER (WHERE estado<>'pagado'),0)        AS pendiente,
         COUNT(*)                                                      AS cantidad,
         COUNT(*) FILTER (WHERE estado='pagado')                       AS pagados
       FROM cobros WHERE periodo = $1
       GROUP BY moneda`,
      [periodo]
    )
    res.json(rows)
  } catch (e) { next(e) }
})

// ---------- Dashboard: KPIs del negocio ----------
api.get('/dashboard', async (req, res, next) => {
  try {
    const periodo = /^\d{4}-\d{2}$/.test(req.query.periodo || '')
      ? req.query.periodo
      : new Date().toISOString().slice(0, 7)

    const [clientes, mrr, mes, deuda, extras, proyectos, vencimientos, pendientes] = await Promise.all([
      // Clientes activos / totales
      pool.query(`SELECT
         COUNT(*)                                   AS total,
         COUNT(*) FILTER (WHERE estado='activo')    AS activos FROM clientes`),
      // MRR: abono mensual de clientes activos, por moneda
      pool.query(`SELECT moneda, COALESCE(SUM(monto_mensual),0) AS mrr
         FROM clientes WHERE estado='activo' AND monto_mensual > 0 GROUP BY moneda`),
      // Ingresos del mes actual (cobrado) por moneda
      pool.query(`SELECT moneda,
         COALESCE(SUM(monto) FILTER (WHERE estado='pagado'),0) AS cobrado,
         COALESCE(SUM(monto),0)                                AS facturado
         FROM cobros WHERE periodo=$1 GROUP BY moneda`, [periodo]),
      // Deuda: todo lo no pagado (cualquier período) por moneda
      pool.query(`SELECT moneda,
         COALESCE(SUM(monto),0) AS total, COUNT(*) AS cantidad
         FROM cobros WHERE estado<>'pagado' GROUP BY moneda`),
      // Ingresos NO recurrentes: setup y cobros únicos (cualquier período), por tipo y moneda
      pool.query(`SELECT tipo, moneda,
         COALESCE(SUM(monto) FILTER (WHERE estado='pagado'),0) AS cobrado,
         COALESCE(SUM(monto),0)                                AS total,
         COUNT(*)                                              AS cantidad
         FROM cobros WHERE tipo IN ('setup','unico') GROUP BY tipo, moneda`),
      // Proyectos por estado
      pool.query(`SELECT estado, COUNT(*) AS cantidad FROM proyectos GROUP BY estado`),
      // Próximos vencimientos (no pagados con fecha de vencimiento)
      pool.query(`SELECT c.id, c.cliente_id, c.periodo, c.monto, c.moneda, c.vencimiento, cl.nombre AS cliente_nombre
         FROM cobros c JOIN clientes cl ON cl.id=c.cliente_id
         WHERE c.estado<>'pagado' AND c.vencimiento IS NOT NULL
         ORDER BY c.vencimiento ASC LIMIT 8`),
      // Seguimientos pendientes con próxima acción
      pool.query(`SELECT s.id, s.titulo, s.proxima_accion, s.proxima_fecha, cl.nombre AS cliente_nombre
         FROM seguimientos s JOIN clientes cl ON cl.id=s.cliente_id
         WHERE s.completado=false AND s.proxima_fecha IS NOT NULL
         ORDER BY s.proxima_fecha ASC LIMIT 8`),
    ])

    res.json({
      periodo,
      clientes: clientes.rows[0],
      mrr: mrr.rows,
      mes: mes.rows,
      deuda: deuda.rows,
      extras: extras.rows,
      proyectos: proyectos.rows,
      vencimientos: vencimientos.rows,
      pendientes: pendientes.rows,
    })
  } catch (e) { next(e) }
})

app.use('/api', api)

// Error handler de la API
app.use('/api', (err, _req, res, _next) => {
  console.error('[api error]', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// ---------- Estáticos + SPA fallback ----------
app.use(express.static(distDir))
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

const PORT = process.env.PORT || 3001

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] escuchando en :${PORT}`))
  })
  .catch((e) => {
    console.error('[server] no se pudo iniciar la base de datos:', e)
    process.exit(1)
  })
