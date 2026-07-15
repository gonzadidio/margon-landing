import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-cambiar-en-produccion'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'margon'

// POST /api/login  { password } -> { token }
export function login(req, res) {
  const { password } = req.body || {}
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' })
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
}

// Middleware: exige Authorization: Bearer <token>
export function verifyToken(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'No autorizado' })
  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Sesión inválida o expirada' })
  }
}

// ---------- Portal de clientes ----------
// Hash de contraseña con scrypt (crypto nativo, sin dependencias nuevas).
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(pw), salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(pw, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const test = crypto.scryptSync(String(pw), salt, 64).toString('hex')
  const a = Buffer.from(hash, 'hex')
  const b = Buffer.from(test, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Token aleatorio para links de invitación / reseteo.
export function randomToken() {
  return crypto.randomBytes(24).toString('hex')
}

// Token de sesión del cliente (rol 'client', con su id).
export function signClientToken(clienteId) {
  return jwt.sign({ role: 'client', cid: clienteId }, JWT_SECRET, { expiresIn: '30d' })
}

// Middleware del portal: exige un token de cliente y expone req.clienteId.
export function verifyClientToken(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'No autorizado' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role !== 'client') return res.status(401).json({ error: 'No autorizado' })
    req.clienteId = payload.cid
    next()
  } catch {
    res.status(401).json({ error: 'Sesión inválida o expirada' })
  }
}
