// Carga una carpeta de imágenes en /tele, para arrancar con lo que la tele ya tiene.
// Uso: node server/scripts/tele-cargar.js <carpeta> <foto|fondo>
// En producción: railway run node server/scripts/tele-cargar.js <carpeta> fondo
// Si la carpeta tiene un lugares.json ({ "archivo.jpg": ["Lugar", "Dónde queda", "Crédito"] })
// se usa para nombrar los fondos. Las imágenes que ya están (mismo contenido) no se duplican.
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { pool, initDb } from '../db.js'

const [carpeta, tipo] = process.argv.slice(2)
if (!carpeta || !['foto', 'fondo'].includes(tipo)) {
  console.error('Uso: node server/scripts/tele-cargar.js <carpeta> <foto|fondo>')
  process.exit(1)
}

// Ancho y alto leídos del propio JPEG (marcador SOF), sin dependencias.
function medidasJpeg(buf) {
  let i = 2
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null
    const m = buf[i + 1]
    const largo = buf.readUInt16BE(i + 2)
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { alto: buf.readUInt16BE(i + 5), ancho: buf.readUInt16BE(i + 7) }
    i += 2 + largo
  }
  return null
}

const lugaresPath = path.join(carpeta, 'lugares.json')
const lugares = fs.existsSync(lugaresPath) ? JSON.parse(fs.readFileSync(lugaresPath, 'utf8')) : {}
const archivos = fs.readdirSync(carpeta).filter((f) => /\.jpe?g$/i.test(f)).sort()

await initDb()
const { rows: ya } = await pool.query('SELECT hash FROM tele_fotos WHERE tipo = $1', [tipo])
const hashes = new Set(ya.map((r) => r.hash))
let orden = (await pool.query('SELECT COALESCE(MAX(orden), 0) AS n FROM tele_fotos WHERE tipo = $1', [tipo])).rows[0].n
let nuevas = 0
for (const nombre of archivos) {
  const datos = fs.readFileSync(path.join(carpeta, nombre))
  const hash = crypto.createHash('sha1').update(datos).digest('hex')
  if (hashes.has(hash)) continue
  const [titulo, lugar, credito] = lugares[nombre] || []
  const med = medidasJpeg(datos) || {}
  await pool.query(
    `INSERT INTO tele_fotos (tipo, titulo, lugar, credito, mime, ancho, alto, tamano, hash, datos, orden)
     VALUES ($1,$2,$3,$4,'image/jpeg',$5,$6,$7,$8,$9,$10)`,
    [tipo, titulo || null, lugar || null, credito || null, med.ancho || null, med.alto || null, datos.length, hash, datos, ++orden]
  )
  nuevas++
}
console.log(`[tele] ${tipo}: ${nuevas} imágenes cargadas, ${archivos.length - nuevas} ya estaban`)
await pool.end()
