import { Router } from 'express'
import { pool } from '../db.js'
import { verifyPassword, signCasaToken, verifyCasaToken } from '../auth.js'

// API de /casa (Lote 137). Todo menos /login exige un token con rol 'casa'.
const casa = Router()

const MONEDAS = ['USD', 'ARS']
const QUIEN = ['Gonza', 'Martina', 'Ambos']
const TIPOS = ['ingreso', 'gasto']

const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const fail = (status, message) => Object.assign(new Error(message), { status })

// Normaliza y valida un movimiento o un ítem de flujo. Tira 400 si algo no cierra.
function limpiarMovimiento(b = {}) {
  const concepto = String(b.concepto || '').trim()
  const monto = Number(b.monto)
  if (!concepto) throw fail(400, 'Falta el concepto.')
  if (!Number.isFinite(monto) || monto <= 0) throw fail(400, 'El monto tiene que ser un número mayor a cero.')
  const moneda = MONEDAS.includes(b.moneda) ? b.moneda : 'USD'
  const fecha = b.fecha && /^\d{4}-\d{2}-\d{2}$/.test(b.fecha) ? b.fecha : null
  return {
    concepto, monto, moneda, fecha,
    categoria: String(b.categoria || 'Otro').trim().slice(0, 40) || 'Otro',
    quien: QUIEN.includes(b.quien) ? b.quien : 'Ambos',
    nota: b.nota ? String(b.nota).trim().slice(0, 500) : null,
  }
}

function limpiarFlujo(b = {}) {
  const concepto = String(b.concepto || '').trim()
  const monto = Number(b.monto)
  if (!concepto) throw fail(400, 'Falta el concepto.')
  if (!Number.isFinite(monto) || monto <= 0) throw fail(400, 'El monto tiene que ser un número mayor a cero.')
  if (!TIPOS.includes(b.tipo)) throw fail(400, 'El tipo tiene que ser ingreso o gasto.')
  // En cuotas: solo gastos, con cantidad y mes de la primera (AAAA-MM).
  let cuotas_total = null, cuota_desde = null
  if (b.tipo === 'gasto' && b.cuotas_total) {
    cuotas_total = Number(b.cuotas_total)
    if (!Number.isInteger(cuotas_total) || cuotas_total < 1 || cuotas_total > 600) throw fail(400, 'La cantidad de cuotas no es válida.')
    const m = String(b.cuota_desde || '').match(/^(\d{4})-(\d{2})/)
    if (!m) throw fail(400, 'Falta el mes de la primera cuota.')
    cuota_desde = `${m[1]}-${m[2]}-01`
  }
  return {
    tipo: b.tipo, concepto, monto, cuotas_total, cuota_desde,
    quien: QUIEN.includes(b.quien) ? b.quien : 'Ambos',
    moneda: MONEDAS.includes(b.moneda) ? b.moneda : 'USD',
  }
}

const num = (r) => ({ ...r, monto: Number(r.monto) })

