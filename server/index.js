import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, initDb } from './db.js'
import {
  login, verifyToken,
  hashPassword, verifyPassword, randomToken, signClientToken, verifyClientToken,
} from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

// Archivos en memoria (van a Postgres como bytea). Límite 15 MB por archivo.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } })

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
    const [cli, proy, cob, seg, arch] = await Promise.all([
      pool.query('SELECT * FROM clientes WHERE id=$1', [id]),
      pool.query('SELECT * FROM proyectos WHERE cliente_id=$1 ORDER BY created_at DESC', [id]),
      pool.query(`SELECT c.*, (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id=c.id) AS pagado
                    FROM cobros c WHERE c.cliente_id=$1 ORDER BY c.periodo DESC`, [id]),
      pool.query('SELECT * FROM seguimientos WHERE cliente_id=$1 ORDER BY fecha DESC, id DESC', [id]),
      pool.query('SELECT id, categoria, nombre, mime, tamano, descripcion, created_at FROM archivos WHERE cliente_id=$1 ORDER BY created_at DESC', [id]),
    ])
    if (!cli.rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json({ ...cli.rows[0], proyectos: proy.rows, cobros: cob.rows, seguimientos: seg.rows, archivos: arch.rows })
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

// ---------- Archivos adjuntos ----------
// Listado (metadata) de archivos de un cliente
api.get('/clientes/:id/archivos', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, categoria, nombre, mime, tamano, descripcion, created_at
         FROM archivos WHERE cliente_id=$1 ORDER BY created_at DESC`,
      [req.params.id]
    )
    res.json(rows)
  } catch (e) { next(e) }
})

// Subir un archivo (multipart, campo "archivo")
api.post('/clientes/:id/archivos', upload.single('archivo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' })
    const { categoria, descripcion, proyecto_id } = req.body
    const { rows } = await pool.query(
      `INSERT INTO archivos (cliente_id, proyecto_id, categoria, nombre, mime, tamano, datos, descripcion)
       VALUES ($1,$2,COALESCE($3,'otro'),$4,$5,$6,$7,$8)
       RETURNING id, categoria, nombre, mime, tamano, descripcion, created_at`,
      [req.params.id, proyecto_id || null, categoria, req.file.originalname,
       req.file.mimetype, req.file.size, req.file.buffer, descripcion || null]
    )
    res.status(201).json(rows[0])
  } catch (e) { next(e) }
})

// Descargar / ver un archivo
api.get('/archivos/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT nombre, mime, datos FROM archivos WHERE id=$1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Archivo no encontrado' })
    const a = rows[0]
    res.setHeader('Content-Type', a.mime || 'application/octet-stream')
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(a.nombre)}"`)
    res.send(a.datos)
  } catch (e) { next(e) }
})

api.delete('/archivos/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM archivos WHERE id=$1', [req.params.id])
    res.status(204).end()
  } catch (e) { next(e) }
})

// ---------- Oportunidades / pipeline ----------
api.get('/oportunidades', async (req, res, next) => {
  try {
    const { tipo } = req.query
    const params = []
    let where = ''
    if (tipo) { params.push(tipo); where = 'WHERE tipo = $1' }
    const { rows } = await pool.query(
      `SELECT * FROM oportunidades ${where} ORDER BY created_at DESC`, params
    )
    res.json(rows)
  } catch (e) { next(e) }
})

api.post('/oportunidades', async (req, res, next) => {
  try {
    const { nombre, tipo, contacto, canal, etapa, valor, moneda, notas, proxima_accion, proxima_fecha } = req.body
    const { rows } = await pool.query(
      `INSERT INTO oportunidades
         (nombre, tipo, contacto, canal, etapa, valor, moneda, notas, proxima_accion, proxima_fecha)
       VALUES ($1,COALESCE($2,'lead'),$3,$4,COALESCE($5,'nuevo'),$6,COALESCE($7,'ARS'),$8,$9,$10)
       RETURNING *`,
      [nombre, tipo, contacto, canal, etapa, valor || 0, moneda, notas, proxima_accion, proxima_fecha || null]
    )
    res.status(201).json(rows[0])
  } catch (e) { next(e) }
})

