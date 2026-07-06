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
      setPagos(p); setPagado(p.reduce((s, x) => s + Number(x.monto), 0)); setError('')
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { loadPagos() }, [])

  async function agregar(e) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await apiFetch(`/cobros/${cobro.id}/pagos`, { method: 'POST', body: JSON.stringify({ monto: Number(monto) || 0, fecha, metodo }) })
      setMonto(''); setMetodo(''); await loadPagos(); onChanged?.()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  async function borrar(p) {
    if (!confirm(`¿Eliminar el pago de ${fmtMoney(p.monto, cobro.moneda)}?`)) return
    try { await apiFetch(`/pagos/${p.id}`, { method: 'DELETE' }); await loadPagos(); onChanged?.() }
    catch (err) { setError(err.message) }
  }

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="ad-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold ad-ink">Pagos · {cobro.cliente_nombre}</h3>
            <p className="text-xs ad-muted">{cobro.concepto || cobro.periodo}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#eef1ef] ad-muted"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Mini label="Total" value={fmtMoney(cobro.monto, cobro.moneda)} />
          <Mini label="Pagado" value={fmtMoney(pagado, cobro.moneda)} tone="green" />
          <Mini label="Saldo" value={fmtMoney(saldo, cobro.moneda)} tone={saldo > 0 ? 'amber' : ''} />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 ad-muted text-sm py-4 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</div>
        ) : pagos.length > 0 ? (
          <div className="space-y-1">
            {pagos.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-[#f5f7f6] px-3 py-2">
                <div className="min-w-0">
                  <span className="text-sm tabular-nums ad-ink font-medium">{fmtMoney(p.monto, cobro.moneda)}</span>
                  <span className="text-xs ad-muted"> · {fmtFecha(p.fecha)}{p.metodo ? ` · ${p.metodo}` : ''}</span>
                </div>
                <button onClick={() => borrar(p)} className="p-1 rounded hover:bg-[#e6eae8] ad-faint hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        ) : <p className="text-sm ad-faint text-center py-2">Todavía no hay pagos registrados.</p>}

        {saldo > 0 ? (
          <form onSubmit={agregar} className="border-t ad-line pt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Registrar un pago</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 col-span-2">
                <span className="text-xs ad-muted">Monto ({cobro.moneda})</span>
                <div className="flex gap-2">
                  <input type="number" min="0" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} className="ad-input" placeholder={String(saldo)} />
                  <button type="button" onClick={() => setMonto(String(saldo))} className="ad-btn ad-btn-soft ad-btn-sm shrink-0">Saldo</button>
                </div>
              </label>
              <label className="flex flex-col gap-1.5"><span className="text-xs ad-muted">Fecha</span><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="ad-input" /></label>
              <label className="flex flex-col gap-1.5"><span className="text-xs ad-muted">Método</span><input value={metodo} onChange={(e) => setMetodo(e.target.value)} placeholder="Transf., efectivo…" className="ad-input" /></label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end"><button type="submit" disabled={saving} className="ad-btn ad-btn-primary">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Registrar pago</button></div>
          </form>
        ) : !loading && (
          <p className="flex items-center gap-2 text-sm text-primary-700 border-t ad-line pt-4"><CheckCircle2 className="w-4 h-4" /> Cobro saldado por completo.</p>
        )}
      </div>
    </div>
  )
}

function Mini({ label, value, tone }) {
  const cls = tone === 'green' ? 'text-primary-700' : tone === 'amber' ? 'text-amber-700' : 'ad-ink'
  return (
    <div className="rounded-lg bg-[#f5f7f6] p-2.5">
      <p className="text-[10px] uppercase tracking-wide ad-faint">{label}</p>
      <p className={`text-sm font-bold mt-0.5 tabular-nums ${cls}`}>{value}</p>
    </div>
  )
}
