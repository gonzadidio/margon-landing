// Cuentas del plan de la casa. Funciones puras: reciben el estado y devuelven números.
// Regla: los pesos nunca se pasan a dólares sin una cotización cargada.

export const DEFAULT_CONFIG = {
  precio: 91800, cuotas: 60, cuota: 1530, inicioCuotas: '', entrega: '2027-09', prorrogaMeses: 6,
  m2: 180, usdM2: 1433, adicionalesPct: 20, tc: null, ahorroActual: 0, ahorroMensual: 0,
  etapasMeses: 12, constAnticipo: 40, constCuotas: 24, credPct: 50, credAnios: 20, credTasa: 6,
  deseos: [],
}

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export const ym = (s) => {
  if (!s || !/^\d{4}-\d{2}/.test(s)) return null
  const [y, m] = s.split('-').map(Number)
  return { y, m }
}
export const hoyYm = () => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() + 1 } }
export const mesesEntre = (a, b) => (b.y - a.y) * 12 + (b.m - a.m)
export const sumarMeses = (p, k) => { const t = p.y * 12 + (p.m - 1) + k; return { y: Math.floor(t / 12), m: (t % 12) + 1 } }
export const etiquetaMes = (p) => `${MES[p.m - 1]} ${String(p.y).slice(2)}`
export const etiquetaMesLarga = (p) => `${MES_LARGO[p.m - 1]} ${p.y}`

export const cuotaFrancesa = (capital, tasaAnual, anios) => {
  const n = anios * 12, r = tasaAnual / 100 / 12
  if (!n) return 0
  return r ? (capital * r) / (1 - Math.pow(1 + r, -n)) : capital / n
}

export const tcDe = (cfg) => (Number(cfg.tc) > 0 ? Number(cfg.tc) : null)

// Suma separando monedas. total = todo en USD si hay cotización, si no null.
export function sumar(lista, tc, filtro) {
  let usd = 0, ars = 0
  for (const x of lista) {
    if (filtro && !filtro(x)) continue
    const v = Number(x.monto) || 0
    if (x.moneda === 'ARS') ars += v
    else usd += v
  }
  return { usd, ars, total: tc ? usd + ars / tc : ars === 0 ? usd : null }
}

// Un gasto en cuotas: en qué cuota va en el mes p (1..total), o null si no corre ese mes.
export function cuotaEnMes(x, p) {
  if (!x.cuotas_total || !x.cuota_desde) return null
  const k = mesesEntre(ym(x.cuota_desde), p) + 1
  return k >= 1 && k <= x.cuotas_total ? k : null
}
export const esEnCuotas = (x) => x.tipo === 'gasto' && !!x.cuotas_total && !!x.cuota_desde
export const finDeCuotas = (x) => sumarMeses(ym(x.cuota_desde), x.cuotas_total - 1)
const correEnMes = (x, p) => !esEnCuotas(x) || cuotaEnMes(x, p) != null

