// Crea o actualiza un usuario de /casa.
// Uso: node server/scripts/casa-usuario.js <usuario> <nombre> <contraseña>
// En producción: railway run node server/scripts/casa-usuario.js gonza Gonza 'clave-larga'
import 'dotenv/config'
import { pool, initDb } from '../db.js'
import { hashPassword } from '../auth.js'

const [usuario, nombre, password] = process.argv.slice(2)
if (!usuario || !nombre || !password) {
  console.error('Uso: node server/scripts/casa-usuario.js <usuario> <nombre> <contraseña>')
  process.exit(1)
}
if (password.length < 10) {
  console.error('La contraseña tiene que tener al menos 10 caracteres.')
  process.exit(1)
}

await initDb()
const { rows } = await pool.query(
  `INSERT INTO casa_usuarios (usuario, nombre, password_hash) VALUES ($1, $2, $3)
   ON CONFLICT (usuario) DO UPDATE SET nombre = EXCLUDED.nombre, password_hash = EXCLUDED.password_hash
   RETURNING id, usuario, nombre`,
  [usuario.trim().toLowerCase(), nombre.trim(), hashPassword(password)]
)
console.log('[casa] usuario listo:', rows[0])
await pool.end()
