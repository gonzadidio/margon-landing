// API del panel interno (/api). Todo requiere el token de admin.
import express from 'express'
import multer from 'multer'
import { pool } from '../db.js'
import { verifyToken, randomToken } from '../auth.js'
import { getAjustes, setAjustes } from '../ajustes.js'
import { mailConfigurado, mailRemitente, enviarMail } from '../mail.js'
import { componer, plantillasEfectivas, PLANTILLAS_DEFAULT, VARIABLES } from '../mensajes.js'
import { comprobantePdf, nroComprobante } from '../pdf.js'
import { resumenHoy } from '../hoy.js'
import { enviarResumenAhora } from '../digest.js'
import { telefonoWa, hoyAR } from '../formato.js'

const api = express.Router()
api.use(verifyToken)

// Archivos en memoria (van a Postgres como bytea). Límite 15 MB.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } })

// Envuelve un handler async para que los errores vayan al error handler.
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const fail = (status, msg) => { const e = new Error(msg); e.status = status; return e }
const esPeriodo = (p) => /^\d{4}-\d{2}$/.test(p || '')
const num = (v) => (v === '' || v == null ? null : Number(v))
const txt = (v) => (v == null ? null : String(v).trim() || null)

// ---------- Fragmentos SQL reutilizados ----------
const PAGADO = `(SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id = c.id)`
const ULTIMO_ENVIO = `(SELECT json_build_object('id', e.id, 'canal', e.canal, 'tipo', e.tipo, 'fecha', e.created_at)
                        FROM envios e WHERE e.cobro_id = c.id ORDER BY e.created_at DESC LIMIT 1)`
const COBRO_SELECT = `
  SELECT c.*, ${PAGADO} AS pagado, ${ULTIMO_ENVIO} AS ultimo_envio,
         cl.nombre AS cliente_nombre, cl.email AS cliente_email,
         cl.telefono AS cliente_telefono, cl.proyecto AS cliente_proyecto
    FROM cobros c JOIN clientes cl ON cl.id = c.cliente_id`

async function cobroPorId(id) {
  const { rows } = await pool.query(`${COBRO_SELECT} WHERE c.id = $1`, [id])
  return rows[0] || null
}

// Recalcula estado y fecha_pago de un cobro según la suma de sus pagos.
async function recomputeCobro(id) {
  await pool.query(
    `UPDATE cobros c SET
        estado = CASE WHEN pg.pagado >= c.monto AND c.monto > 0 THEN 'pagado'
                      WHEN pg.pagado > 0 THEN 'parcial' ELSE 'pendiente' END,
        fecha_pago = CASE WHEN pg.pagado >= c.monto AND c.monto > 0 THEN pg.ult ELSE NULL END
       FROM (SELECT COALESCE(SUM(monto),0) AS pagado, MAX(fecha) AS ult FROM pagos WHERE cobro_id = $1) pg
      WHERE c.id = $1`, [id])
}

// ============================================================
//  HOY
// ============================================================
api.get('/hoy', h(async (_req, res) => res.json(await resumenHoy())))