export function calcular(cfg, movimientos, flujo, porCobrar = []) {
  const tc = tcDe(cfg)
  const hoy = hoyYm()
  const enUsd = (x) => (x.moneda === 'ARS' ? (tc ? Number(x.monto) / tc : 0) : Number(x.monto))
  const cuotasPagas = new Set(movimientos.filter((m) => m.cuota_n).map((m) => m.cuota_n))
  const nCuotas = Number(cfg.cuotas) || 0
  const valorCuota = Number(cfg.cuota) || 0
  const pagado = sumar(movimientos, tc)
  const pagadoTerreno = sumar(movimientos, tc, (m) => m.categoria === 'Terreno')
  const saldoLote = Math.max(0, nCuotas - cuotasPagas.size) * valorCuota

  const ingresos = sumar(flujo, tc, (x) => x.tipo === 'ingreso')
  // Gastos de este mes: los fijos más las cuotas que corren hoy.
  const gastos = sumar(flujo, tc, (x) => x.tipo === 'gasto' && correEnMes(x, hoy))
  const enCuotas = flujo.filter(esEnCuotas)
  const cuotaLoteMes = cuotasPagas.size < nCuotas ? valorCuota : 0
  const sobraUsd = ingresos.usd - gastos.usd - cuotaLoteMes
  const sobraArs = ingresos.ars - gastos.ars
  const sobra = tc ? sobraUsd + sobraArs / tc : sobraArs === 0 ? sobraUsd : null

  const obraPura = (Number(cfg.m2) || 0) * (Number(cfg.usdM2) || 0)
  const costoCasa = obraPura * (1 + (Number(cfg.adicionalesPct) || 0) / 100)

  const entrega = ym(cfg.entrega) || { y: 2027, m: 9 }
  const prorroga = Number(cfg.prorrogaMeses) || 0
  const mesesEntrega = Math.max(0, mesesEntre(hoy, entrega))
  const mesesProrroga = mesesEntrega + prorroga
  const ahorroMes = Number(cfg.ahorroMensual) || 0
  const ahorroHoy = Number(cfg.ahorroActual) || 0

  // Cuánto cambia el ahorro en el mes p respecto de hoy: cuotas que terminan liberan
  // plata, cuotas que todavía no arrancaron la restan. Pesos sin cotización no cuentan.
  const deltaMes = (p) => enCuotas.reduce((acc, x) => {
    const hoyCorre = cuotaEnMes(x, hoy) != null, pCorre = cuotaEnMes(x, p) != null
    if (hoyCorre && !pCorre) return acc + enUsd(x)
    if (!hoyCorre && pCorre) return acc - enUsd(x)
    return acc
  }, 0)

  // Plata por cobrar pendiente: entra en el mes en que vence (si ya venció, cuenta hoy).
  const pendientes = porCobrar.filter((p) => !p.cobrado)
  const conFecha = pendientes.filter((p) => p.fecha)
  const sinFecha = pendientes.filter((p) => !p.fecha)
  const mesDeCobro = (p) => Math.max(0, mesesEntre(hoy, ym(p.fecha)))
  const porCobrarTotal = sumar(pendientes, tc)
  const porCobrarSinFecha = sumar(sinFecha, tc)

  // Serie del ahorro mes a mes, de hoy (0) al fin de la prórroga.
  const serie = []
  const cobrosHasta = (i) => conFecha.filter((p) => mesDeCobro(p) <= i)
  for (let i = 0; i <= mesesProrroga; i++) {
    const cobrosMes = conFecha.filter((p) => mesDeCobro(p) === i).reduce((a, p) => a + enUsd(p), 0)
    const prev = i === 0 ? ahorroHoy : serie[i - 1]
    serie.push(prev + (i === 0 ? 0 : ahorroMes + deltaMes(sumarMeses(hoy, i))) + cobrosMes)
  }
  const juntadoEntrega = serie[mesesEntrega] ?? ahorroHoy
  const juntadoProrroga = serie[mesesProrroga] ?? ahorroHoy
  const cobrosEntrega = sumar(cobrosHasta(mesesEntrega), tc)
  // Lo que se puede ahorrar por mes cuando arranque la obra (ya sin las cuotas que terminaron).
  const ahorroMesObra = ahorroMes + deltaMes(entrega)

  const inicio = ym(cfg.inicioCuotas)
  const cuotaDeEntrega = inicio ? mesesEntre(inicio, entrega) + 1 : null
  const ultimaCuota = inicio ? sumarMeses(inicio, nCuotas - 1) : null
  let proxima = 1
  while (cuotasPagas.has(proxima)) proxima++

  return {
    tc, hoy, cuotasPagas, nCuotas, valorCuota, pagado, pagadoTerreno, saldoLote,
    ingresos, gastos, cuotaLoteMes, sobraUsd, sobraArs, sobra,
    obraPura, costoCasa, entrega, prorroga, mesesEntrega, mesesProrroga,
    ahorroMes, ahorroHoy, juntadoEntrega, juntadoProrroga, serie, ahorroMesObra,
    enCuotas, pendientes, porCobrarTotal, porCobrarSinFecha, cobrosEntrega,
    inicio, cuotaDeEntrega, ultimaCuota, proxima: proxima <= nCuotas ? proxima : null,
  }
}

