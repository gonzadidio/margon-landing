// Helpers compartidos de formato para el panel interno.

const FORMATTERS = {
  ARS: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }),
  USD: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
}

// fmtMoney(1500, 'USD') -> "US$ 1.500"
export function fmtMoney(n, moneda = 'ARS') {
  const f = FORMATTERS[moneda] || FORMATTERS.ARS
  return f.format(Number(n) || 0)
}

export const MONEDAS = ['ARS', 'USD']

// Formas de pago disponibles.
export const FORMAS_PAGO = ['Transferencia', 'Efectivo', 'MercadoPago', 'Débito', 'Crédito', 'Cheque', 'Otro']

// Tipos de cobro. 'mensual' = recurrente; 'setup' = pago único inicial;
// 'unico' = cualquier otro cobro puntual / histórico.
export const TIPOS_COBRO = [
  { v: 'mensual', label: 'Mensual', cls: 'bg-surface-800 text-surface-200/60' },
  { v: 'setup',   label: 'Setup',   cls: 'bg-violet-500/15 text-violet-300' },
  { v: 'unico',   label: 'Único',   cls: 'bg-sky-500/15 text-sky-300' },
]
export const tipoCobroMeta = (v) => TIPOS_COBRO.find((t) => t.v === v) || TIPOS_COBRO[0]

// "2026-06-30" | ISO | Date -> "30/06/2026"
export function fmtFecha(v) {
  if (!v) return ''
  const s = String(v).slice(0, 10)
  const [y, m, d] = s.split('-')
  return d ? `${d}/${m}/${y}` : s
}

// Período actual "YYYY-MM"
export const periodoActual = () => new Date().toISOString().slice(0, 7)

// Días entre hoy y una fecha (negativo = ya pasó). Útil para vencimientos.
export function diasHasta(fecha) {
  if (!fecha) return null
  const hoy = new Date(new Date().toISOString().slice(0, 10))
  const f = new Date(String(fecha).slice(0, 10))
  return Math.round((f - hoy) / 86400000)
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

export const saldoCobro = (c) => Math.max((Number(c.monto) || 0) - (Number(c.pagado) || 0), 0)
