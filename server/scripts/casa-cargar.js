// Carga inicial de /casa desde un JSON local (no se versiona: tiene datos personales).
// Uso: node server/scripts/casa-cargar.js <archivo.json>
// Formato: { "config": {...}, "movimientos": [...], "flujo": [...], "porCobrar": [...] }
// Solo carga en tablas vacías, para no duplicar si se corre dos veces.
import 'dotenv/config'
import fs from 'node:fs'
import { pool, initDb } from '../db.js'

const file = process.argv[2]
if (!file) { console.error('Uso: node server/scripts/casa-cargar.js <archivo.json>'); process.exit(1) }
const data = JSON.parse(fs.readFileSync(file, 'utf8'))

await initDb()
const vacia = async (t) => Number((await pool.query(`SELECT count(*) FROM ${t}`)).rows[0].count) === 0

if (data.config && (await vacia('casa_config'))) {
  await pool.query('INSERT INTO casa_config (id, datos) VALUES (1, $1)', [JSON.stringify(data.config)])
  console.log('[casa] config cargada')
}
if (Array.isArray(data.movimientos) && (await vacia('casa_movimientos'))) {
  for (const m of data.movimientos) {
    await pool.query(
      `INSERT INTO casa_movimientos (concepto, monto, moneda, categoria, fecha, quien, nota, cuota_n)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [m.concepto, m.monto, m.moneda || 'USD', m.categoria || 'Otro', m.fecha || null, m.quien || 'Ambos', m.nota || null, m.cuota_n || null]
    )
  }
  console.log(`[casa] ${data.movimientos.length} movimientos cargados`)
}
if (Array.isArray(data.flujo) && (await vacia('casa_flujo'))) {
  for (const f of data.flujo) {
    await pool.query(
      'INSERT INTO casa_flujo (tipo, quien, concepto, monto, moneda) VALUES ($1,$2,$3,$4,$5)',
      [f.tipo, f.quien, f.concepto, f.monto, f.moneda || 'USD']
    )
  }
  console.log(`[casa] ${data.flujo.length} ítems de flujo cargados`)
}
if (Array.isArray(data.porCobrar) && (await vacia('casa_por_cobrar'))) {
  for (const p of data.porCobrar) {
    await pool.query(
      'INSERT INTO casa_por_cobrar (origen, concepto, monto, moneda, fecha) VALUES ($1,$2,$3,$4,$5)',
      [p.origen || 'Margon', p.concepto, p.monto, p.moneda || 'USD', p.fecha || null]
    )
  }
  console.log(`[casa] ${data.porCobrar.length} cobros pendientes cargados`)
}
await pool.end()
