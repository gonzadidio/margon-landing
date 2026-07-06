import { useEffect, useState } from 'react'
import {
  Loader2, CheckCircle2, Clock, AlertTriangle, PieChart, Printer, Trash2, Plus, X,
} from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, fmtFecha, tipoCobroMeta, estadoPago, saldoCobro } from './format'
import Comprobante from './Comprobante'

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

function GestionPagos({ cobro, onClose, onChanged }) {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pagado, setPagado] = useState(Number(cobro.pagado) || 0)
  const saldo = Math.max((Number(cobro.monto) || 0) - pagado, 0)

  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [metodo, setMetodo] = useState('')

  async function loadPagos() {
    setLoading(true)
    try {
      const p = await apiFetch(`/cobros/${cobro.id}/pagos`)
      setPagos(p)
      setPagado(p.reduce((s, x) => s + Number(x.monto), 0))
      setError('')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadPagos() }, [])

  async function agregar(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await apiFetch(`/cobros/${cobro.id}/pagos`, {
        method: 'POST',
        body: JSON.stringify({ monto: Number(monto) || 0, fecha, metodo }),
      })
      setMonto(''); setMetodo('')
      await loadPagos()
      onChanged?.()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function borrar(p) {
    if (!confirm(`¿Eliminar el pago de ${fmtMoney(p.monto, cobro.moneda)}?`)) return
    try {
      await apiFetch(`/pagos/${p.id}`, { method: 'DELETE' })
      await loadPagos()
      onChanged?.()
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass relative w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Pagos · {cobro.cliente_nombre}</h3>
            <p className="text-xs text-surface-200/50">{cobro.concepto || cobro.periodo}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-800 text-surface-200/60"><X className="w-5 h-5" /></button>
        </div>

        {/* Resumen del cobro */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <Mini label="Total" value={fmtMoney(cobro.monto, cobro.moneda)} />
          <Mini label="Pagado" value={fmtMoney(pagado, cobro.moneda)} accent="primary" />
          <Mini label="Saldo" value={fmtMoney(saldo, cobro.moneda)} accent={saldo > 0 ? 'amber' : undefined} />
        </div>

        {/* Lista de abonos */}
        {loading ? (
          <div className="flex items-center gap-2 text-surface-200/50 text-sm py-4 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
          </div>
        ) : pagos.length > 0 ? (
          <div className="space-y-1">
            {pagos.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-900/40 px-3 py-2">
                <div className="min-w-0">
                  <span className="text-sm tabular-nums text-white">{fmtMoney(p.monto, cobro.moneda)}</span>
                  <span className="text-xs text-surface-200/40"> · {fmtFecha(p.fecha)}{p.metodo ? ` · ${p.metodo}` : ''}</span>
                </div>
                <button onClick={() => borrar(p)} className="p-1 rounded hover:bg-surface-800 text-surface-200/50 hover:text-red-400 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-200/40 text-center py-2">Todavía no hay pagos registrados.</p>
        )}

        {/* Nuevo abono */}
        {saldo > 0 && (
          <form onSubmit={agregar} className="border-t border-primary-500/10 pt-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-300/70">Registrar un pago</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 col-span-2">
                <span className="text-xs text-surface-200/50">Monto ({cobro.moneda})</span>
                <div className="flex gap-2">
                  <input type="number" min="0" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} className={inputCls} placeholder={String(saldo)} />
                  <button type="button" onClick={() => setMonto(String(saldo))} className="shrink-0 text-xs rounded-lg border border-primary-500/20 text-primary-300 px-3 hover:bg-primary-500/10 transition">
                    Saldo
                  </button>
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-surface-200/50">Fecha</span>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-surface-200/50">Método</span>
                <input value={metodo} onChange={(e) => setMetodo(e.target.value)} placeholder="Transf., efectivo…" className={inputCls} />
              </label>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-[#0a0f0d] font-semibold text-sm transition">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Registrar pago
              </button>
            </div>
          </form>
        )}
        {saldo <= 0 && !loading && (
          <p className="flex items-center gap-2 text-sm text-primary-300 border-t border-primary-500/10 pt-4">
            <CheckCircle2 className="w-4 h-4" /> Cobro saldado por completo.
          </p>
        )}
        {error && saldo <= 0 && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  )
}

function Mini({ label, value, accent }) {
  const cls = accent === 'primary' ? 'text-primary-300' : accent === 'amber' ? 'text-amber-300' : 'text-white'
  return (
    <div className="glass rounded-lg p-2.5">
      <p className="text-[10px] uppercase tracking-wide text-surface-200/40">{label}</p>
      <p className={`text-sm font-bold mt-0.5 tabular-nums ${cls}`}>{value}</p>
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

const inputCls =
  'w-full rounded-lg bg-surface-900/60 border border-primary-500/15 px-3 py-2 text-white outline-none focus:border-primary-400/50 transition text-sm'
