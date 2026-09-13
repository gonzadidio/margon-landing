import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, initDb } from './db.js'
import { login } from './auth.js'
import admin from './routes/admin.js'
import portal from './routes/portal.js'
import { iniciarResumenDiario } from './digest.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

const app = express()
app.set('trust proxy', true)
app.use(express.json({ limit: '1mb' }))

// ---------- Público ----------
app.post('/api/login', login)

// Recibe la selección del configurador (/presupuesto o /p/:slug) y la guarda.
app.post('/api/presupuesto', async (req, res, next) => {
  try {
    const { nombre, email, telefono, origen, modulos, total, moneda, mensaje } = req.body || {}
    const mods = Array.isArray(modulos) ? modulos : []
    const { rows } = await pool.query(
      `INSERT INTO solicitudes_presupuesto (nombre, email, telefono, origen, modulos, total, moneda, mensaje)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'USD'),$8) RETURNING id, created_at`,
      [nombre || null, email || null, telefono || null, origen || null,
        JSON.stringify(mods), Number(total) || 0, moneda || null, mensaje || null]
    )
    res.status(201).json(rows[0])
  } catch (e) { next(e) }
})

// ---------- Portal de clientes (token propio) y panel admin ----------
// El portal va antes: el router admin exige el token de admin en todo.
app.use('/api/portal', portal)
app.use('/api', admin)

// Error handler de la API
app.use('/api', (err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'El archivo supera el límite de 15 MB.' : 'No se pudo subir el archivo.'
    return res.status(400).json({ error: msg })
  }
  if (err.status && err.status < 500) return res.status(err.status).json({ error: err.message })
  console.error('[api error]', err)
  res.status(500).json({ error: err.message || 'Error interno del servidor' })
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
    iniciarResumenDiario()
  })
  .catch((e) => {
    console.error('[server] no se pudo iniciar la base de datos:', e)
    process.exit(1)
  })
