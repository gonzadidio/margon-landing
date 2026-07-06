import { useEffect, useState } from 'react'
import {
  Loader2, CheckCircle2, Clock, AlertTriangle, PieChart, Printer, Plus,
} from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, tipoCobroMeta, estadoPago, saldoCobro } from './format'
import Comprobante from './Comprobante'
import GestionPagos from './GestionPagos'

const ESTADO_META = {
  pendiente: { label: 'Pendiente', icon: Clock,        cls: 'bg-amber-500/15 text-amber-300 ring-amber-500/20' },
  parcial:   { label: 'Parcial',   icon: PieChart,     cls: 'bg-sky-500/15 text-sky-300 ring-sky-500/20' },
  pagado:    { label: 'Pagado',    icon: CheckCircle2, cls: 'bg-primary-500/15 text-primary-300 ring-primary-500/20' },
  vencido:   { label: 'Vencido',   icon: AlertTriangle,cls: 'bg-red-500/15 text-red-300 ring-red-500/20' },
}

export default function Pagos() {
  const [periodo, setPeriodo] = useState(() => new Date().toISOString().slice(0, 7))
  const [cobros, setCobros] = useState([])
  const [resumen, setResumen] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comprobante, setComprobante] = useState(null)
  const [gestion, setGestion] = useState(null) // cobro cuyos pagos estamos gestionando

  async function load() {
    setLoading(true)
    try {
      const [c, r] = await Promise.all([
        apiFetch(`/cobros?periodo=${periodo}`),
        apiFetch(`/resumen?periodo=${periodo}`),
      ])
      setCobros(c)
      setResumen(r)
      setError('')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [periodo])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Estado de pagos</h2>
        <input
          type="month"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="rounded-lg bg-surface-900/60 border border-primary-500/15 px-3 py-2 text-white text-sm outline-none focus:border-primary-400/50"
        />
      </div>

      {resumen.length > 0 && (() => {
        const money = (campo) => resumen.map((r) => fmtMoney(r[campo], r.moneda)).join('  ·  ')
        const sum = (campo) => resumen.reduce((s, r) => s + Number(r[campo] || 0), 0)
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card label="Facturado" value={money('facturado')} sub={`${sum('cantidad')} cobro(s)`} />
            <Card label="Cobrado" value={money('cobrado')} sub={`${sum('pagados')} completo(s)`} accent="primary" />
            <Card label="Pendiente" value={money('pendiente')} sub="saldo por cobrar" accent="amber" />
          </div>
        )
      })()}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-surface-200/50 text-sm py-10 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : cobros.length === 0 ? (
        <p className="text-surface-200/50 text-sm py-10 text-center">
          No hay cobros para {periodo}. Generalos primero en “Facturación”.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-primary-500/10">
          <table className="w-full text-sm">
            <thead className="bg-surface-900/40 text-surface-200/50 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-4 py-3">Cliente</th>
                <th className="text-right font-medium px-4 py-3">Monto</th>
                <th className="text-left font-medium px-4 py-3">Pagado / Saldo</th>
                <th className="text-center font-medium px-4 py-3">Estado</th>
                <th className="text-center font-medium px-4 py-3">Pagos</th>
                <th className="text-center font-medium px-4 py-3">Comp.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-500/5">
              {cobros.map((c) => {
                const est = estadoPago(c)
                const meta = ESTADO_META[est]
                const Icon = meta.icon
                const saldo = saldoCobro(c)
                const pagado = Number(c.pagado) || 0
                return (
                  <tr key={c.id} className={`transition ${est !== 'pagado' ? 'bg-red-500/[0.02]' : ''} hover:bg-surface-900/30`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{c.cliente_nombre}</span>
                        {c.tipo && c.tipo !== 'mensual' && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tipoCobroMeta(c.tipo).cls}`}>
                            {tipoCobroMeta(c.tipo).label}
                          </span>
                        )}
                      </div>
                      {c.concepto && <p className="text-xs text-surface-200/40">{c.concepto}</p>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmtMoney(c.monto, c.moneda)}</td>
                    <td className="px-4 py-3 tabular-nums text-xs">
                      {est === 'pagado' ? (
                        <span className="text-primary-300">{fmtMoney(pagado, c.moneda)}</span>
                      ) : pagado > 0 ? (
                        <span>
                          <span className="text-sky-300">{fmtMoney(pagado, c.moneda)}</span>
                          <span className="text-surface-200/40"> · falta </span>
                          <span className="text-amber-300">{fmtMoney(saldo, c.moneda)}</span>
                        </span>
                      ) : (
                        <span className="text-surface-200/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ring-1 ${meta.cls}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">{meta.label}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setGestion(c)}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-primary-500/20 text-primary-300 hover:bg-primary-500/10 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Registrar
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setComprobante(c)}
                        title="Comprobante"
                        className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-primary-300 transition"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {comprobante && (
        <Comprobante cobro={comprobante} hoy={new Date().toISOString()} onClose={() => setComprobante(null)} />
      )}

      {gestion && (
        <GestionPagos cobro={gestion} onClose={() => setGestion(null)} onChanged={load} />
      )}
    </div>
  )
}

function Card({ label, value, sub, accent }) {
  const valueCls =
    accent === 'primary' ? 'text-primary-300'
    : accent === 'amber' ? 'text-amber-300'
    : 'text-white'
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-surface-200/50">{label}</p>
      <p className={`text-2xl font-bold mt-1 tabular-nums ${valueCls}`}>{value}</p>
      <p className="text-xs text-surface-200/40 mt-0.5">{sub}</p>
    </div>
  )
}
