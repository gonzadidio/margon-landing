import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, Clock, AlertTriangle, Printer } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, tipoCobroMeta } from './format'
import Comprobante from './Comprobante'

const ESTADOS = [
  { v: 'pendiente', label: 'Pendiente', icon: Clock, cls: 'bg-amber-500/15 text-amber-300 ring-amber-500/20' },
  { v: 'pagado', label: 'Pagado', icon: CheckCircle2, cls: 'bg-primary-500/15 text-primary-300 ring-primary-500/20' },
  { v: 'vencido', label: 'Vencido', icon: AlertTriangle, cls: 'bg-red-500/15 text-red-300 ring-red-500/20' },
]

export default function Pagos() {
  const [periodo, setPeriodo] = useState(() => new Date().toISOString().slice(0, 7))
  const [cobros, setCobros] = useState([])
  const [resumen, setResumen] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comprobante, setComprobante] = useState(null)

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

  async function cambiarEstado(c, estado) {
    const updated = await apiFetch(`/cobros/${c.id}`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    })
    setCobros((cs) => cs.map((x) => (x.id === c.id ? { ...x, ...updated } : x)))
    // refrescamos totales
    apiFetch(`/resumen?periodo=${periodo}`).then(setResumen).catch(() => {})
  }

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
        // El resumen viene agrupado por moneda; combinamos las monedas en cada card.
        const money = (campo) => resumen.map((r) => fmtMoney(r[campo], r.moneda)).join('  ·  ')
        const sum = (campo) => resumen.reduce((s, r) => s + Number(r[campo] || 0), 0)
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card label="Facturado" value={money('facturado')} sub={`${sum('cantidad')} cobro(s)`} />
            <Card label="Cobrado" value={money('cobrado')} sub={`${sum('pagados')} pagado(s)`} accent="primary" />
            <Card label="Pendiente" value={money('pendiente')} sub="por cobrar" accent="amber" />
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
                <th className="text-left font-medium px-4 py-3">Pago</th>
                <th className="text-center font-medium px-4 py-3">Estado</th>
                <th className="text-center font-medium px-4 py-3">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-500/5">
              {cobros.map((c) => {
                const deudor = c.estado !== 'pagado'
                return (
                  <tr key={c.id} className={`transition ${deudor ? 'bg-red-500/[0.03]' : ''} hover:bg-surface-900/30`}>
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
                    <td className="px-4 py-3 text-surface-200/60">{c.fecha_pago || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {ESTADOS.map(({ v, label, icon: Icon, cls }) => (
                          <button
                            key={v}
                            onClick={() => cambiarEstado(c, v)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ring-1 transition ${
                              c.estado === v ? cls : 'text-surface-200/40 ring-transparent hover:bg-surface-800'
                            }`}
                            title={label}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">{label}</span>
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setComprobante(c)}
                        title="Generar comprobante de pago"
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-primary-500/20 text-primary-300 hover:bg-primary-500/10 transition"
                      >
                        <Printer className="w-3.5 h-3.5" /> Imprimir
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
        <Comprobante
          cobro={comprobante}
          hoy={new Date().toISOString()}
          onClose={() => setComprobante(null)}
        />
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
