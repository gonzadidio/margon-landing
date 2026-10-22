import { Router } from 'express'
import multer from 'multer'
import crypto from 'node:crypto'
import { pool } from '../db.js'
import { verifyPassword, signTeleToken, verifyTeleToken } from '../auth.js'

// API de /tele: el panel de la tele del living.
//  - /tv/*  lo llama la tele, con su propia clave (tele_config.tv_token) en X-Tele-Token.
//  - el resto es el panel, con los usuarios de /casa y un token de rol 'tele'.
const tele = Router()

const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const fail = (status, message) => Object.assign(new Error(message), { status })

// Las fotos llegan achicadas desde el navegador; 15 MB es solo un tope de seguridad.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } })
const MIMES = ['image/jpeg', 'image/png', 'image/webp']
const TIPOS = ['foto', 'fondo']
const PAQUETE = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/

// Lo que la tele usa si nunca se guardó nada (lo mismo que tiene hoy).
export const CONFIG_DEFAULT = {
  wallpaper_rotate_minutes: 10,
  photo_interval_seconds: 10,
  vertical_photos: 'pair',
  weather: true,
  weather_city: 'Buenos Aires',
  weather_lat: -34.61,
  weather_lon: -58.38,
  weather_min_max: true,
  dock_apps: ['com.netflix.ninja', 'com.google.android.youtube.tv', 'com.disney.disneyplus', 'com.amazon.amazonvideo.livingroom'],
  app_order: ['ar.com.flow.androidtv', 'com.spotify.tv.android', 'com.wbd.stream', 'com.cbs.ott', 'com.android.vending',
    'com.google.android.youtube.tvmusic', 'tv.twitch.android.app', 'com.vt.tv.tvcenter'],
  hidden_apps: ['tv.pluto.android', 'com.crunchyroll.crunchyroid', 'com.mercadolibre.android.mplay_tv'],
  logo_style: 'color',
  glass_blur: 22,
  glass_tint: 14,
  clock_24h: true,
  show_date: true,
  screensaver: { style: 'mesa de recuerdos', speed: 'rapido', captions: true, tape: true, weather: true, place_chip: true },
}

const entero = (v, min, max, def) => {
  const n = Math.round(Number(v))
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def
}
const bool = (v, def) => (typeof v === 'boolean' ? v : def)
const uno = (v, opciones, def) => (opciones.includes(v) ? v : def)
const paquetes = (v, def) => (Array.isArray(v) ? [...new Set(v.map(String).filter((p) => PAQUETE.test(p)))].slice(0, 60) : def)

// Normaliza lo que manda el panel: claves conocidas, tipos y rangos válidos.
// Lo que no se entiende queda como estaba, así un dato raro nunca rompe la tele.
export function limpiarConfig(b = {}, actual = CONFIG_DEFAULT) {
  const a = { ...CONFIG_DEFAULT, ...actual }
  const ss = { ...CONFIG_DEFAULT.screensaver, ...(a.screensaver || {}) }
  const bs = b.screensaver || {}
  const lat = Number(b.weather_lat), lon = Number(b.weather_lon)
  return {
    wallpaper_rotate_minutes: entero(b.wallpaper_rotate_minutes, 1, 240, a.wallpaper_rotate_minutes),
    photo_interval_seconds: entero(b.photo_interval_seconds, 3, 600, a.photo_interval_seconds),
    vertical_photos: uno(b.vertical_photos, ['pair', 'single'], a.vertical_photos),
    weather: bool(b.weather, a.weather),
    weather_city: typeof b.weather_city === 'string' && b.weather_city.trim() ? b.weather_city.trim().slice(0, 60) : a.weather_city,
    weather_lat: Number.isFinite(lat) && Math.abs(lat) <= 90 ? lat : a.weather_lat,
    weather_lon: Number.isFinite(lon) && Math.abs(lon) <= 180 ? lon : a.weather_lon,
    weather_min_max: bool(b.weather_min_max, a.weather_min_max),
    dock_apps: paquetes(b.dock_apps, a.dock_apps).slice(0, 6),
    app_order: paquetes(b.app_order, a.app_order),
    hidden_apps: paquetes(b.hidden_apps, a.hidden_apps),
    logo_style: uno(b.logo_style, ['color', 'white'], a.logo_style),
    glass_blur: entero(b.glass_blur, 0, 40, a.glass_blur),
    glass_tint: entero(b.glass_tint, -40, 40, a.glass_tint),
    clock_24h: bool(b.clock_24h, a.clock_24h),
    show_date: bool(b.show_date, a.show_date),
    screensaver: {
      style: uno(bs.style, ['mesa de recuerdos'], ss.style),
      speed: uno(bs.speed, ['tranquilo', 'normal', 'rapido'], ss.speed),
      captions: bool(bs.captions, ss.captions),
      tape: bool(bs.tape, ss.tape),
      weather: bool(bs.weather, ss.weather),
      place_chip: bool(bs.place_chip, ss.place_chip),
    },
  }
}