// ============================================================
//  CLIENTES
// ============================================================
api.get('/clientes', h(async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT c.id, c.nombre, c.email, c.telefono, c.proyecto, c.monto_mensual, c.moneda, c.estado,
           c.dia_cobro, c.sitio_url, c.canal, c.fecha_alta, c.portal_activo, c.created_at,
           (SELECT COUNT(*) FROM proyectos p WHERE p.cliente_id = c.id) AS proyectos_count,
           (SELECT COUNT(*) FROM cobros co WHERE co.cliente_id = c.id
              AND co.monto > (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id = co.id)) AS pendientes_count,
           (SELECT COALESCE(SUM(co.monto - (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id = co.id)),0)
              FROM cobros co WHERE co.cliente_id = c.id AND co.moneda = c.moneda
               AND co.monto > (SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id = co.id)) AS deuda
      FROM clientes c
     ORDER BY (c.estado = 'activo') DESC, c.nombre`)
  res.json(rows)
}))

api.get('/clientes/:id', h(async (req, res) => {
  const id = req.params.id
  const cli = await pool.query('SELECT * FROM clientes WHERE id = $1', [id])
  if (!cli.rows[0]) throw fail(404, 'Cliente no encontrado')
  const [cobros, proyectos, notas, archivos, presupuestos, envios, recordatorios] = await Promise.all([
    pool.query(`${COBRO_SELECT} WHERE c.cliente_id = $1 ORDER BY c.periodo DESC, c.id DESC`, [id]),
    pool.query('SELECT * FROM proyectos WHERE cliente_id = $1 ORDER BY created_at DESC', [id]),
    pool.query(`SELECT s.*, p.nombre AS proyecto_nombre FROM seguimientos s
                  LEFT JOIN proyectos p ON p.id = s.proyecto_id
                 WHERE s.cliente_id = $1 ORDER BY s.completado, s.fecha DESC, s.id DESC`, [id]),
    pool.query(`SELECT a.id, a.categoria, a.nombre, a.mime, a.tamano, a.descripcion, a.created_at, a.proyecto_id
                  FROM archivos a WHERE a.cliente_id = $1 ORDER BY a.created_at DESC`, [id]),
    pool.query(`SELECT p.*,
                  (SELECT COALESCE(SUM(costo),0) FROM presupuesto_items i WHERE i.presupuesto_id = p.id AND i.seleccionado) AS total_elegido,
                  (SELECT COUNT(*) FROM presupuesto_items i WHERE i.presupuesto_id = p.id) AS items_count
                  FROM presupuestos p WHERE p.cliente_id = $1 ORDER BY p.created_at DESC`, [id]),
    pool.query('SELECT * FROM envios WHERE cliente_id = $1 ORDER BY created_at DESC LIMIT 30', [id]),
    pool.query('SELECT * FROM recordatorios WHERE cliente_id = $1 AND hecho = false ORDER BY (fecha IS NULL), fecha', [id]),
  ])
  const cliente = { ...cli.rows[0] }
  delete cliente.portal_password_hash; delete cliente.portal_invite_token
  res.json({
    ...cliente, whatsapp: telefonoWa(cliente.telefono),
    cobros: cobros.rows, proyectos: proyectos.rows, notas: notas.rows, archivos: archivos.rows,
    presupuestos: presupuestos.rows, envios: envios.rows, recordatorios: recordatorios.rows,
  })
}))

const CLIENTE_CAMPOS = ['nombre', 'email', 'telefono', 'proyecto', 'monto_mensual', 'moneda', 'estado',
  'dia_cobro', 'sitio_url', 'canal', 'fecha_alta', 'notas']
function clienteBody(b) {
  return {
    nombre: txt(b.nombre), email: txt(b.email), telefono: txt(b.telefono), proyecto: txt(b.proyecto),
    monto_mensual: num(b.monto_mensual) ?? 0, moneda: b.moneda || 'ARS',
    estado: b.estado || 'activo', dia_cobro: num(b.dia_cobro), sitio_url: txt(b.sitio_url),
    canal: txt(b.canal), fecha_alta: b.fecha_alta || null, notas: txt(b.notas),
  }
}

api.post('/clientes', h(async (req, res) => {
  const c = clienteBody(req.body || {})
  if (!c.nombre) throw fail(400, 'Falta el nombre')
  const { rows } = await pool.query(
    `INSERT INTO clientes (${CLIENTE_CAMPOS.join(',')})
     VALUES (${CLIENTE_CAMPOS.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`,
    CLIENTE_CAMPOS.map((k) => c[k]))
  res.status(201).json(rows[0])
}))

api.put('/clientes/:id', h(async (req, res) => {
  const c = clienteBody(req.body || {})
  if (!c.nombre) throw fail(400, 'Falta el nombre')
  const { rows } = await pool.query(
    `UPDATE clientes SET ${CLIENTE_CAMPOS.map((k, i) => `${k}=$${i + 1}`).join(',')}
      WHERE id=$${CLIENTE_CAMPOS.length + 1} RETURNING *`,
    [...CLIENTE_CAMPOS.map((k) => c[k]), req.params.id])
  if (!rows[0]) throw fail(404, 'Cliente no encontrado')
  res.json(rows[0])
}))

api.delete('/clientes/:id', h(async (req, res) => {
  await pool.query('DELETE FROM clientes WHERE id = $1', [req.params.id])
  res.status(204).end()
}))

// Link de invitación al portal (14 días). Devuelve el link completo.
api.post('/clientes/:id/portal-invite', h(async (req, res) => {
  const token = randomToken()
  const { rows } = await pool.query(
    `UPDATE clientes SET portal_invite_token=$1, portal_token_exp = now() + interval '14 days'
      WHERE id=$2 RETURNING id`, [token, req.params.id])
  if (!rows[0]) throw fail(404, 'Cliente no encontrado')
  const proto = req.headers['x-forwarded-proto'] || req.protocol
  res.json({ token, link: `${proto}://${req.get('host')}/portal/activar?token=${token}` })
}))

// ============================================================
//  PROYECTOS
// ============================================================
const PROY_CAMPOS = ['cliente_id', 'nombre', 'descripcion', 'estado', 'stack', 'repo_url', 'deploy_url', 'monto', 'moneda', 'fecha_inicio', 'fecha_fin']
const proyBody = (b) => ({
  cliente_id: b.cliente_id, nombre: txt(b.nombre), descripcion: txt(b.descripcion), estado: b.estado || 'desarrollo',
  stack: txt(b.stack), repo_url: txt(b.repo_url), deploy_url: txt(b.deploy_url), monto: num(b.monto) ?? 0,
  moneda: b.moneda || 'ARS', fecha_inicio: b.fecha_inicio || null, fecha_fin: b.fecha_fin || null,
})
api.post('/proyectos', h(async (req, res) => {
  const p = proyBody(req.body || {})
  if (!p.cliente_id || !p.nombre) throw fail(400, 'Faltan cliente o nombre')
  const { rows } = await pool.query(
    `INSERT INTO proyectos (${PROY_CAMPOS.join(',')}) VALUES (${PROY_CAMPOS.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`,
    PROY_CAMPOS.map((k) => p[k]))
  res.status(201).json(rows[0])
}))
api.put('/proyectos/:id', h(async (req, res) => {
  const p = proyBody(req.body || {})
  const campos = PROY_CAMPOS.filter((k) => k !== 'cliente_id')
  const { rows } = await pool.query(
    `UPDATE proyectos SET ${campos.map((k, i) => `${k}=$${i + 1}`).join(',')} WHERE id=$${campos.length + 1} RETURNING *`,
    [...campos.map((k) => p[k]), req.params.id])
  if (!rows[0]) throw fail(404, 'Proyecto no encontrado')
  res.json(rows[0])
}))
api.delete('/proyectos/:id', h(async (req, res) => {
  await pool.query('DELETE FROM proyectos WHERE id = $1', [req.params.id]); res.status(204).end()
}))

// ============================================================
//  NOTAS / SEGUIMIENTO (tabla seguimientos)
// ============================================================
api.post('/notas', h(async (req, res) => {
  const b = req.body || {}
  if (!b.cliente_id || !txt(b.titulo)) throw fail(400, 'Faltan cliente o título')
  const { rows } = await pool.query(
    `INSERT INTO seguimientos (cliente_id, proyecto_id, tipo, titulo, detalle, fecha, proxima_accion, proxima_fecha)
     VALUES ($1,$2,$3,$4,$5,COALESCE($6,CURRENT_DATE),$7,$8) RETURNING *`,
    [b.cliente_id, b.proyecto_id || null, b.tipo || 'nota', txt(b.titulo), txt(b.detalle), b.fecha || null,
      txt(b.proxima_accion), b.proxima_fecha || null])
  res.status(201).json(rows[0])
}))
api.put('/notas/:id', h(async (req, res) => {
  const b = req.body || {}
  const { rows } = await pool.query(
    `UPDATE seguimientos SET tipo=COALESCE($1,tipo), titulo=COALESCE($2,titulo), detalle=COALESCE($3,detalle),
       fecha=COALESCE($4,fecha), proxima_accion=COALESCE($5,proxima_accion), proxima_fecha=$6,
       completado=COALESCE($7,completado), proyecto_id=$8
     WHERE id=$9 RETURNING *`,
    [b.tipo, txt(b.titulo), b.detalle == null ? null : String(b.detalle), b.fecha || null, b.proxima_accion == null ? null : String(b.proxima_accion),
      b.proxima_fecha || null, typeof b.completado === 'boolean' ? b.completado : null, b.proyecto_id || null, req.params.id])
  if (!rows[0]) throw fail(404, 'Nota no encontrada')
  res.json(rows[0])
}))
api.delete('/notas/:id', h(async (req, res) => {
  await pool.query('DELETE FROM seguimientos WHERE id = $1', [req.params.id]); res.status(204).end()
}))

// ============================================================
//  ARCHIVOS
// ============================================================
api.post('/clientes/:id/archivos', upload.single('archivo'), h(async (req, res) => {
  if (!req.file) throw fail(400, 'Falta el archivo')
  const { categoria, descripcion, proyecto_id } = req.body || {}
  const { rows } = await pool.query(
    `INSERT INTO archivos (cliente_id, proyecto_id, categoria, nombre, mime, tamano, datos, descripcion)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, categoria, nombre, mime, tamano, descripcion, created_at, proyecto_id`,
    [req.params.id, proyecto_id || null, categoria || 'otro', req.file.originalname, req.file.mimetype,
      req.file.size, req.file.buffer, txt(descripcion)])
  res.status(201).json(rows[0])
}))
api.get('/archivos/:id', h(async (req, res) => {
  const { rows } = await pool.query('SELECT nombre, mime, datos FROM archivos WHERE id = $1', [req.params.id])
  if (!rows[0]) throw fail(404, 'Archivo no encontrado')
  res.setHeader('Content-Type', rows[0].mime || 'application/octet-stream')
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(rows[0].nombre)}"`)
  res.send(rows[0].datos)
}))
api.delete('/archivos/:id', h(async (req, res) => {
  await pool.query('DELETE FROM archivos WHERE id = $1', [req.params.id]); res.status(204).end()
}))