api.put('/oportunidades/:id', async (req, res, next) => {
  try {
    const { nombre, tipo, contacto, canal, etapa, valor, moneda, notas, proxima_accion, proxima_fecha } = req.body
    const { rows } = await pool.query(
      `UPDATE oportunidades SET nombre=$1, tipo=COALESCE($2,tipo), contacto=$3, canal=$4,
         etapa=COALESCE($5,etapa), valor=$6, moneda=COALESCE($7,'ARS'), notas=$8,
         proxima_accion=$9, proxima_fecha=$10 WHERE id=$11 RETURNING *`,
      [nombre, tipo, contacto, canal, etapa, valor || 0, moneda, notas, proxima_accion, proxima_fecha || null, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Oportunidad no encontrada' })
    res.json(rows[0])
  } catch (e) { next(e) }
})

api.delete('/oportunidades/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM oportunidades WHERE id=$1', [req.params.id])
    res.status(204).end()
  } catch (e) { next(e) }
})

// Convertir una oportunidad ganada en cliente real
api.post('/oportunidades/:id/convertir', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM oportunidades WHERE id=$1', [req.params.id])
    const o = rows[0]
    if (!o) return res.status(404).json({ error: 'Oportunidad no encontrada' })
    if (o.cliente_id) return res.status(409).json({ error: 'Esta oportunidad ya fue convertida en cliente.' })

    const contacto = (o.contacto || '').trim()
    const email = contacto.includes('@') ? contacto : null
    const telefono = !email && contacto ? contacto : null

    const cli = await pool.query(
      `INSERT INTO clientes (nombre, email, telefono, canal, moneda, notas, estado)
       VALUES ($1,$2,$3,$4,$5,$6,'activo') RETURNING *`,
      [o.nombre, email, telefono, o.canal, o.moneda, o.notas]
    )
    await pool.query('UPDATE oportunidades SET etapa=$1, cliente_id=$2 WHERE id=$3',
      ['ganado', cli.rows[0].id, o.id])
    res.status(201).json(cli.rows[0])
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
              cl.email AS cliente_email, cl.proyecto AS cliente_proyecto,
              (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id = c.id) AS pagado
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
    const cobro = rows[0]
    // Si nace pagado, registramos el pago total para mantener el modelo de abonos consistente.
    if (est === 'pagado' && Number(cobro.monto) > 0) {
      await pool.query(
        `INSERT INTO pagos (cobro_id, monto, fecha, metodo) VALUES ($1,$2,$3,$4)`,
        [cobro.id, cobro.monto, fp || cobro.fecha_emision, metodo_pago]
      )
    }
    res.status(201).json(cobro)
  } catch (e) {
    // Choque con el cobro mensual único del período.
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un cobro mensual para ese cliente y período.' })
    }
    next(e)
  }
})

// Editar un cobro (monto, concepto, tipo, período, moneda). El estado se
// recalcula solo según los pagos registrados.
api.put('/cobros/:id', async (req, res, next) => {
  try {
    const { monto, moneda, tipo, concepto, periodo, notas, metodo_pago } = req.body
    const { rows } = await pool.query(
      `UPDATE cobros SET
         monto=COALESCE($1,monto), moneda=COALESCE($2,moneda), tipo=COALESCE($3,tipo),
         concepto=COALESCE($4,concepto), periodo=COALESCE($5,periodo),
         notas=COALESCE($6,notas), metodo_pago=COALESCE($7,metodo_pago)
       WHERE id=$8 RETURNING id`,
      [monto, moneda, tipo, concepto, periodo, notas, metodo_pago, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Cobro no encontrado' })
    await recomputeCobro(req.params.id)
    res.json(await cobroConPagado(req.params.id))
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Ya existe un cobro mensual para ese cliente y período.' })
    next(e)
  }
})

api.delete('/cobros/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cobros WHERE id=$1', [req.params.id])
    res.status(204).end()
  } catch (e) { next(e) }
})

