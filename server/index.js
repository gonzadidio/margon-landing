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
    const { rows } = await pool.query('SELECT * FROM clientes ORDER BY nombre')
    res.json(rows)
  } catch (e) { next(e) }
})

api.post('/clientes', async (req, res, next) => {
  try {
    const { nombre, email, telefono, proyecto, monto_mensual, estado, notas } = req.body
    const { rows } = await pool.query(
      `INSERT INTO clientes (nombre, email, telefono, proyecto, monto_mensual, estado, notas)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,'activo'),$7) RETURNING *`,
      [nombre, email, telefono, proyecto, monto_mensual || 0, estado, notas]
    )
    res.status(201).json(rows[0])
  } catch (e) { next(e) }
})

api.put('/clientes/:id', async (req, res, next) => {
  try {
    const { nombre, email, telefono, proyecto, monto_mensual, estado, notas } = req.body
    const { rows } = await pool.query(
      `UPDATE clientes SET nombre=$1, email=$2, telefono=$3, proyecto=$4,
         monto_mensual=$5, estado=$6, notas=$7 WHERE id=$8 RETURNING *`,
      [nombre, email, telefono, proyecto, monto_mensual || 0, estado, notas, req.params.id]
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

// ---------- Cobros / Facturación ----------
api.get('/cobros', async (req, res, next) => {
  try {
    const { periodo } = req.query
    const params = []
    let where = ''
    if (periodo) { params.push(periodo); where = 'WHERE c.periodo = $1' }
    const { rows } = await pool.query(
      `SELECT c.*, cl.nombre AS cliente_nombre
         FROM cobros c JOIN clientes cl ON cl.id = c.cliente_id
         ${where}
         ORDER BY cl.nombre`,
      params
    )
    res.json(rows)
  } catch (e) { next(e) }
})

// Crea un cobro por cada cliente activo para el período (idempotente)
api.post('/cobros/generar', async (req, res, next) => {
  try {
    const { periodo } = req.body
    if (!/^\d{4}-\d{2}$/.test(periodo || '')) {
      return res.status(400).json({ error: 'periodo debe tener formato YYYY-MM' })
    }
    const { rows } = await pool.query(
      `INSERT INTO cobros (cliente_id, periodo, monto)
         SELECT id, $1, monto_mensual FROM clientes
         WHERE estado = 'activo' AND monto_mensual > 0
       ON CONFLICT (cliente_id, periodo) DO NOTHING
       RETURNING *`,
      [periodo]
    )
    res.json({ creados: rows.length, cobros: rows })
  } catch (e) { next(e) }
})

api.put('/cobros/:id', async (req, res, next) => {
  try {
    const { monto, estado, fecha_pago, notas } = req.body
    // Si pasa a pagado y no mandan fecha, usamos hoy; si vuelve a pendiente, la limpiamos.
    const fp = estado === 'pagado' ? (fecha_pago || new Date().toISOString().slice(0, 10))
             : estado === 'pendiente' || estado === 'vencido' ? null
             : fecha_pago
    const { rows } = await pool.query(
      `UPDATE cobros SET monto=COALESCE($1,monto), estado=COALESCE($2,estado),
         fecha_pago=$3, notas=$4 WHERE id=$5 RETURNING *`,
      [monto, estado, fp, notas, req.params.id]
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

// ---------- Resumen del mes ----------
api.get('/resumen', async (req, res, next) => {
  try {
    const { periodo } = req.query
    const { rows } = await pool.query(
      `SELECT
         COALESCE(SUM(monto),0)                                        AS facturado,
         COALESCE(SUM(monto) FILTER (WHERE estado='pagado'),0)         AS cobrado,
         COALESCE(SUM(monto) FILTER (WHERE estado<>'pagado'),0)        AS pendiente,
         COUNT(*)                                                      AS cantidad,
         COUNT(*) FILTER (WHERE estado='pagado')                       AS pagados
       FROM cobros WHERE periodo = $1`,
      [periodo]
    )
    res.json(rows[0])
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