// ============================================================
//  COBROS
// ============================================================
api.get('/cobros', h(async (req, res) => {
  const { periodo, cliente_id, pendientes } = req.query
  const where = [], params = []
  if (periodo) { params.push(periodo); where.push(`c.periodo = $${params.length}`) }
  if (cliente_id) { params.push(cliente_id); where.push(`c.cliente_id = $${params.length}`) }
  if (pendientes) where.push(`c.monto > ${PAGADO}`)
  const { rows } = await pool.query(
    `${COBRO_SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY (c.vencimiento IS NULL), c.vencimiento, cl.nombre, c.id`, params)
  res.json(rows)
}))

// Resumen del mes por moneda + quiénes faltan generar.
api.get('/cobros/resumen', h(async (req, res) => {
  const periodo = esPeriodo(req.query.periodo) ? req.query.periodo : hoyAR().slice(0, 7)
  const [tot, faltan] = await Promise.all([
    pool.query(`
      SELECT c.moneda, COALESCE(SUM(c.monto),0) AS facturado, COALESCE(SUM(${PAGADO}),0) AS cobrado,
             COUNT(*) AS cantidad, COUNT(*) FILTER (WHERE ${PAGADO} >= c.monto AND c.monto > 0) AS pagados
        FROM cobros c WHERE c.periodo = $1 GROUP BY c.moneda`, [periodo]),
    pool.query(`
      SELECT id, nombre, monto_mensual, moneda FROM clientes cl
       WHERE estado = 'activo' AND monto_mensual > 0
         AND NOT EXISTS (SELECT 1 FROM cobros c WHERE c.cliente_id = cl.id AND c.periodo = $1 AND c.tipo = 'mensual')
       ORDER BY nombre`, [periodo]),
  ])
  res.json({ periodo, totales: tot.rows, sin_generar: faltan.rows })
}))

