// Ajustes del panel: se guardan en la tabla `ajustes` (clave/valor JSON).
// Acá viven los valores por defecto; lo que está en la base pisa esto.
import { pool } from './db.js'

export const AJUSTES_DEFAULT = {
  // Datos que se pegan en los mensajes de cobro ({datos_pago})
  datos_pago: 'Transferencia\nAlias: (completar en Ajustes)\nTitular: Margon Software',
  // Cierre de todos los mensajes ({firma})
  firma: 'Gonzalo · Margon Software\nmargonsoftware.com',
  // Link al portal de clientes ({link_portal})
  link_portal: 'https://www.margonsoftware.com/portal',
  // Mail donde llega el resumen diario de pendientes (recordatorios para vos)
  admin_email: '',
  resumen_diario: true,
  resumen_hora: 9,        // hora Argentina en la que sale el resumen
  resumen_ultimo: '',     // 'YYYY-MM-DD' del último enviado (para no repetir)
  // Plantillas de mensajes (WhatsApp y mail comparten el cuerpo)
  plantillas: {},
}

export async function getAjustes() {
  const { rows } = await pool.query('SELECT clave, valor FROM ajustes')
  const db = {}
  for (const r of rows) db[r.clave] = r.valor
  return { ...AJUSTES_DEFAULT, ...db, plantillas: { ...(db.plantillas || {}) } }
}

// Guarda solo las claves que vienen (merge). Devuelve los ajustes completos.
export async function setAjustes(parcial = {}) {
  for (const [clave, valor] of Object.entries(parcial)) {
    if (!(clave in AJUSTES_DEFAULT)) continue
    await pool.query(
      `INSERT INTO ajustes (clave, valor) VALUES ($1, $2)
       ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor`,
      [clave, JSON.stringify(valor)]
    )
  }
  return getAjustes()
}
