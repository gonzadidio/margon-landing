import { useEffect, useState } from 'react'
import { Zap, Trash2, Loader2, Check } from 'lucide-react'
import { apiFetch } from './api'

const fmtMoney = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(n) || 0)

export default function Facturacion() {
  const [periodo, setPeriodo] = useState(() => new Date().toISOString().slice(0, 7))
  const [cobros, setCobros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [generando, setGenerando] = useState(false)

  async function load() {
    setLoading(true)
    try {
      setCobros(await apiFetch(`/cobros?periodo=${periodo}`))
      setError('')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [periodo])

  async function generar() {
    setGenerando(true)
    setMsg('')
    setError('')
    try {
      const r = await apiFetch('/cobros/generar', {
        method: 'POST',
        body: JSON.stringify({ periodo }),
      })
      setMsg(r.creados > 0
        ? `Se generaron ${r.creados} cobro(s) para ${periodo}.`
        : 'No había cobros nuevos para generar (ya estaban todos).')
      load()
    } catch (e) { setError(e.message) }
    finally { setGenerando(false) }
  }

  async function updateMonto(c, monto) {
    await apiFetch(`/cobros/${c.id}`, { method: 'PUT', body: JSON.stringify({ monto }) })
    setCobros((cs) => cs.map((x) => (x.id === c.id ? { ...x, monto } : x)))
  }

  async function remove(c) {
    if (!confirm(`¿Quitar el cobro de "${c.cliente_nombre}" de ${periodo}?`)) return
    await apiFetch(`/cobros/${c.id}`, { method: 'DELETE' })
    load()
  }

  const total = cobros.reduce((s, c) => s + Number(c.monto), 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Facturación mensual</h2>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="rounded-lg bg-surface-900/60 border border-primary-500/15 px-3 py-2 text-white text-sm outline-none focus:border-primary-400/50"
          />
          <button
            onClick={generar}
            disabled={generando}
            className="flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-[#0a0f0d] font-semibold text-sm px-3.5 py-2 transition"
          >
            {generando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Generar facturación del mes
          </button>
        </div>
      </div>

      <p className="text-sm text-surface-200/50">
        Crea un cobro por cada cliente <span className="text-primary-300">activo</span> con abono &gt; 0.
        Si lo corrés de nuevo, no duplica los que ya existen.
      </p>

      {msg && <p className="flex items-center gap-2 text-sm text-primary-300"><Check className="w-4 h-4" /> {msg}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-surface-200/50 text-sm py-10 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : cobros.length === 0 ? (
        <p className="text-surface-200/50 text-sm py-10 text-center">
          No hay cobros para {periodo}. Usá “Generar facturación del mes”.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-primary-500/10">
          <table className="w-full text-sm">
            <thead className="bg-surface-900/40 text-surface-200/50 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-4 py-3">Cliente</th>
                <th className="text-left font-medium px-4 py-3">Estado</th>
                <th className="text-right font-medium px-4 py-3">Monto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-500/5">
              {cobros.map((c) => (
                <tr key={c.id} className="hover:bg-surface-900/30 transition">
                  <td className="px-4 py-3 font-medium text-white">{c.cliente_nombre}</td>
                  <td className="px-4 py-3 text-surface-200/70">{c.estado}</td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number" min="0" step="0.01"
                      defaultValue={c.monto}
                      onBlur={(e) => {
                        const v = Number(e.target.value) || 0
                        if (v !== Number(c.monto)) updateMonto(c, v)
                      }}
                      className="w-32 text-right tabular-nums rounded-lg bg-surface-900/60 border border-primary-500/15 px-2 py-1.5 text-white outline-none focus:border-primary-400/50"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(c)} className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-primary-500/10 font-semibold text-white">
                <td className="px-4 py-3" colSpan={2}>Total facturado</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtMoney(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