// Genera el cobro mensual de cada cliente activo para el período (idempotente).
api.post('/cobros/generar', h(async (req, res) => {
  const periodo = req.body?.periodo
  if (!esPeriodo(periodo)) throw fail(400, 'periodo debe tener formato YYYY-MM')
  const { rows } = await pool.query(
    `INSERT INTO cobros (cliente_id, periodo, monto, moneda, vencimiento, tipo)
       SELECT id, $1, monto_mensual, moneda,
              CASE WHEN dia_cobro IS NOT NULL
                   THEN (to_date($1 || '-01','YYYY-MM-DD') + (LEAST(dia_cobro, 28) - 1) * INTERVAL '1 day')::date
                   ELSE NULL END, 'mensual'
         FROM clientes WHERE estado = 'activo' AND monto_mensual > 0
     ON CONFLICT (cliente_id, periodo) WHERE tipo = 'mensual' DO NOTHING
     RETURNING id`, [periodo])
  res.json({ creados: rows.length })
}))

api.get('/cobros/:id', h(async (req, res) => {
  const c = await cobroPorId(req.params.id)
  if (!c) throw fail(404, 'Cobro no encontrado')
  const pagos = await pool.query('SELECT * FROM pagos WHERE cobro_id = $1 ORDER BY fecha, id', [c.id])
  res.json({ ...c, pagos: pagos.rows })
}))

// Cobro manual (setup, único, históricos o un mensual puntual).
api.post('/cobros', h(async (req, res) => {
  const b = req.body || {}
  if (!b.cliente_id) throw fail(400, 'Falta el cliente')
  if (!esPeriodo(b.periodo)) throw fail(400, 'periodo debe tener formato YYYY-MM')
  const monto = num(b.monto) ?? 0
  try {
    const { rows } = await pool.query(
      `INSERT INTO cobros (cliente_id, periodo, monto, moneda, tipo, concepto, fecha_emision, vencimiento, notas)
       VALUES ($1,$2,$3,COALESCE($4,'ARS'),COALESCE($5,'mensual'),$6,COALESCE($7,CURRENT_DATE),$8,$9) RETURNING id`,
      [b.cliente_id, b.periodo, monto, b.moneda, b.tipo, txt(b.concepto), b.fecha_emision || null, b.vencimiento || null, txt(b.notas)])
    const id = rows[0].id
    // "Ya está pagado": registramos el pago completo.
    if (b.pagado && monto > 0) {
      await pool.query(`INSERT INTO pagos (cobro_id, monto, fecha, metodo) VALUES ($1,$2,COALESCE($3,CURRENT_DATE),$4)`,
        [id, monto, b.fecha_pago || null, txt(b.metodo_pago)])
      if (b.metodo_pago) await pool.query('UPDATE cobros SET metodo_pago=$1 WHERE id=$2', [b.metodo_pago, id])
      await recomputeCobro(id)
    }
    res.status(201).json(await cobroPorId(id))
  } catch (e) {
    if (e.code === '23505') throw fail(409, 'Ya existe un cobro mensual para ese cliente y período.')
    throw e
  }
}))

