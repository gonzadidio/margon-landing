import { useEffect, useState } from 'react'
import { Zap, Trash2, Loader2, Check, Printer, Plus } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, tipoCobroMeta } from './format'
import Comprobante from './Comprobante'
import CobroForm, { nuevoCobro } from './CobroForm'

export default function Facturacion() {
  const [periodo, setPeriodo] = useState(() => new Date().toISOString().slice(0, 7))
  const [cobros, setCobros] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [generando, setGenerando] = useState(false)
  const [comprobante, setComprobante] = useState(null)
  const [manual, setManual] = useState(null) // null | form de cobro manual

  async function load() {
    setLoading(true)
    try {
      const [cob, cli] = await Promise.all([
        apiFetch(`/cobros?periodo=${periodo}`),
        apiFetch('/clientes'),
      ])
      setCobros(cob)
      setClientes(cli)
      setError('')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [periodo])

  async function guardarManual(data) {
    await apiFetch('/cobros', { method: 'POST', body: JSON.stringify(data) })
    setManual(null)
    // Nos movemos al período del cobro cargado para que se vea al instante.
    if (data.periodo && data.periodo !== periodo) setPeriodo(data.periodo)
    else load()
  }

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

  // Total agrupado por moneda (ARS y USD no se mezclan)
  const totalPorMoneda = cobros.reduce((acc, c) => {
    const m = c.moneda || 'ARS'
    acc[m] = (acc[m] || 0) + Number(c.monto)
    return acc
  }, {})
  const totalStr = Object.entries(totalPorMoneda).map(([m, v]) => fmtMoney(v, m)).join('  ·  ') || fmtMoney(0)

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
            onClick={() => setManual(nuevoCobro(clientes[0]?.id || ''))}
            disabled={clientes.length === 0}
            className="flex items-center gap-2 rounded-lg border border-primary-500/25 text-primary-300 hover:bg-primary-500/10 disabled:opacity-40 font-semibold text-sm px-3.5 py-2 transition"
          >
            <Plus className="w-4 h-4" /> Cobro manual
          </button>
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
                <th className="text-left font-medium px-4 py-3">Tipo</th>
                <th className="text-left font-medium px-4 py-3">Estado</th>
                <th className="text-right font-medium px-4 py-3">Monto</th>
                <th className="text-center font-medium px-4 py-3">Moneda</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-500/5">
              {cobros.map((c) => (
                <tr key={c.id} className="hover:bg-surface-900/30 transition">
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">{c.cliente_nombre}</span>
                    {c.concepto && <p className="text-xs text-surface-200/40">{c.concepto}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tipoCobroMeta(c.tipo).cls}`}>
                      {tipoCobroMeta(c.tipo).label}
                    </span>
                  </td>
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
                  <td className="px-4 py-3 text-center text-xs text-surface-200/60">{c.moneda || 'ARS'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setComprobante(c)} title="Comprobante de pago" className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-primary-300 transition">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(c)} title="Quitar cobro" className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-red-400 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-primary-500/10 font-semibold text-white">
                <td className="px-4 py-3" colSpan={3}>Total facturado</td>
                <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap" colSpan={2}>{totalStr}</td>
                <td></td>
              </tr>
            </tfoot>
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

      {manual && (
        <CobroForm
          initial={manual}
          clientes={clientes}
          onSave={guardarManual}
          onClose={() => setManual(null)}
        />
      )}
    </div>
  )
}