// ---------- Pagos parciales (abonos) ----------
// Recalcula estado y fecha_pago de un cobro según la suma de sus abonos.
async function recomputeCobro(id) {
  await pool.query(
    `UPDATE cobros c SET
        estado = CASE WHEN pg.pagado >= c.monto AND c.monto > 0 THEN 'pagado'
                      WHEN pg.pagado > 0 THEN 'parcial'
                      ELSE 'pendiente' END,
        fecha_pago = CASE WHEN pg.pagado >= c.monto AND c.monto > 0 THEN pg.ult ELSE NULL END
       FROM (SELECT COALESCE(SUM(monto),0) AS pagado, MAX(fecha) AS ult
               FROM pagos WHERE cobro_id = $1) pg
      WHERE c.id = $1`,
    [id]
  )
}

async function cobroConPagado(id) {
  const { rows } = await pool.query(
    `SELECT c.*, (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id = c.id) AS pagado
       FROM cobros c WHERE c.id = $1`, [id]
  )
  return rows[0]
}

api.get('/cobros/:id/pagos', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM pagos WHERE cobro_id = $1 ORDER BY fecha, id', [req.params.id]
    )
    res.json(rows)
  } catch (e) { next(e) }
})

// Registrar un abono (ej: la seña, o el saldo al entregar)
api.post('/cobros/:id/pagos', async (req, res, next) => {
  try {
    const { monto, fecha, metodo, nota } = req.body
    if (!(Number(monto) > 0)) return res.status(400).json({ error: 'El monto del pago debe ser mayor a 0' })
    await pool.query(
      `INSERT INTO pagos (cobro_id, monto, fecha, metodo, nota)
       VALUES ($1,$2,COALESCE($3,CURRENT_DATE),$4,$5)`,
      [req.params.id, monto, fecha || null, metodo, nota]
    )
    if (metodo) await pool.query('UPDATE cobros SET metodo_pago=$1 WHERE id=$2', [metodo, req.params.id])
    await recomputeCobro(req.params.id)
    res.status(201).json(await cobroConPagado(req.params.id))
  } catch (e) { next(e) }
})

// Editar un pago existente (monto, fecha, método)
api.put('/pagos/:id', async (req, res, next) => {
  try {
    const { monto, fecha, metodo, nota } = req.body
    const { rows } = await pool.query(
      `UPDATE pagos SET monto=COALESCE($1,monto), fecha=COALESCE($2,fecha), metodo=$3, nota=$4
       WHERE id=$5 RETURNING cobro_id`,
      [monto, fecha, metodo, nota, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Pago no encontrado' })
    if (metodo) await pool.query('UPDATE cobros SET metodo_pago=$1 WHERE id=$2', [metodo, rows[0].cobro_id])
    await recomputeCobro(rows[0].cobro_id)
    res.json(await cobroConPagado(rows[0].cobro_id))
  } catch (e) { next(e) }
})

api.delete('/pagos/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT cobro_id FROM pagos WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Pago no encontrado' })
    await pool.query('DELETE FROM pagos WHERE id = $1', [req.params.id])
    await recomputeCobro(rows[0].cobro_id)
    res.json(await cobroConPagado(rows[0].cobro_id))
  } catch (e) { next(e) }
})