api.put('/cobros/:id', h(async (req, res) => {
  const b = req.body || {}
  if (b.periodo && !esPeriodo(b.periodo)) throw fail(400, 'periodo debe tener formato YYYY-MM')
  try {
    const { rows } = await pool.query(
      `UPDATE cobros SET monto=COALESCE($1,monto), moneda=COALESCE($2,moneda), tipo=COALESCE($3,tipo),
         concepto=$4, periodo=COALESCE($5,periodo), vencimiento=$6, notas=$7
       WHERE id=$8 RETURNING id`,
      [num(b.monto), b.moneda || null, b.tipo || null, txt(b.concepto), b.periodo || null,
        b.vencimiento || null, txt(b.notas), req.params.id])
    if (!rows[0]) throw fail(404, 'Cobro no encontrado')
    await recomputeCobro(req.params.id)
    res.json(await cobroPorId(req.params.id))
  } catch (e) {
    if (e.code === '23505') throw fail(409, 'Ya existe un cobro mensual para ese cliente y período.')
    throw e
  }
}))

api.delete('/cobros/:id', h(async (req, res) => {
  await pool.query('DELETE FROM cobros WHERE id = $1', [req.params.id]); res.status(204).end()
}))

// Comprobante en PDF. ?concepto= permite ajustar el texto antes de generarlo.
api.get('/cobros/:id/comprobante.pdf', h(async (req, res) => {
  const cobro = await cobroPorId(req.params.id)
  if (!cobro) throw fail(404, 'Cobro no encontrado')
  const cliente = { nombre: cobro.cliente_nombre, email: cobro.cliente_email, proyecto: cobro.cliente_proyecto }
  const pdf = await comprobantePdf({ cobro, cliente, concepto: txt(req.query.concepto) })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="comprobante-${nroComprobante(cobro)}.pdf"`)
  res.send(pdf)
}))

// ---------- Pagos (abonos parciales o totales) ----------
api.post('/cobros/:id/pagos', h(async (req, res) => {
  const { monto, fecha, metodo, nota } = req.body || {}
  if (!(Number(monto) > 0)) throw fail(400, 'El monto del pago debe ser mayor a 0')
  await pool.query(`INSERT INTO pagos (cobro_id, monto, fecha, metodo, nota) VALUES ($1,$2,COALESCE($3,CURRENT_DATE),$4,$5)`,
    [req.params.id, monto, fecha || null, txt(metodo), txt(nota)])
  if (metodo) await pool.query('UPDATE cobros SET metodo_pago=$1 WHERE id=$2', [metodo, req.params.id])
  await recomputeCobro(req.params.id)
  res.status(201).json(await cobroPorId(req.params.id))
}))
api.delete('/pagos/:id', h(async (req, res) => {
  const { rows } = await pool.query('DELETE FROM pagos WHERE id = $1 RETURNING cobro_id', [req.params.id])
  if (!rows[0]) throw fail(404, 'Pago no encontrado')
  await recomputeCobro(rows[0].cobro_id)
  res.json(await cobroPorId(rows[0].cobro_id))
}))

// ============================================================
//  MENSAJES (WhatsApp / mail) — se arman acá, se mandan con un botón
// ============================================================
async function contexto(cliente_id, cobro_id) {
  let cobro = null, cliente = null
  if (cobro_id) {
    cobro = await cobroPorId(cobro_id)
    if (!cobro) throw fail(404, 'Cobro no encontrado')
    cliente_id = cobro.cliente_id
  }
  const { rows } = await pool.query('SELECT id, nombre, email, telefono, proyecto FROM clientes WHERE id = $1', [cliente_id])
  cliente = rows[0]
  if (!cliente) throw fail(404, 'Cliente no encontrado')
  return { cliente, cobro }
}

api.get('/mensajes/componer', h(async (req, res) => {
  const { tipo = 'libre', cliente_id, cobro_id, link, titulo } = req.query
  const { cliente, cobro } = await contexto(cliente_id, cobro_id)
  const ajustes = await getAjustes()
  const { asunto, cuerpo } = componer({ tipo, cliente, cobro, ajustes, extra: { link: link || '', titulo: titulo || '' } })
  res.json({
    asunto, cuerpo,
    email: cliente.email, telefono: cliente.telefono, whatsapp: telefonoWa(cliente.telefono),
    puede_email: mailConfigurado(), remitente: mailRemitente(),
  })
}))

api.post('/mensajes/enviar', h(async (req, res) => {
  const { tipo = 'libre', canal, cliente_id, cobro_id, asunto, cuerpo, adjuntar_comprobante } = req.body || {}
  if (!['email', 'whatsapp', 'mailto'].includes(canal)) throw fail(400, 'Canal inválido')
  if (!txt(cuerpo)) throw fail(400, 'El mensaje está vacío')
  const { cliente, cobro } = await contexto(cliente_id, cobro_id)

  let destino = '', extra = {}
  if (canal === 'whatsapp') {
    destino = telefonoWa(cliente.telefono)
    if (!destino) throw fail(400, 'El cliente no tiene teléfono cargado.')
    extra.wa_url = `https://wa.me/${destino}?text=${encodeURIComponent(cuerpo)}`
  } else if (canal === 'mailto') {
    destino = cliente.email
    if (!destino) throw fail(400, 'El cliente no tiene email cargado.')
    extra.mailto_url = `mailto:${destino}?subject=${encodeURIComponent(asunto || '')}&body=${encodeURIComponent(cuerpo)}`
  } else {
    destino = cliente.email
    const attachments = []
    if (adjuntar_comprobante && cobro) {
      const pdf = await comprobantePdf({ cobro, cliente: { nombre: cobro.cliente_nombre, email: cobro.cliente_email, proyecto: cobro.cliente_proyecto } })
      attachments.push({ filename: `comprobante-${nroComprobante(cobro)}.pdf`, content: pdf, contentType: 'application/pdf' })
    }
    await enviarMail({ to: destino, subject: asunto || 'Margon', text: cuerpo, attachments })
  }

  const { rows } = await pool.query(
    `INSERT INTO envios (cliente_id, cobro_id, canal, tipo, destino, asunto, cuerpo)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [cliente.id, cobro?.id || null, canal === 'mailto' ? 'email' : canal, tipo, destino, asunto || null, cuerpo])
  res.json({ ok: true, envio: rows[0], ...extra })
}))

api.get('/envios', h(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.*, cl.nombre AS cliente_nombre FROM envios e LEFT JOIN clientes cl ON cl.id = e.cliente_id
      ORDER BY e.created_at DESC LIMIT 100`)
  res.json(rows)
}))
api.delete('/envios/:id', h(async (req, res) => {
  await pool.query('DELETE FROM envios WHERE id = $1', [req.params.id]); res.status(204).end()
}))

