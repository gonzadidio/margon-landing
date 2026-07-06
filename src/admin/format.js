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
