// Helpers compartidos de formato. Los usa el panel interno y también el
// portal de clientes (fmtMoney, fmtFecha, estadoPago, saldoCobro).

const FORMATTERS = {
  ARS: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }),
  USD: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
}

// fmtMoney(1500, 'USD') -> "US$ 1.500"
export function fmtMoney(n, moneda = 'ARS') {
  const f = FORMATTERS[moneda] || FORMATTERS.ARS
  return f.format(Number(n) || 0)
}

// { ARS: 1000, USD: 50 } -> "$ 1.000 · US$ 50"
export function fmtMoneyMap(map) {
  const e = Object.entries(map || {}).filter(([, v]) => Number(v) > 0)
  return e.length ? e.map(([m, v]) => fmtMoney(v, m)).join(' · ') : '—'
}

export const MONEDAS = ['ARS', 'USD']
export const FORMAS_PAGO = ['Transferencia', 'Efectivo', 'MercadoPago', 'Débito', 'Crédito', 'Cheque', 'Otro']

// Tipos de cobro. 'mensual' = recurrente; 'setup' = pago único inicial;
// 'unico' = cualquier otro cobro puntual / histórico.
export const TIPOS_COBRO = [
  { v: 'mensual', label: 'Mensual', tone: 'gray' },
  { v: 'setup', label: 'Setup', tone: 'violet' },
  { v: 'unico', label: 'Único', tone: 'blue' },
]
export const tipoCobroMeta = (v) => TIPOS_COBRO.find((t) => t.v === v) || TIPOS_COBRO[0]

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

// "2026-06-30" | ISO | Date -> "30/06/2026"
export function fmtFecha(v) {
  if (!v) return ''
  const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10)
  const [y, m, d] = s.split('-')
  return d ? `${d}/${m}/${y}` : s
}

// ISO -> "30/06/2026 14:05"
export function fmtFechaHora(v) {
  if (!v) return ''
  const d = new Date(v)
  return `${fmtFecha(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// "2026-09-13" -> "sábado 13 de septiembre"
export function fechaLarga(s) {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${DIAS[date.getDay()]} ${d} de ${MESES[m - 1]}`
}

// "2026-09" -> "septiembre 2026"
export function periodoLargo(periodo) {
  const [y, m] = String(periodo || '').split('-')
  const mes = MESES[Number(m) - 1]
  return mes ? `${mes} ${y}` : periodo || ''
}
export const capitalizar = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)

// Hoy local como "YYYY-MM-DD"
export function hoyISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const periodoActual = () => hoyISO().slice(0, 7)

// "2026-09" + 1 -> "2026-10"
export function sumarMeses(periodo, n) {
  const [y, m] = periodo.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Días entre hoy y una fecha (negativo = ya pasó).
export function diasHasta(fecha) {
  if (!fecha) return null
  const [y, m, d] = String(fecha).slice(0, 10).split('-').map(Number)
  const [hy, hm, hd] = hoyISO().split('-').map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(hy, hm - 1, hd)) / 86400000)
}

// "hoy" | "mañana" | "ayer" | "hace 3 días" | "en 5 días"
export function relFecha(fecha) {
  const n = diasHasta(fecha)
  if (n == null) return ''
  if (n === 0) return 'hoy'
  if (n === 1) return 'mañana'
  if (n === -1) return 'ayer'
  return n < 0 ? `hace ${-n} días` : `en ${n} días`
}

// Estado de pago derivado de cuánto se abonó (soporta pagos parciales).
export function estadoPago(c) {
  const monto = Number(c.monto) || 0
  const pagado = Number(c.pagado) || 0
  if (monto > 0 && pagado >= monto) return 'pagado'
  if (pagado > 0) return 'parcial'
  if (c.vencimiento && diasHasta(c.vencimiento) < 0) return 'vencido'
  return 'pendiente'
}
export const ESTADO_PAGO = {
  pagado: { label: 'Pagado', tone: 'green' },
  parcial: { label: 'Parcial', tone: 'blue' },
  pendiente: { label: 'Pendiente', tone: 'amber' },
  vencido: { label: 'Vencido', tone: 'red' },
}

export const saldoCobro = (c) => Math.max((Number(c.monto) || 0) - (Number(c.pagado) || 0), 0)

export const iniciales = (nombre = '') =>
  nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase() || '?'

export function fmtBytes(n) {
  n = Number(n) || 0
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

// Teléfono argentino -> número para wa.me (mismo criterio que el server).
export function telefonoWa(tel) {
  let d = String(tel || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('54')) return d.startsWith('549') ? d : `549${d.slice(2)}`
  if (d.startsWith('0')) d = d.slice(1)
  for (const area of [2, 3, 4]) {
    if (d.length === 12 && d.slice(area, area + 2) === '15') { d = d.slice(0, area) + d.slice(area + 2); break }
  }
  return `549${d}`
}