// ============================================================
//  RECORDATORIOS
// ============================================================
api.get('/recordatorios', h(async (req, res) => {
  const todos = req.query.todos === '1'
  const { rows } = await pool.query(
    `SELECT r.*, cl.nombre AS cliente_nombre FROM recordatorios r LEFT JOIN clientes cl ON cl.id = r.cliente_id
      ${todos ? '' : 'WHERE r.hecho = false'}
      ORDER BY r.hecho, (r.fecha IS NULL), r.fecha, r.id ${todos ? 'LIMIT 200' : ''}`)
  res.json(rows)
}))
api.post('/recordatorios', h(async (req, res) => {
  const b = req.body || {}
  if (!txt(b.titulo)) throw fail(400, 'Falta el título')
  const { rows } = await pool.query(
    `INSERT INTO recordatorios (titulo, detalle, fecha, cliente_id) VALUES ($1,$2,$3,$4) RETURNING *`,
    [txt(b.titulo), txt(b.detalle), b.fecha || null, b.cliente_id || null])
  res.status(201).json(rows[0])
}))
api.put('/recordatorios/:id', h(async (req, res) => {
  const b = req.body || {}
  const { rows } = await pool.query(
    `UPDATE recordatorios SET titulo=COALESCE($1,titulo), detalle=COALESCE($2,detalle), fecha=COALESCE($3,fecha),
       cliente_id=COALESCE($4,cliente_id),
       hecho=COALESCE($5,hecho), hecho_at = CASE WHEN $5 = true THEN now() WHEN $5 = false THEN NULL ELSE hecho_at END
     WHERE id=$6 RETURNING *`,
    [txt(b.titulo), b.detalle == null ? null : String(b.detalle), b.fecha || null, b.cliente_id || null,
      typeof b.hecho === 'boolean' ? b.hecho : null, req.params.id])
  if (!rows[0]) throw fail(404, 'Recordatorio no encontrado')
  res.json(rows[0])
}))
api.delete('/recordatorios/:id', h(async (req, res) => {
  await pool.query('DELETE FROM recordatorios WHERE id = $1', [req.params.id]); res.status(204).end()
}))

