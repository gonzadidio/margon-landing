import express from 'express'
import { pool } from '../db.js'
import { hashPassword, verifyPassword, signClientToken, verifyClientToken } from '../auth.js'
import { comprobantePdf, nroComprobante } from '../pdf.js'

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

// Comprobante en PDF de un cobro propio (mismo documento que manda Margon por mail).
portal.get('/cobros/:id/comprobante.pdf', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id = c.id) AS pagado,
              cl.nombre AS cliente_nombre, cl.email AS cliente_email, cl.proyecto AS cliente_proyecto
         FROM cobros c JOIN clientes cl ON cl.id = c.cliente_id
        WHERE c.id = $1 AND c.cliente_id = $2`, [req.params.id, req.clienteId])
    const cobro = rows[0]
    if (!cobro) return res.status(404).json({ error: 'Cobro no encontrado' })
    const pdf = await comprobantePdf({ cobro, cliente: { nombre: cobro.cliente_nombre, email: cobro.cliente_email, proyecto: cobro.cliente_proyecto } })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="comprobante-${nroComprobante(cobro)}.pdf"`)
    res.send(pdf)
  } catch (e) { next(e) }
})

export default portal
