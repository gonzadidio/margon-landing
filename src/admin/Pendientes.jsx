import { useEffect, useState } from 'react'
import { Loader2, AlertTriangle, Clock, PieChart, CalendarClock, Plus } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, fmtFecha, diasHasta, tipoCobroMeta, estadoPago, saldoCobro } from './format'
import { useNav } from './nav'
import GestionPagos from './GestionPagos'

const EST = {
  parcial:   { label: 'Parcial',   cls: 'bg-sky-500/15 text-sky-300 ring-sky-500/20', icon: PieChart },
  pendiente: { label: 'Pendiente', cls: 'bg-amber-500/15 text-amber-300 ring-amber-500/20', icon: Clock },
  vencido:   { label: 'Vencido',   cls: 'bg-red-500/15 text-red-300 ring-red-500/20', icon: AlertTriangle },
}

// Texto de vencimiento: "vencido hace 3d", "vence hoy", "vence en 5d"
function vencTexto(fecha) {
  const d = diasHasta(fecha)
  if (d == null) return null
  if (d < 0) return { txt: `vencido hace ${-d}d`, tone: 'red' }
  if (d === 0) return { txt: 'vence hoy', tone: 'amber' }
  if (d <= 7) return { txt: `vence en ${d}d`, tone: 'amber' }
  return { txt: `vence ${fmtFecha(fecha)}`, tone: 'muted' }
}

export default function Pendientes() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [gestion, setGestion] = useState(null)
  const { verCliente } = useNav()

  async function load() {
    setLoading(true)
    try {
      setItems(await apiFetch('/pendientes'))
      setError('')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // Totales de saldo por moneda + conteo de vencidos
  const porMoneda = {}
  let vencidos = 0
  for (const c of items) {
    const m = c.moneda || 'ARS'
    porMoneda[m] = (porMoneda[m] || 0) + saldoCobro(c)
    if (estadoPago(c) === 'vencido') vencidos++
  }
  const totalStr = Object.entries(porMoneda).filter(([, v]) => v).map(([m, v]) => fmtMoney(v, m)).join('  ·  ')

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Pendientes de cobro</h2>
          <p className="text-sm text-surface-200/50">Todo lo que falta cobrar, lo más urgente arriba.</p>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card label="Total por cobrar" value={totalStr || '—'} accent="amber" />
        <Card label="Cobros con saldo" value={items.length} />
        <Card label="Vencidos" value={vencidos} accent={vencidos ? 'red' : undefined} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-surface-200/50 text-sm py-10 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : items.length === 0 ? (
        <p className="text-surface-200/50 text-sm py-10 text-center">
          🎉 No hay nada pendiente de cobro. ¡Todo al día!
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((c) => {
            const est = estadoPago(c)
            const meta = EST[est] || EST.pendiente
            const Icon = meta.icon
            const saldo = saldoCobro(c)
            const pagado = Number(c.pagado) || 0
            const venc = vencTexto(c.vencimiento)
            return (
              <div
                key={c.id}
                className={`glass rounded-xl p-4 ring-1 flex flex-wrap items-center gap-3 ${est === 'vencido' ? 'ring-red-500/25' : 'ring-primary-500/10'}`}
              >
                {/* Estado */}
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ring-1 shrink-0 ${meta.cls}`}>
                  <Icon className="w-3.5 h-3.5" /> {meta.label}
                </span>

                {/* Cliente + concepto */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => verCliente(c.cliente_id)} className="text-sm font-medium text-white hover:text-primary-300 transition">
                      {c.cliente_nombre}
                    </button>
                    {c.tipo && c.tipo !== 'mensual' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tipoCobroMeta(c.tipo).cls}`}>
                        {tipoCobroMeta(c.tipo).label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-surface-200/40">
                    <span>{c.concepto || c.periodo}</span>
                    {venc && (
                      <>
                        {' · '}
                        <span className={venc.tone === 'red' ? 'text-red-400' : venc.tone === 'amber' ? 'text-amber-300' : 'text-surface-200/40'}>
                          <CalendarClock className="w-3 h-3 inline mb-0.5" /> {venc.txt}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                {/* Montos */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-amber-300 tabular-nums">{fmtMoney(saldo, c.moneda)}</p>
                  <p className="text-[11px] text-surface-200/40 tabular-nums">
                    {pagado > 0 ? `pagó ${fmtMoney(pagado, c.moneda)} de ${fmtMoney(c.monto, c.moneda)}` : `de ${fmtMoney(c.monto, c.moneda)}`}
                  </p>
                </div>

                {/* Acción */}
                <button
                  onClick={() => setGestion(c)}
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-[#0a0f0d] font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Registrar pago
                </button>
              </div>
            )
          })}
        </div>
      )}

      {gestion && (
        <GestionPagos cobro={gestion} onClose={() => setGestion(null)} onChanged={load} />
      )}
    </div>
  )
}

function Card({ label, value, accent }) {
  const cls = accent === 'amber' ? 'text-amber-300' : accent === 'red' ? 'text-red-300' : 'text-white'
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-surface-200/50">{label}</p>
      <p className={`text-2xl font-bold mt-1 tabular-nums ${cls}`}>{value}</p>
    </div>
  )
}
