import { useEffect, useState } from 'react'
import { Loader2, Zap, Plus, Printer, Trash2, Check, Pencil } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, fmtFecha, periodoActual, tipoCobroMeta, estadoPago, saldoCobro } from './format'
import { useNav } from './nav'
import GestionPagos from './GestionPagos'
import CobroForm, { nuevoCobro, editarCobro } from './CobroForm'
import Comprobante from './Comprobante'

const EST_PILL = { vencido: 'ad-pill-red', parcial: 'ad-pill-blue', pendiente: 'ad-pill-amber', pagado: 'ad-pill-green' }
const EST_LBL = { vencido: 'Vencido', parcial: 'Parcial', pendiente: 'Pendiente', pagado: 'Pagado' }

function porMoneda(rows, campo) {
  const acc = {}
  for (const r of rows || []) acc[r.moneda] = (acc[r.moneda] || 0) + Number(r[campo] || 0)
  return acc
}
const moneyStr = (map) => { const e = Object.entries(map).filter(([, v]) => v); return e.length ? e.map(([m, v]) => fmtMoney(v, m)).join('  ·  ') : '—' }

export default function Cobros() {
  const [vista, setVista] = useState('pendientes') // pendientes | mes
  const [periodo, setPeriodo] = useState(periodoActual)
  const [pend, setPend] = useState([])
  const [mes, setMes] = useState([])
  const [todos, setTodos] = useState([])
  const [resumen, setResumen] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [gestion, setGestion] = useState(null)
  const [manual, setManual] = useState(null)
  const [comprobante, setComprobante] = useState(null)
  const { verCliente } = useNav()

  async function load() {
    setLoading(true)
    try {
      const [p, m, t, r, c] = await Promise.all([
        apiFetch('/pendientes'),
        apiFetch(`/cobros?periodo=${periodo}`),
        apiFetch('/cobros'),
        apiFetch(`/resumen?periodo=${periodo}`),
        apiFetch('/clientes'),
      ])
      setPend(p); setMes(m); setTodos(t); setResumen(r); setClientes(c); setError('')
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [periodo])

  async function generar() {
    setMsg(''); setError('')
    try {
      const r = await apiFetch('/cobros/generar', { method: 'POST', body: JSON.stringify({ periodo }) })
      setMsg(r.creados > 0 ? `Se generaron ${r.creados} cobro(s) para ${periodo}.` : 'Ya estaban todos generados.')
      load()
    } catch (e) { setError(e.message) }
  }

  async function guardarManual(data) {
    if (data.id) await apiFetch(`/cobros/${data.id}`, { method: 'PUT', body: JSON.stringify(data) })
    else await apiFetch('/cobros', { method: 'POST', body: JSON.stringify(data) })
    setManual(null)
    if (!data.id && data.periodo && data.periodo !== periodo) setPeriodo(data.periodo); else load()
  }

  async function remove(c) {
    if (!confirm(`¿Quitar el cobro de "${c.cliente_nombre}"?`)) return
    await apiFetch(`/cobros/${c.id}`, { method: 'DELETE' }); load()
  }

  const porCobrar = porMoneda(pend.map((c) => ({ moneda: c.moneda, s: saldoCobro(c) })), 's')
  const rows = vista === 'pendientes' ? pend : vista === 'mes' ? mes : todos

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold ad-ink tracking-tight">Cobros</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setManual(nuevoCobro(clientes[0]?.id || ''))} disabled={!clientes.length} className="ad-btn ad-btn-ghost ad-btn-sm"><Plus className="w-4 h-4" /> Cobro manual</button>
          <button onClick={generar} className="ad-btn ad-btn-primary ad-btn-sm"><Zap className="w-4 h-4" /> Generar mes</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Kpi label="Por cobrar (total)" value={moneyStr(porCobrar)} tone="amber" sub={`${pend.length} con saldo`} />
        <Kpi label={`Cobrado ${periodo}`} value={moneyStr(porMoneda(resumen, 'cobrado'))} tone="green" />
        <Kpi label={`Facturado ${periodo}`} value={moneyStr(porMoneda(resumen, 'facturado'))} />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex rounded-lg border ad-line overflow-hidden text-sm bg-transparent">
          <button onClick={() => setVista('pendientes')} className={`px-3.5 py-2 font-medium ${vista === 'pendientes' ? 'bg-primary-500/15 text-primary-300' : 'ad-muted hover:bg-white/5'}`}>Por cobrar</button>
          <button onClick={() => setVista('mes')} className={`px-3.5 py-2 font-medium border-l ad-line ${vista === 'mes' ? 'bg-primary-500/15 text-primary-300' : 'ad-muted hover:bg-white/5'}`}>Del mes</button>
          <button onClick={() => setVista('todos')} className={`px-3.5 py-2 font-medium border-l ad-line ${vista === 'todos' ? 'bg-primary-500/15 text-primary-300' : 'ad-muted hover:bg-white/5'}`}>Todos</button>
        </div>
        {vista === 'mes' && <input type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="ad-input !w-auto" />}
        {vista === 'todos' && <span className="text-xs ad-faint">{todos.length} cobro(s) en total</span>}
      </div>

      {msg && <p className="flex items-center gap-2 text-sm text-primary-300"><Check className="w-4 h-4" /> {msg}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 ad-muted text-sm py-10 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</div>
      ) : rows.length === 0 ? (
        <p className="ad-muted text-sm py-10 text-center">{vista === 'pendientes' ? '🎉 No hay nada pendiente de cobro.' : vista === 'todos' ? 'Todavía no hay cobros cargados.' : `No hay cobros para ${periodo}. Usá “Generar mes”.`}</p>
      ) : (
        <div className="ad-card overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              <th className="ad-th">Cliente</th><th className="ad-th">Tipo</th><th className="ad-th">Fecha</th>
              <th className="ad-th text-right">Monto</th><th className="ad-th">Pagado / Saldo</th>
              <th className="ad-th text-center">Estado</th><th className="ad-th"></th>
            </tr></thead>
            <tbody>
              {rows.map((c) => {
                const est = estadoPago(c); const saldo = saldoCobro(c); const pagado = Number(c.pagado) || 0
                return (
                  <tr key={c.id} className="ad-hover transition">
                    <td className="ad-td">
                      <button onClick={() => verCliente(c.cliente_id)} className="font-semibold ad-ink hover:text-primary-300 transition text-left">{c.cliente_nombre}</button>
                      {c.concepto && <p className="text-xs ad-faint">{c.concepto}</p>}
                    </td>
                    <td className="ad-td"><span className={`ad-pill ${['setup', 'unico'].includes(c.tipo) ? (c.tipo === 'setup' ? 'ad-pill-violet' : 'ad-pill-blue') : 'ad-pill-gray'}`}>{tipoCobroMeta(c.tipo).label}</span></td>
                    <td className="ad-td ad-muted whitespace-nowrap">
                      {fmtFecha(c.fecha_emision) || c.periodo}
                      {c.fecha_pago && <span className="block text-[11px] ad-faint">pagó {fmtFecha(c.fecha_pago)}</span>}
                    </td>
                    <td className="ad-td text-right tabular-nums ad-ink">{fmtMoney(c.monto, c.moneda)}</td>
                    <td className="ad-td text-xs tabular-nums">
                      {est === 'pagado' ? <span className="text-primary-300">{fmtMoney(pagado, c.moneda)}</span>
                        : pagado > 0 ? <span><span className="text-sky-300">{fmtMoney(pagado, c.moneda)}</span><span className="ad-faint"> · falta </span><span className="text-amber-300">{fmtMoney(saldo, c.moneda)}</span></span>
                        : <span className="ad-faint">—</span>}
                    </td>
                    <td className="ad-td text-center"><span className={`ad-pill ${EST_PILL[est]}`}>{EST_LBL[est]}</span></td>
                    <td className="ad-td">
                      <div className="flex items-center justify-end gap-1">
                        {saldo > 0 && <button onClick={() => setGestion(c)} className="ad-btn ad-btn-soft ad-btn-sm">Registrar pago</button>}
                        <button onClick={() => setManual(editarCobro(c))} title="Editar cobro" className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-primary-300 transition"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setComprobante(c)} title="Comprobante" className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-primary-300 transition"><Printer className="w-4 h-4" /></button>
                        <button onClick={() => remove(c)} title="Quitar" className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {gestion && <GestionPagos cobro={gestion} onClose={() => setGestion(null)} onChanged={load} />}
      {manual && <CobroForm initial={manual} clientes={clientes} onSave={guardarManual} onClose={() => setManual(null)} />}
      {comprobante && <Comprobante cobro={comprobante} hoy={new Date().toISOString()} onClose={() => setComprobante(null)} />}
    </div>
  )
}

function Kpi({ label, value, tone, sub }) {
  const cls = tone === 'amber' ? 'text-amber-300' : tone === 'green' ? 'text-primary-300' : 'ad-ink'
  return (
    <div className="ad-card p-4 min-w-0">
      <p className="text-xs uppercase tracking-wide ad-muted truncate">{label}</p>
      <p className={`text-lg lg:text-xl font-extrabold mt-1.5 tabular-nums tracking-tight leading-tight break-words ${cls}`}>{value}</p>
      {sub && <p className="text-xs ad-faint mt-0.5">{sub}</p>}
    </div>
  )
}
