import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, Trash2, X } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, fmtFecha } from './format'

// Modal para ver y registrar los abonos (pagos parciales) de un cobro.
export default function GestionPagos({ cobro, onClose, onChanged }) {
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

        <div className="grid grid-cols-3 gap-2 text-center">
          <Mini label="Total" value={fmtMoney(cobro.monto, cobro.moneda)} />
          <Mini label="Pagado" value={fmtMoney(pagado, cobro.moneda)} accent="primary" />
          <Mini label="Saldo" value={fmtMoney(saldo, cobro.moneda)} accent={saldo > 0 ? 'amber' : undefined} />
        </div>

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

        {saldo > 0 ? (
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
        ) : (
          !loading && (
            <p className="flex items-center gap-2 text-sm text-primary-300 border-t border-primary-500/10 pt-4">
              <CheckCircle2 className="w-4 h-4" /> Cobro saldado por completo.
            </p>
          )
        )}
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

const inputCls =
  'w-full rounded-lg bg-surface-900/60 border border-primary-500/15 px-3 py-2 text-white outline-none focus:border-primary-400/50 transition text-sm'