// ---------- Pendientes: todo lo que falta cobrar ----------
// Cobros con saldo > 0 (parciales, pendientes, vencidos), ordenados por urgencia.
api.get('/pendientes', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, cl.nombre AS cliente_nombre,
              (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id = c.id) AS pagado
         FROM cobros c JOIN clientes cl ON cl.id = c.cliente_id
        WHERE c.monto > (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id = c.id)
        ORDER BY (c.vencimiento IS NULL), c.vencimiento ASC, c.periodo ASC`
    )
    res.json(rows)
  } catch (e) { next(e) }
})

// ---------- Resumen del mes (por moneda) ----------
api.get('/resumen', async (req, res, next) => {
  try {
    const { periodo } = req.query
    const { rows } = await pool.query(
      `SELECT c.moneda,
         COALESCE(SUM(c.monto),0)                                 AS facturado,
         COALESCE(SUM(pg.pagado),0)                               AS cobrado,
         COALESCE(SUM(GREATEST(c.monto - pg.pagado, 0)),0)        AS pendiente,
         COUNT(*)                                                 AS cantidad,
         COUNT(*) FILTER (WHERE pg.pagado >= c.monto AND c.monto > 0) AS pagados
       FROM cobros c
       LEFT JOIN LATERAL (SELECT COALESCE(SUM(monto),0) AS pagado FROM pagos WHERE cobro_id = c.id) pg ON true
       WHERE c.periodo = $1
       GROUP BY c.moneda`,
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
      // Ingresos del mes actual (cobrado real = suma de abonos) por moneda
      pool.query(`SELECT c.moneda,
         COALESCE(SUM(pg.pagado),0) AS cobrado,
         COALESCE(SUM(c.monto),0)   AS facturado
         FROM cobros c
         LEFT JOIN LATERAL (SELECT COALESCE(SUM(monto),0) AS pagado FROM pagos WHERE cobro_id=c.id) pg ON true
         WHERE c.periodo=$1 GROUP BY c.moneda`, [periodo]),
      // Deuda: saldo pendiente (cualquier período) por moneda
      pool.query(`SELECT c.moneda,
         COALESCE(SUM(GREATEST(c.monto - pg.pagado, 0)),0)   AS total,
         COUNT(*) FILTER (WHERE c.monto - pg.pagado > 0)     AS cantidad
         FROM cobros c
         LEFT JOIN LATERAL (SELECT COALESCE(SUM(monto),0) AS pagado FROM pagos WHERE cobro_id=c.id) pg ON true
         GROUP BY c.moneda`),
      // Ingresos NO recurrentes: setup y cobros únicos (cobrado real), por tipo y moneda
      pool.query(`SELECT c.tipo, c.moneda,
         COALESCE(SUM(pg.pagado),0) AS cobrado,
         COALESCE(SUM(c.monto),0)   AS total,
         COUNT(*)                   AS cantidad
         FROM cobros c
         LEFT JOIN LATERAL (SELECT COALESCE(SUM(monto),0) AS pagado FROM pagos WHERE cobro_id=c.id) pg ON true
         WHERE c.tipo IN ('setup','unico') GROUP BY c.tipo, c.moneda`),
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

// ---------- Presupuestos (admin) ----------
async function presupuestoConItems(id) {
  const p = await pool.query('SELECT * FROM presupuestos WHERE id=$1', [id])
  if (!p.rows[0]) return null
  const it = await pool.query('SELECT * FROM presupuesto_items WHERE presupuesto_id=$1 ORDER BY orden, id', [id])
  return { ...p.rows[0], items: it.rows }
}

async function insertItems(presupuestoId, items = []) {
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    await pool.query(
      `INSERT INTO presupuesto_items (presupuesto_id, grupo, concepto, descripcion, costo, obligatorio, seleccionado, orden)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,true),COALESCE($7,true),$8)`,
      [presupuestoId, it.grupo || null, it.concepto, it.descripcion || null,
       it.costo || 0, it.obligatorio, it.obligatorio ? true : (it.seleccionado ?? true), i]
    )
  }
}

// Listado de presupuestos de un cliente (con total base + total elegido)
api.get('/clientes/:id/presupuestos', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*,
         (SELECT COALESCE(SUM(costo),0) FROM presupuesto_items i WHERE i.presupuesto_id=p.id AND i.seleccionado) AS total_elegido,
         (SELECT COUNT(*) FROM presupuesto_items i WHERE i.presupuesto_id=p.id) AS items_count
         FROM presupuestos p WHERE p.cliente_id=$1 ORDER BY p.created_at DESC`,
      [req.params.id]
    )
    res.json(rows)
  } catch (e) { next(e) }
})

api.get('/presupuestos/:id', async (req, res, next) => {
  try {
    const p = await presupuestoConItems(req.params.id)
    if (!p) return res.status(404).json({ error: 'Presupuesto no encontrado' })
    res.json(p)
  } catch (e) { next(e) }
})