// ============================================================
//  VENTAS: oportunidades + solicitudes del configurador web
// ============================================================
api.get('/oportunidades', h(async (_req, res) => {
  const { rows } = await pool.query(`SELECT o.*, cl.nombre AS cliente_nombre FROM oportunidades o
    LEFT JOIN clientes cl ON cl.id = o.cliente_id ORDER BY (o.proxima_fecha IS NULL), o.proxima_fecha, o.created_at DESC`)
  res.json(rows)
}))
const OPP_CAMPOS = ['nombre', 'tipo', 'contacto', 'canal', 'etapa', 'valor', 'moneda', 'notas', 'proxima_accion', 'proxima_fecha']
const oppBody = (b) => ({
  nombre: txt(b.nombre), tipo: b.tipo || 'lead', contacto: txt(b.contacto), canal: txt(b.canal), etapa: b.etapa || 'nuevo',
  valor: num(b.valor) ?? 0, moneda: b.moneda || 'ARS', notas: txt(b.notas), proxima_accion: txt(b.proxima_accion),
  proxima_fecha: b.proxima_fecha || null,
})
api.post('/oportunidades', h(async (req, res) => {
  const o = oppBody(req.body || {})
  if (!o.nombre) throw fail(400, 'Falta el nombre')
  const { rows } = await pool.query(
    `INSERT INTO oportunidades (${OPP_CAMPOS.join(',')}) VALUES (${OPP_CAMPOS.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`,
    OPP_CAMPOS.map((k) => o[k]))
  res.status(201).json(rows[0])
}))
api.put('/oportunidades/:id', h(async (req, res) => {
  const cur = await pool.query('SELECT * FROM oportunidades WHERE id = $1', [req.params.id])
  if (!cur.rows[0]) throw fail(404, 'No encontrada')
  const o = oppBody({ ...cur.rows[0], ...(req.body || {}) })
  const { rows } = await pool.query(
    `UPDATE oportunidades SET ${OPP_CAMPOS.map((k, i) => `${k}=$${i + 1}`).join(',')} WHERE id=$${OPP_CAMPOS.length + 1} RETURNING *`,
    [...OPP_CAMPOS.map((k) => o[k]), req.params.id])
  res.json(rows[0])
}))
api.delete('/oportunidades/:id', h(async (req, res) => {
  await pool.query('DELETE FROM oportunidades WHERE id = $1', [req.params.id]); res.status(204).end()
}))
// Lead ganado -> cliente nuevo
api.post('/oportunidades/:id/convertir', h(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM oportunidades WHERE id = $1', [req.params.id])
  const o = rows[0]
  if (!o) throw fail(404, 'No encontrada')
  if (o.cliente_id) throw fail(409, 'Esta oportunidad ya fue convertida en cliente.')
  const contacto = o.contacto || ''
  const email = contacto.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] || null
  const tel = !email && /\d{6,}/.test(contacto) ? contacto : null
  const cli = await pool.query(
    `INSERT INTO clientes (nombre, email, telefono, canal, moneda, notas, fecha_alta, estado)
     VALUES ($1,$2,$3,$4,$5,$6,CURRENT_DATE,'activo') RETURNING *`,
    [o.nombre, email, tel, o.canal, o.moneda, o.notas])
  await pool.query(`UPDATE oportunidades SET etapa='ganado', cliente_id=$1 WHERE id=$2`, [cli.rows[0].id, o.id])
  res.status(201).json(cli.rows[0])
}))

api.get('/solicitudes', h(async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM solicitudes_presupuesto ORDER BY created_at DESC')
  res.json(rows)
}))
api.put('/solicitudes/:id', h(async (req, res) => {
  const { rows } = await pool.query('UPDATE solicitudes_presupuesto SET estado=$1 WHERE id=$2 RETURNING *',
    [req.body?.estado || 'nuevo', req.params.id])
  if (!rows[0]) throw fail(404, 'No encontrada')
  res.json(rows[0])
}))
api.delete('/solicitudes/:id', h(async (req, res) => {
  await pool.query('DELETE FROM solicitudes_presupuesto WHERE id = $1', [req.params.id]); res.status(204).end()
}))
// Solicitud web -> oportunidad (lead) para seguirla desde Ventas
api.post('/solicitudes/:id/convertir', h(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM solicitudes_presupuesto WHERE id = $1', [req.params.id])
  const s = rows[0]
  if (!s) throw fail(404, 'No encontrada')
  const mods = Array.isArray(s.modulos) ? s.modulos.map((m) => m.name).filter(Boolean) : []
  const notas = [s.mensaje, mods.length ? `Módulos elegidos: ${mods.join(', ')}` : ''].filter(Boolean).join('\n')
  const opp = await pool.query(
    `INSERT INTO oportunidades (nombre, tipo, contacto, canal, etapa, valor, moneda, notas, proxima_accion, proxima_fecha)
     VALUES ($1,'lead',$2,$3,'nuevo',$4,$5,$6,'Responder la solicitud del configurador',CURRENT_DATE) RETURNING *`,
    [s.nombre || 'Solicitud web', [s.email, s.telefono].filter(Boolean).join(' · ') || null,
      s.origen ? `web · ${s.origen}` : 'web', s.total, s.moneda, notas || null])
  await pool.query(`UPDATE solicitudes_presupuesto SET estado='contactado' WHERE id=$1`, [s.id])
  res.status(201).json(opp.rows[0])
}))