// ---------- Público ----------
casa.post('/login', h(async (req, res) => {
  const usuario = String(req.body?.usuario || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const { rows } = await pool.query('SELECT id, nombre, password_hash FROM casa_usuarios WHERE usuario = $1', [usuario])
  const u = rows[0]
  if (!u || !verifyPassword(password, u.password_hash)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
  }
  await pool.query('UPDATE casa_usuarios SET last_login = now() WHERE id = $1', [u.id])
  res.json({ token: signCasaToken(u.id), usuario: { id: u.id, nombre: u.nombre } })
}))

// ---------- Privado ----------
casa.use(verifyCasaToken)

// Todo el estado de una: es poco y la pantalla lo necesita entero.
casa.get('/estado', h(async (req, res) => {
  const [me, usuarios, config, movs, flujo, porCobrar] = await Promise.all([
    pool.query('SELECT id, nombre FROM casa_usuarios WHERE id = $1', [req.casaUid]),
    pool.query('SELECT id, nombre FROM casa_usuarios ORDER BY id'),
    pool.query(`SELECT c.datos, c.updated_at, u.nombre AS updated_by
                FROM casa_config c LEFT JOIN casa_usuarios u ON u.id = c.updated_by WHERE c.id = 1`),
    pool.query(`SELECT m.*, u.nombre AS creado_por_nombre FROM casa_movimientos m
                LEFT JOIN casa_usuarios u ON u.id = m.creado_por
                ORDER BY m.fecha NULLS FIRST, m.id`),
    pool.query('SELECT * FROM casa_flujo ORDER BY tipo, quien, id'),
    pool.query('SELECT * FROM casa_por_cobrar ORDER BY cobrado, fecha NULLS LAST, id'),
  ])
  if (!me.rows[0]) throw fail(401, 'Usuario inexistente')
  res.json({
    yo: me.rows[0],
    usuarios: usuarios.rows,
    config: config.rows[0] || { datos: {}, updated_at: null, updated_by: null },
    movimientos: movs.rows.map(num),
    flujo: flujo.rows.map(num),
    porCobrar: porCobrar.rows.map(num),
  })
}))

casa.put('/config', h(async (req, res) => {
  const datos = req.body?.datos
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) throw fail(400, 'Datos inválidos')
  const { rows } = await pool.query(
    `INSERT INTO casa_config (id, datos, updated_by, updated_at) VALUES (1, $1, $2, now())
     ON CONFLICT (id) DO UPDATE SET datos = EXCLUDED.datos, updated_by = EXCLUDED.updated_by, updated_at = now()
     RETURNING datos, updated_at`,
    [JSON.stringify(datos), req.casaUid]
  )
  res.json(rows[0])
}))

// ---------- Movimientos ----------
casa.post('/movimientos', h(async (req, res) => {
  const m = limpiarMovimiento(req.body)
  const { rows } = await pool.query(
    `INSERT INTO casa_movimientos (concepto, monto, moneda, categoria, fecha, quien, nota, creado_por)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [m.concepto, m.monto, m.moneda, m.categoria, m.fecha, m.quien, m.nota, req.casaUid]
  )
  res.status(201).json(num(rows[0]))
}))

casa.put('/movimientos/:id', h(async (req, res) => {
  const m = limpiarMovimiento(req.body)
  const { rows } = await pool.query(
    `UPDATE casa_movimientos SET concepto=$1, monto=$2, moneda=$3, categoria=$4, fecha=$5, quien=$6, nota=$7
     WHERE id=$8 RETURNING *`,
    [m.concepto, m.monto, m.moneda, m.categoria, m.fecha, m.quien, m.nota, Number(req.params.id)]
  )
  if (!rows[0]) throw fail(404, 'Ese gasto ya no existe')
  res.json(num(rows[0]))
}))

casa.delete('/movimientos/:id', h(async (req, res) => {
  await pool.query('DELETE FROM casa_movimientos WHERE id = $1', [Number(req.params.id)])
  res.status(204).end()
}))

// Marcar / desmarcar una cuota del plan del lote. Crea o borra su movimiento.
casa.post('/cuotas/:n', h(async (req, res) => {
  const n = Number(req.params.n)
  if (!Number.isInteger(n) || n < 1 || n > 600) throw fail(400, 'Número de cuota inválido')
  const { rows: cfg } = await pool.query('SELECT datos FROM casa_config WHERE id = 1')
  const d = cfg[0]?.datos || {}
  const monto = Number(req.body?.monto) || Number(d.cuota)
  if (!monto) throw fail(400, 'Cargá el valor de la cuota antes de marcarla')
  const fecha = req.body?.fecha && /^\d{4}-\d{2}-\d{2}$/.test(req.body.fecha) ? req.body.fecha : new Date().toISOString().slice(0, 10)
  const { rows } = await pool.query(
    `INSERT INTO casa_movimientos (concepto, monto, moneda, categoria, fecha, quien, cuota_n, creado_por)
     VALUES ($1,$2,'USD','Terreno',$3,$4,$5,$6)
     ON CONFLICT (cuota_n) DO NOTHING RETURNING *`,
    [`Cuota ${n}/${d.cuotas || 60}`, monto, fecha, QUIEN.includes(req.body?.quien) ? req.body.quien : 'Ambos', n, req.casaUid]
  )
  res.status(201).json(rows[0] ? num(rows[0]) : null)
}))

casa.delete('/cuotas/:n', h(async (req, res) => {
  await pool.query('DELETE FROM casa_movimientos WHERE cuota_n = $1', [Number(req.params.n)])
  res.status(204).end()
}))

// ---------- Ingresos y gastos fijos ----------
casa.post('/flujo', h(async (req, res) => {
  const f = limpiarFlujo(req.body)
  const { rows } = await pool.query(
    `INSERT INTO casa_flujo (tipo, quien, concepto, monto, moneda, cuotas_total, cuota_desde, creado_por)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [f.tipo, f.quien, f.concepto, f.monto, f.moneda, f.cuotas_total, f.cuota_desde, req.casaUid]
  )
  res.status(201).json(num(rows[0]))
}))