async function leerConfig() {
  const { rows } = await pool.query('SELECT datos FROM tele_config WHERE id = 1')
  return limpiarConfig(rows[0]?.datos || {}, rows[0]?.datos || {})
}

const META = `id, tipo, titulo, lugar, credito, mime, ancho, alto, tamano, hash, orden, created_at`

async function listarFotos() {
  const { rows } = await pool.query(`SELECT ${META} FROM tele_fotos ORDER BY tipo, orden, id`)
  return rows
}

// Versión de todo lo que la tele tiene que mostrar: si no cambia, la tele no baja nada.
function version(config, fotos) {
  return crypto.createHash('sha1')
    .update(JSON.stringify(config))
    .update(fotos.map((f) => `${f.id}:${f.hash}:${f.orden}:${f.titulo || ''}:${f.lugar || ''}`).join('|'))
    .digest('hex').slice(0, 16)
}

// ====================== La tele ======================

const tv = Router()

tv.use(h(async (req, _res, next) => {
  const clave = String(req.headers['x-tele-token'] || '')
  const { rows } = await pool.query('SELECT tv_token FROM tele_config WHERE id = 1')
  const guardada = rows[0]?.tv_token || ''
  const a = Buffer.from(clave), b = Buffer.from(guardada)
  if (!clave || a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw fail(401, 'No autorizado')
  next()
}))

// Todo lo que la tele necesita para armarse, sin las imágenes (esas van aparte, por id).
tv.get('/manifiesto', h(async (_req, res) => {
  const [config, fotos] = await Promise.all([leerConfig(), listarFotos()])
  await pool.query('UPDATE tele_config SET tv_visto = now() WHERE id = 1')
  res.json({
    version: version(config, fotos),
    config,
    fotos: fotos.map(({ id, tipo, titulo, lugar, hash, ancho, alto, mime }) => ({ id, tipo, titulo, lugar, hash, ancho, alto, mime })),
  })
}))

tv.get('/fotos/:id', h(async (req, res) => {
  const { rows } = await pool.query('SELECT mime, hash, datos FROM tele_fotos WHERE id = $1', [Number(req.params.id) || 0])
  if (!rows[0]) throw fail(404, 'No existe esa foto')
  res.set('Content-Type', rows[0].mime).set('ETag', `"${rows[0].hash}"`).set('Cache-Control', 'private, max-age=31536000, immutable')
  res.send(rows[0].datos)
}))

// La tele cuenta cómo está: versión del launcher, apps instaladas, memoria. El panel lo muestra.
tv.post('/estado', h(async (req, res) => {
  const b = req.body || {}
  const apps = Array.isArray(b.apps)
    ? b.apps.filter((x) => x && PAQUETE.test(String(x.pkg))).slice(0, 120)
      .map((x) => ({ pkg: String(x.pkg), label: String(x.label || x.pkg).slice(0, 60) }))
    : []
  const estado = {
    launcher: String(b.launcher || '').slice(0, 30),
    version: String(b.version || '').slice(0, 30),
    memoria_libre_mb: entero(b.memoria_libre_mb, 0, 100000, null),
    memoria_total_mb: entero(b.memoria_total_mb, 0, 100000, null),
    apps,
  }
  await pool.query('UPDATE tele_config SET tv_estado = $1, tv_visto = now() WHERE id = 1', [JSON.stringify(estado)])
  res.status(204).end()
}))

tele.use('/tv', tv)

// ====================== El panel ======================

tele.post('/login', h(async (req, res) => {
  const usuario = String(req.body?.usuario || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const { rows } = await pool.query('SELECT id, nombre, password_hash FROM casa_usuarios WHERE usuario = $1', [usuario])
  const u = rows[0]
  if (!u || !verifyPassword(password, u.password_hash)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
  }
  await pool.query('UPDATE casa_usuarios SET last_login = now() WHERE id = $1', [u.id])
  res.json({ token: signTeleToken(u.id), usuario: { id: u.id, nombre: u.nombre } })
}))

tele.use(verifyTeleToken)

tele.get('/estado', h(async (req, res) => {
  const [me, cfg, fotos] = await Promise.all([
    pool.query('SELECT id, nombre FROM casa_usuarios WHERE id = $1', [req.teleUid]),
    pool.query(`SELECT c.datos, c.tv_token, c.tv_visto, c.tv_estado, c.updated_at, u.nombre AS updated_by
                FROM tele_config c LEFT JOIN casa_usuarios u ON u.id = c.updated_by WHERE c.id = 1`),
    listarFotos(),
  ])
  const c = cfg.rows[0]
  res.json({
    yo: me.rows[0] || null,
    config: limpiarConfig(c.datos || {}, c.datos || {}),
    actualizado: { en: c.updated_at, por: c.updated_by },
    tv: { visto: c.tv_visto, estado: c.tv_estado || {}, token: c.tv_token },
    fotos,
  })
}))

tele.put('/config', h(async (req, res) => {
  const actual = await leerConfig()
  const datos = limpiarConfig(req.body?.datos || {}, actual)
  await pool.query('UPDATE tele_config SET datos = $1, updated_by = $2, updated_at = now() WHERE id = 1',
    [JSON.stringify(datos), req.teleUid])
  res.json({ config: datos })
}))

// Una foto por pedido (el navegador las manda de a una y muestra el avance).
tele.post('/fotos', upload.single('archivo'), h(async (req, res) => {
  const f = req.file
  if (!f) throw fail(400, 'Falta la foto.')
  if (!MIMES.includes(f.mimetype)) throw fail(400, 'Tiene que ser una imagen JPG, PNG o WebP.')
  const tipo = TIPOS.includes(req.body.tipo) ? req.body.tipo : 'foto'
  const hash = crypto.createHash('sha1').update(f.buffer).digest('hex')
  const texto = (v, n) => (v ? String(v).trim().slice(0, n) || null : null)
  const { rows: ult } = await pool.query('SELECT COALESCE(MAX(orden), 0) + 1 AS n FROM tele_fotos WHERE tipo = $1', [tipo])
  const { rows } = await pool.query(
    `INSERT INTO tele_fotos (tipo, titulo, lugar, credito, mime, ancho, alto, tamano, hash, datos, orden, subido_por)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING ${META}`,
    [tipo, texto(req.body.titulo, 80), texto(req.body.lugar, 80), texto(req.body.credito, 160), f.mimetype,
      entero(req.body.ancho, 1, 20000, null), entero(req.body.alto, 1, 20000, null), f.size, hash, f.buffer,
      ult[0].n, req.teleUid]
  )
  res.status(201).json(rows[0])
}))

tele.patch('/fotos/:id', h(async (req, res) => {
  const b = req.body || {}
  const texto = (v, n) => (v ? String(v).trim().slice(0, n) || null : null)
  const { rows } = await pool.query(
    `UPDATE tele_fotos SET titulo = $2, lugar = $3 WHERE id = $1 RETURNING ${META}`,
    [Number(req.params.id) || 0, texto(b.titulo, 80), texto(b.lugar, 80)]
  )
  if (!rows[0]) throw fail(404, 'No existe esa foto')
  res.json(rows[0])
}))

// Nuevo orden de un tipo entero: ids en el orden en que se tienen que ver.
tele.put('/orden', h(async (req, res) => {
  const tipo = TIPOS.includes(req.body?.tipo) ? req.body.tipo : null
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number).filter(Number.isInteger) : null
  if (!tipo || !ids) throw fail(400, 'Faltan el tipo o los ids.')
  await pool.query(
    `UPDATE tele_fotos t SET orden = o.n FROM unnest($1::int[]) WITH ORDINALITY AS o(id, n)
     WHERE t.id = o.id AND t.tipo = $2`, [ids, tipo])
  res.status(204).end()
}))

tele.delete('/fotos/:id', h(async (req, res) => {
  await pool.query('DELETE FROM tele_fotos WHERE id = $1', [Number(req.params.id) || 0])
  res.status(204).end()
}))

// Para las miniaturas del panel (con el token del panel, por eso no es un <img src> directo).
tele.get('/fotos/:id/img', h(async (req, res) => {
  const { rows } = await pool.query('SELECT mime, hash, datos FROM tele_fotos WHERE id = $1', [Number(req.params.id) || 0])
  if (!rows[0]) throw fail(404, 'No existe esa foto')
  res.set('Content-Type', rows[0].mime).set('Cache-Control', 'private, max-age=86400')
  res.send(rows[0].datos)
}))

// Clave nueva para la tele (si se perdió o se filtró): la vieja deja de andar en el acto.
tele.post('/clave-tele', h(async (_req, res) => {
  const token = crypto.randomBytes(24).toString('hex')
  await pool.query('UPDATE tele_config SET tv_token = $1 WHERE id = 1', [token])
  res.json({ token })
}))

export default tele