api.post('/presupuestos', async (req, res, next) => {
  try {
    const { cliente_id, titulo, descripcion, moneda, notas, items } = req.body
    if (!cliente_id || !titulo?.trim()) return res.status(400).json({ error: 'Falta cliente o título' })
    const { rows } = await pool.query(
      `INSERT INTO presupuestos (cliente_id, titulo, descripcion, moneda, notas, estado)
       VALUES ($1,$2,$3,COALESCE($4,'ARS'),$5,'borrador') RETURNING id`,
      [cliente_id, titulo, descripcion || null, moneda, notas || null]
    )
    await insertItems(rows[0].id, items)
    res.status(201).json(await presupuestoConItems(rows[0].id))
  } catch (e) { next(e) }
})

api.put('/presupuestos/:id', async (req, res, next) => {
  try {
    const cur = await pool.query('SELECT estado FROM presupuestos WHERE id=$1', [req.params.id])
    if (!cur.rows[0]) return res.status(404).json({ error: 'Presupuesto no encontrado' })
    if (cur.rows[0].estado === 'aprobado') return res.status(409).json({ error: 'El presupuesto ya fue firmado; no se puede editar.' })
    const { titulo, descripcion, moneda, notas, items } = req.body
    await pool.query(
      `UPDATE presupuestos SET titulo=COALESCE($1,titulo), descripcion=$2,
         moneda=COALESCE($3,moneda), notas=$4 WHERE id=$5`,
      [titulo, descripcion || null, moneda, notas || null, req.params.id]
    )
    if (Array.isArray(items)) {
      await pool.query('DELETE FROM presupuesto_items WHERE presupuesto_id=$1', [req.params.id])
      await insertItems(req.params.id, items)
    }
    res.json(await presupuestoConItems(req.params.id))
  } catch (e) { next(e) }
})

// Enviar al cliente (queda visible en el portal)
api.post('/presupuestos/:id/enviar', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE presupuestos SET estado='enviado', sent_at=now()
       WHERE id=$1 AND estado <> 'aprobado' RETURNING id`, [req.params.id]
    )
    if (!rows[0]) return res.status(409).json({ error: 'No se pudo enviar (¿ya está firmado?).' })
    res.json(await presupuestoConItems(req.params.id))
  } catch (e) { next(e) }
})

api.delete('/presupuestos/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM presupuestos WHERE id=$1', [req.params.id])
    res.status(204).end()
  } catch (e) { next(e) }
})

// Generar (o regenerar) el link de acceso al portal para un cliente.
// Devuelve un token; el frontend arma el link /portal/activar?token=...
api.post('/clientes/:id/portal-invite', async (req, res, next) => {
  try {
    const cli = await pool.query('SELECT id, nombre, email FROM clientes WHERE id=$1', [req.params.id])
    if (!cli.rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' })
    if (!cli.rows[0].email) return res.status(400).json({ error: 'El cliente no tiene email cargado. Agregá uno primero.' })
    const token = randomToken()
    await pool.query(
      `UPDATE clientes SET portal_invite_token=$1, portal_token_exp=now() + interval '14 days' WHERE id=$2`,
      [token, req.params.id]
    )
    res.json({ token, email: cli.rows[0].email, nombre: cli.rows[0].nombre })
  } catch (e) { next(e) }
})

// ============================================================
//  PORTAL DE CLIENTES  (/api/portal)
//  Se monta ANTES del router admin para que su verifyToken no lo bloquee.
// ============================================================
const portal = express.Router()

// --- Público: invitación, activación y login ---
portal.get('/invite/:token', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT nombre, email FROM clientes
        WHERE portal_invite_token=$1 AND portal_token_exp > now()`,
      [req.params.token]
    )
    if (!rows[0]) return res.status(404).json({ error: 'El link no es válido o expiró. Pedile uno nuevo a Margon.' })
    res.json(rows[0])
  } catch (e) { next(e) }
})

portal.post('/activar', async (req, res, next) => {
  try {
    const { token, password } = req.body || {}
    if (!password || String(password).length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' })
    }
    const cli = await pool.query(
      `SELECT id FROM clientes WHERE portal_invite_token=$1 AND portal_token_exp > now()`,
      [token]
    )
    if (!cli.rows[0]) return res.status(400).json({ error: 'El link no es válido o expiró.' })
    await pool.query(
      `UPDATE clientes SET portal_password_hash=$1, portal_activo=true,
         portal_invite_token=NULL, portal_token_exp=NULL, portal_last_login=now()
       WHERE id=$2`,
      [hashPassword(password), cli.rows[0].id]
    )
    res.json({ token: signClientToken(cli.rows[0].id) })
  } catch (e) { next(e) }
})