// Las cuatro formas de construir sin tener el 100% (arrancando en la entrega).
export function escenarios(cfg, c) {
  const costo = c.costoCasa
  const nEtapas = Number(cfg.etapasMeses) || 12
  const anticipo = (Number(cfg.constAnticipo) || 0) / 100
  const nConst = Number(cfg.constCuotas) || 1
  const pctCred = (Number(cfg.credPct) || 0) / 100
  const lista = [
    {
      id: 'contado', titulo: 'Todo junto al arrancar',
      detalle: 'Esperar a tener el 100% y construir de una.',
      inicial: costo, mensual: 0, params: [],
    },
    {
      id: 'etapas', titulo: 'Por etapas, con el ahorro',
      detalle: 'Arrancar con lo juntado y pagar la obra mes a mes con lo que ahorran.',
      inicial: Math.max(0, costo - c.ahorroMesObra * nEtapas), mensual: costo / nEtapas,
      nota: `obra de ${nEtapas} meses`,
      params: [{ key: 'etapasMeses', label: 'Duración de obra (meses)' }],
    },
    {
      id: 'constructora', titulo: 'Constructora con financiación',
      detalle: 'Anticipo y el saldo en cuotas. Muchas ajustan por índice CAC: preguntalo antes de firmar.',
      inicial: costo * anticipo, mensual: (costo * (1 - anticipo)) / nConst,
      nota: `${nConst} cuotas`,
      params: [{ key: 'constAnticipo', label: 'Anticipo %' }, { key: 'constCuotas', label: 'Cuotas' }],
    },
    {
      id: 'credito', titulo: 'Crédito para construcción',
      detalle: 'El banco financia una parte. Suelen ser en pesos ajustados por UVA: la cuota en dólares es aproximada.',
      inicial: costo * (1 - pctCred),
      mensual: cuotaFrancesa(costo * pctCred, Number(cfg.credTasa) || 0, Number(cfg.credAnios) || 1),
      nota: `${cfg.credAnios} años al ${cfg.credTasa}%`,
      params: [{ key: 'credPct', label: '% financiado' }, { key: 'credAnios', label: 'Plazo (años)' }, { key: 'credTasa', label: 'Tasa anual %' }],
    },
  ]
  return lista.map((e) => {
    const alcanzaInicio = c.juntadoEntrega >= e.inicial
    const alcanzaMes = e.mensual <= c.ahorroMesObra + 0.5
    return {
      ...e,
      alcanzaInicio, alcanzaMes,
      cierra: c.ahorroMes > 0 && alcanzaInicio && alcanzaMes,
      faltaInicio: Math.max(0, e.inicial - c.juntadoEntrega),
      sobraInicio: Math.max(0, c.juntadoEntrega - e.inicial),
      excesoMes: Math.max(0, e.mensual - c.ahorroMesObra),
    }
  })
}

export const saludo = () => {
  const h = new Date().getHours()
  return h < 6 ? 'Buenas noches' : h < 13 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches'
}

// ---------- Formato ----------
const nf = (d) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: d, minimumFractionDigits: d })
export const fmt = (n, d = 0) => (n == null || Number.isNaN(n) ? '—' : nf(d).format(n))
export const usd = (n) => (n == null || Number.isNaN(n) ? '—' : `US$ ${fmt(Math.round(n))}`)
export const ars = (n) => (n == null || Number.isNaN(n) ? '—' : `$ ${fmt(Math.round(n))}`)
export const plata = (n, moneda) => (moneda === 'ARS' ? ars(n) : usd(n))
export const ambas = (s) => (s.ars ? `${usd(s.usd)} + ${ars(s.ars)}` : usd(s.usd))
export const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—')
export const fechaCorta = (iso) => (iso ? iso.split('-').reverse().join('/') : null)