casa.put('/flujo/:id', h(async (req, res) => {
  const f = limpiarFlujo(req.body)
  const { rows } = await pool.query(
    'UPDATE casa_flujo SET tipo=$1, quien=$2, concepto=$3, monto=$4, moneda=$5, cuotas_total=$6, cuota_desde=$7 WHERE id=$8 RETURNING *',
    [f.tipo, f.quien, f.concepto, f.monto, f.moneda, f.cuotas_total, f.cuota_desde, Number(req.params.id)]
  )
  if (!rows[0]) throw fail(404, 'Ese ítem ya no existe')
  res.json(num(rows[0]))
}))

casa.delete('/flujo/:id', h(async (req, res) => {
  await pool.query('DELETE FROM casa_flujo WHERE id = $1', [Number(req.params.id)])
  res.status(204).end()
}))

// ---------- Plata por cobrar ----------
function limpiarPorCobrar(b = {}) {
  const concepto = String(b.concepto || '').trim()
  const monto = Number(b.monto)
  if (!concepto) throw fail(400, 'Falta el concepto.')
  if (!Number.isFinite(monto) || monto <= 0) throw fail(400, 'El monto tiene que ser un número mayor a cero.')
  return {
    concepto, monto,
    origen: String(b.origen || 'Margon').trim().slice(0, 60) || 'Margon',
    moneda: MONEDAS.includes(b.moneda) ? b.moneda : 'USD',
    fecha: b.fecha && /^\d{4}-\d{2}-\d{2}$/.test(b.fecha) ? b.fecha : null,
  }
}

casa.post('/por-cobrar', h(async (req, res) => {
  const p = limpiarPorCobrar(req.body)
  const { rows } = await pool.query(
    `INSERT INTO casa_por_cobrar (origen, concepto, monto, moneda, fecha, creado_por)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [p.origen, p.concepto, p.monto, p.moneda, p.fecha, req.casaUid]
  )
  res.status(201).json(num(rows[0]))
}))

casa.put('/por-cobrar/:id', h(async (req, res) => {
  const p = limpiarPorCobrar(req.body)
  const { rows } = await pool.query(
    'UPDATE casa_por_cobrar SET origen=$1, concepto=$2, monto=$3, moneda=$4, fecha=$5 WHERE id=$6 RETURNING *',
    [p.origen, p.concepto, p.monto, p.moneda, p.fecha, Number(req.params.id)]
  )
  if (!rows[0]) throw fail(404, 'Ese cobro ya no existe')
  res.json(num(rows[0]))
}))

casa.patch('/por-cobrar/:id/cobrado', h(async (req, res) => {
  const cobrado = !!req.body?.cobrado
  const { rows } = await pool.query(
    `UPDATE casa_por_cobrar SET cobrado=$1, cobrado_at=CASE WHEN $1 THEN now() ELSE NULL END
     WHERE id=$2 AND cobrado <> $1 RETURNING *`,
    [cobrado, Number(req.params.id)]
  )
  // Sin fila = ya estaba en ese estado: el cliente no tiene que tocar el ahorro.
  res.json({ cambio: !!rows[0], item: rows[0] ? num(rows[0]) : null })
}))

casa.delete('/por-cobrar/:id', h(async (req, res) => {
  await pool.query('DELETE FROM casa_por_cobrar WHERE id = $1', [Number(req.params.id)])
  res.status(204).end()
}))

export default casa