portal.post('/login', async (req, res, next) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase()
    const password = req.body?.password || ''
    const { rows } = await pool.query(
      `SELECT id, portal_password_hash, portal_activo FROM clientes WHERE lower(email)=$1`,
      [email]
    )
    const c = rows[0]
    if (!c || !c.portal_activo || !verifyPassword(password, c.portal_password_hash)) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos.' })
    }
    await pool.query('UPDATE clientes SET portal_last_login=now() WHERE id=$1', [c.id])
    res.json({ token: signClientToken(c.id) })
  } catch (e) { next(e) }
})

// --- Todo lo de abajo requiere sesión de cliente ---
portal.use(verifyClientToken)

portal.get('/me', async (req, res, next) => {
  try {
    const id = req.clienteId
    const [cli, proy, saldo, prox, pres] = await Promise.all([
      pool.query('SELECT id, nombre, email, telefono, estado, moneda FROM clientes WHERE id=$1', [id]),
      pool.query(`SELECT COUNT(*) AS n FROM proyectos WHERE cliente_id=$1 AND estado NOT IN ('finalizado','pausado')`, [id]),
      pool.query(`SELECT c.moneda, COALESCE(SUM(GREATEST(c.monto - COALESCE((SELECT SUM(monto) FROM pagos WHERE cobro_id=c.id),0),0)),0) AS saldo
                    FROM cobros c WHERE c.cliente_id=$1 GROUP BY c.moneda`, [id]),
      pool.query(`SELECT c.periodo, c.monto, c.moneda, c.vencimiento
                    FROM cobros c
                   WHERE c.cliente_id=$1 AND c.estado<>'pagado' AND c.vencimiento IS NOT NULL
                   ORDER BY c.vencimiento ASC LIMIT 5`, [id]),
      pool.query(`SELECT COUNT(*) AS n FROM presupuestos WHERE cliente_id=$1 AND estado='enviado'`, [id]),
    ])
    if (!cli.rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json({
      cliente: cli.rows[0],
      proyectos_activos: Number(proy.rows[0].n),
      saldo: saldo.rows,
      proximos: prox.rows,
      presupuestos_pendientes: Number(pres.rows[0].n),
    })
  } catch (e) { next(e) }
})

portal.get('/pagos', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id=c.id) AS pagado
         FROM cobros c WHERE c.cliente_id=$1 ORDER BY c.periodo DESC, c.id DESC`,
      [req.clienteId]
    )
    res.json(rows)
  } catch (e) { next(e) }
})

portal.get('/proyectos', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, descripcion, estado, deploy_url, fecha_inicio, fecha_fin
         FROM proyectos WHERE cliente_id=$1 ORDER BY created_at DESC`,
      [req.clienteId]
    )
    res.json(rows)
  } catch (e) { next(e) }
})

portal.get('/archivos', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, categoria, nombre, mime, tamano, descripcion, created_at
         FROM archivos WHERE cliente_id=$1 ORDER BY created_at DESC`,
      [req.clienteId]
    )
    res.json(rows)
  } catch (e) { next(e) }
})

portal.get('/archivos/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT nombre, mime, datos FROM archivos WHERE id=$1 AND cliente_id=$2',
      [req.params.id, req.clienteId]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Archivo no encontrado' })
    const a = rows[0]
    res.setHeader('Content-Type', a.mime || 'application/octet-stream')
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(a.nombre)}"`)
    res.send(a.datos)
  } catch (e) { next(e) }
})