// ============================================================
//  PRESUPUESTOS (los firma el cliente desde el portal)
// ============================================================
async function presupuestoConItems(id) {
  const p = await pool.query('SELECT * FROM presupuestos WHERE id=$1', [id])
  if (!p.rows[0]) return null
  const it = await pool.query('SELECT * FROM presupuesto_items WHERE presupuesto_id=$1 ORDER BY orden, id', [id])
  return { ...p.rows[0], items: it.rows }
}
async function insertItems(presupuestoId, items = []) {
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    if (!txt(it.concepto)) continue
    await pool.query(
      `INSERT INTO presupuesto_items (presupuesto_id, grupo, concepto, descripcion, costo, obligatorio, seleccionado, orden)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [presupuestoId, txt(it.grupo), txt(it.concepto), txt(it.descripcion), num(it.costo) ?? 0,
        it.obligatorio !== false, it.obligatorio !== false ? true : (it.seleccionado ?? true), i])
  }
}
api.get('/presupuestos/:id', h(async (req, res) => {
  const p = await presupuestoConItems(req.params.id)
  if (!p) throw fail(404, 'Presupuesto no encontrado')
  res.json(p)
}))
api.post('/presupuestos', h(async (req, res) => {
  const { cliente_id, titulo, descripcion, moneda, notas, items } = req.body || {}
  if (!cliente_id || !txt(titulo)) throw fail(400, 'Faltan cliente o título')
  const { rows } = await pool.query(
    `INSERT INTO presupuestos (cliente_id, titulo, descripcion, moneda, notas) VALUES ($1,$2,$3,COALESCE($4,'ARS'),$5) RETURNING id`,
    [cliente_id, txt(titulo), txt(descripcion), moneda, txt(notas)])
  await insertItems(rows[0].id, items)
  res.status(201).json(await presupuestoConItems(rows[0].id))
}))
api.put('/presupuestos/:id', h(async (req, res) => {
  const cur = await pool.query('SELECT estado FROM presupuestos WHERE id=$1', [req.params.id])
  if (!cur.rows[0]) throw fail(404, 'Presupuesto no encontrado')
  if (cur.rows[0].estado === 'aprobado') throw fail(409, 'El presupuesto ya fue firmado; no se puede editar.')
  const { titulo, descripcion, moneda, notas, items } = req.body || {}
  await pool.query(
    `UPDATE presupuestos SET titulo=COALESCE($1,titulo), descripcion=$2, moneda=COALESCE($3,moneda), notas=$4,
       version = version + 1 WHERE id=$5`,
    [txt(titulo), txt(descripcion), moneda || null, txt(notas), req.params.id])
  if (Array.isArray(items)) {
    await pool.query('DELETE FROM presupuesto_items WHERE presupuesto_id=$1', [req.params.id])
    await insertItems(req.params.id, items)
  }
  res.json(await presupuestoConItems(req.params.id))
}))
api.post('/presupuestos/:id/enviar', h(async (req, res) => {
  await pool.query(`UPDATE presupuestos SET estado='enviado', sent_at=now() WHERE id=$1 AND estado IN ('borrador','enviado','rechazado')`, [req.params.id])
  res.json(await presupuestoConItems(req.params.id))
}))
api.delete('/presupuestos/:id', h(async (req, res) => {
  await pool.query('DELETE FROM presupuestos WHERE id=$1', [req.params.id]); res.status(204).end()
}))

// ============================================================
//  AJUSTES
// ============================================================
api.get('/ajustes', h(async (_req, res) => {
  const a = await getAjustes()
  res.json({
    ...a,
    plantillas: plantillasEfectivas(a),
    plantillas_default: PLANTILLAS_DEFAULT,
    variables: VARIABLES,
    mail: { configurado: mailConfigurado(), remitente: mailRemitente() },
  })
}))
api.put('/ajustes', h(async (req, res) => {
  const b = req.body || {}
  const cambios = {}
  for (const k of ['datos_pago', 'firma', 'link_portal', 'admin_email']) if (k in b) cambios[k] = String(b[k] ?? '')
  if ('resumen_diario' in b) cambios.resumen_diario = Boolean(b.resumen_diario)
  if ('resumen_hora' in b) cambios.resumen_hora = Math.min(23, Math.max(0, Number(b.resumen_hora) || 0))
  if (b.plantillas && typeof b.plantillas === 'object') {
    const actual = (await getAjustes()).plantillas
    for (const [k, v] of Object.entries(b.plantillas)) {
      if (!(k in PLANTILLAS_DEFAULT)) continue
      if (v == null) delete actual[k]            // restaurar la de fábrica
      else actual[k] = { asunto: String(v.asunto ?? ''), cuerpo: String(v.cuerpo ?? '') }
    }
    cambios.plantillas = actual
  }
  const a = await setAjustes(cambios)
  res.json({ ...a, plantillas: plantillasEfectivas(a) })
}))
// Manda el resumen de pendientes ahora mismo al mail del admin (prueba).
api.post('/ajustes/probar-mail', h(async (req, res) => {
  const a = await getAjustes()
  const to = txt(req.body?.email) || a.admin_email
  if (!to) throw fail(400, 'Cargá tu mail primero.')
  await enviarResumenAhora(to)
  res.json({ ok: true, to })
}))

export default api
