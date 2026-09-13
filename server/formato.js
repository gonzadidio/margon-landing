// Helpers de formato compartidos por mensajes, PDF y resumen diario.
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const FMT = {
  ARS: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }),
  USD: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
}
export const fmtMoney = (n, moneda = 'ARS') => (FMT[moneda] || FMT.ARS).format(Number(n) || 0)

// "2026-09" -> "septiembre 2026"
export function periodoLargo(periodo) {
  const [y, m] = String(periodo || '').split('-')
  const mes = MESES[Number(m) - 1]
  return mes ? `${mes} ${y}` : periodo || ''
}

// Date | ISO | "YYYY-MM-DD" -> "13/09/2026"
export function fmtFecha(v) {
  if (!v) return ''
  const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10)
  const [y, m, d] = s.split('-')
  return d ? `${d}/${m}/${y}` : s
}

// Fecha de hoy en Argentina como "YYYY-MM-DD" (el server corre en UTC).
export const hoyAR = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date())

export const horaAR = () =>
  Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: 'numeric', hour12: false }).format(new Date()))

// Suma días a "YYYY-MM-DD"
export function sumarDias(fecha, dias) {
  const d = new Date(`${fecha}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

// Teléfono argentino -> formato internacional para wa.me (549 + área + número).
// Acepta "11 1234-5678", "011 15 1234 5678", "+54 9 11 ...", etc.
export function telefonoWa(tel) {
  let d = String(tel || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('54')) return d.startsWith('549') ? d : `549${d.slice(2)}`
  if (d.startsWith('0')) d = d.slice(1)
  // Sacar el "15" del celular cuando viene después del código de área.
  for (const area of [2, 3, 4]) {
    if (d.length === 12 && d.slice(area, area + 2) === '15') { d = d.slice(0, area) + d.slice(area + 2); break }
  }
  return `549${d}`
}