portal.get('/presupuestos', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*,
         (SELECT COALESCE(SUM(costo),0) FROM presupuesto_items i WHERE i.presupuesto_id=p.id AND i.seleccionado) AS total_elegido
         FROM presupuestos p
        WHERE p.cliente_id=$1 AND p.estado IN ('enviado','aprobado','rechazado')
        ORDER BY p.created_at DESC`,
      [req.clienteId]
    )
    res.json(rows)
  } catch (e) { next(e) }
})

async function portalPresupuesto(id, clienteId) {
  const p = await pool.query(
    `SELECT * FROM presupuestos WHERE id=$1 AND cliente_id=$2 AND estado <> 'borrador'`,
    [id, clienteId]
  )
  if (!p.rows[0]) return null
  const it = await pool.query('SELECT * FROM presupuesto_items WHERE presupuesto_id=$1 ORDER BY orden, id', [id])
  return { ...p.rows[0], items: it.rows }
}

portal.get('/presupuestos/:id', async (req, res, next) => {
  try {
    const p = await portalPresupuesto(req.params.id, req.clienteId)
    if (!p) return res.status(404).json({ error: 'Presupuesto no encontrado' })
    res.json(p)
  } catch (e) { next(e) }
})

// El cliente marca/desmarca ítems OPCIONALES (los obligatorios no se tocan)
portal.patch('/presupuestos/:id/seleccion', async (req, res, next) => {
  try {
    const p = await pool.query(
      `SELECT estado FROM presupuestos WHERE id=$1 AND cliente_id=$2`, [req.params.id, req.clienteId]
    )
    if (!p.rows[0]) return res.status(404).json({ error: 'Presupuesto no encontrado' })
    if (p.rows[0].estado === 'aprobado') return res.status(409).json({ error: 'El presupuesto ya está firmado.' })
    const seleccion = req.body?.seleccion || {} // { itemId: true/false }
    for (const [itemId, val] of Object.entries(seleccion)) {
      await pool.query(
        `UPDATE presupuesto_items SET seleccionado=$1
          WHERE id=$2 AND presupuesto_id=$3 AND obligatorio=false`,
        [!!val, itemId, req.params.id]
      )
    }
    res.json(await portalPresupuesto(req.params.id, req.clienteId))
  } catch (e) { next(e) }
})

// Firmar (aprobar): fija estado y firma electrónica simple.
portal.post('/presupuestos/:id/firmar', async (req, res, next) => {
  try {
    const nombre = (req.body?.nombre || '').trim()
    if (!nombre) return res.status(400).json({ error: 'Ingresá tu nombre para firmar.' })
    const p = await pool.query(
      `SELECT estado FROM presupuestos WHERE id=$1 AND cliente_id=$2`, [req.params.id, req.clienteId]
    )
    if (!p.rows[0]) return res.status(404).json({ error: 'Presupuesto no encontrado' })
    if (p.rows[0].estado === 'aprobado') return res.status(409).json({ error: 'Este presupuesto ya fue firmado.' })
    if (p.rows[0].estado !== 'enviado') return res.status(409).json({ error: 'Este presupuesto no está disponible para firmar.' })
    const tot = await pool.query(
      `SELECT COALESCE(SUM(costo),0) AS total FROM presupuesto_items WHERE presupuesto_id=$1 AND seleccionado`,
      [req.params.id]
    )
    await pool.query(
      `UPDATE presupuestos SET estado='aprobado', firma_nombre=$1, firma_fecha=now(), firma_total=$2 WHERE id=$3`,
      [nombre, tot.rows[0].total, req.params.id]
    )
    res.json(await portalPresupuesto(req.params.id, req.clienteId))
  } catch (e) { next(e) }
})

portal.post('/presupuestos/:id/rechazar', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE presupuestos SET estado='rechazado'
        WHERE id=$1 AND cliente_id=$2 AND estado='enviado' RETURNING id`,
      [req.params.id, req.clienteId]
    )
    if (!rows[0]) return res.status(409).json({ error: 'No se pudo rechazar.' })
    res.json(await portalPresupuesto(req.params.id, req.clienteId))
  } catch (e) { next(e) }
})

app.use('/api/portal', portal)

app.use('/api', api)

// Error handler de la API
app.use('/api', (err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? 'El archivo supera el límite de 15 MB.'
      : 'No se pudo subir el archivo.'
    return res.status(400).json({ error: msg })
  }
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
