import { useEffect, useState, useCallback } from 'react'
import {
  ArrowLeft, Loader2, Mail, Phone, Globe, Calendar, Pencil, Plus, X,
  CheckCircle2, Clock, Github, ExternalLink, Trash2, Printer,
} from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, fmtFecha, tipoCobroMeta, estadoPago, saldoCobro, MONEDAS } from './format'
import CobroForm, { nuevoCobro, editarCobro } from './CobroForm'
import GestionPagos from './GestionPagos'
import ClienteArchivos from './ClienteArchivos'
import Comprobante from './Comprobante'

const EST_PILL = { vencido: 'ad-pill-red', parcial: 'ad-pill-blue', pendiente: 'ad-pill-amber', pagado: 'ad-pill-green' }
const EST_LBL = { vencido: 'Vencido', parcial: 'Parcial', pendiente: 'Pendiente', pagado: 'Pagado' }
const PROY_EST = ['propuesta', 'desarrollo', 'produccion', 'mantenimiento', 'pausado', 'finalizado']
const PROY_LBL = { propuesta: 'Propuesta', desarrollo: 'Desarrollo', produccion: 'Producción', mantenimiento: 'Mantenimiento', pausado: 'Pausado', finalizado: 'Finalizado' }
const SEG_TIPOS = ['nota', 'llamada', 'email', 'reunion', 'whatsapp', 'tarea']

const TABS = ['Resumen', 'Pagos', 'Proyectos', 'Archivos', 'Notas']

export default function ClienteDetalle({ id, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Pagos')
  const [manual, setManual] = useState(null)
  const [gestion, setGestion] = useState(null)
  const [comprobante, setComprobante] = useState(null)
  const [proy, setProy] = useState(null)
  const [seg, setSeg] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    apiFetch(`/clientes/${id}`).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [id])
  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex items-center gap-2 ad-muted text-sm py-20 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Cargando ficha…</div>
  if (error) return <p className="text-sm text-red-400">{error}</p>
  if (!data) return null

  const pagado = {}, deuda = {}
  for (const c of data.cobros) { const m = c.moneda || 'ARS'; pagado[m] = (pagado[m] || 0) + Number(c.pagado || 0); const s = saldoCobro(c); if (s > 0) deuda[m] = (deuda[m] || 0) + s }
  const money = (map) => { const e = Object.entries(map).filter(([, v]) => v); return e.length ? e.map(([m, v]) => fmtMoney(v, m)).join(' · ') : '—' }
  // Setup inicial: suma de los cobros tipo 'setup'
  const setupMap = {}
  for (const c of data.cobros) if (c.tipo === 'setup') { const m = c.moneda || 'ARS'; setupMap[m] = (setupMap[m] || 0) + Number(c.monto || 0) }

  async function saveCobro(payload) {
    if (payload.id) await apiFetch(`/cobros/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) })
    else await apiFetch('/cobros', { method: 'POST', body: JSON.stringify(payload) })
    setManual(null); load()
  }
  async function delCobro(c) { if (confirm(`¿Eliminar este cobro (${c.concepto || c.periodo})?`)) { await apiFetch(`/cobros/${c.id}`, { method: 'DELETE' }); load() } }
  async function saveProy(d) {
    const body = JSON.stringify({ ...d, cliente_id: id, monto: Number(d.monto) || 0 })
    if (d.id) await apiFetch(`/proyectos/${d.id}`, { method: 'PUT', body }); else await apiFetch('/proyectos', { method: 'POST', body })
    setProy(null); load()
  }
  async function saveSeg(d) {
    const body = JSON.stringify({ ...d, cliente_id: id })
    if (d.id) await apiFetch(`/seguimientos/${d.id}`, { method: 'PUT', body }); else await apiFetch('/seguimientos', { method: 'POST', body })
    setSeg(null); load()
  }
  async function delProy(p) { if (confirm(`¿Eliminar el proyecto "${p.nombre}"?`)) { await apiFetch(`/proyectos/${p.id}`, { method: 'DELETE' }); load() } }
  async function delSeg(s) { if (confirm('¿Eliminar este seguimiento?')) { await apiFetch(`/seguimientos/${s.id}`, { method: 'DELETE' }); load() } }
  async function toggleSeg(s) { await apiFetch(`/seguimientos/${s.id}`, { method: 'PUT', body: JSON.stringify({ ...s, completado: !s.completado }) }); load() }

  return (
    <div className="space-y-5">
      <button onClick={onClose} className="flex items-center gap-1.5 text-sm ad-muted hover:ad-ink transition"><ArrowLeft className="w-4 h-4" /> Clientes</button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white grid place-items-center text-xl font-extrabold shrink-0">{data.nombre.slice(0, 2).toUpperCase()}</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold ad-ink flex items-center gap-2 flex-wrap">{data.nombre}<span className={`ad-pill ${data.estado === 'activo' ? 'ad-pill-green' : 'ad-pill-gray'}`}>{data.estado}</span></h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[13px] ad-muted">
            {data.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 ad-faint" /> <a href={`mailto:${data.email}`} className="hover:text-primary-300">{data.email}</a></span>}
            {data.telefono && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 ad-faint" /> {data.telefono}</span>}
            {data.sitio_url && <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 ad-faint" /> <a href={data.sitio_url} target="_blank" rel="noreferrer" className="hover:text-primary-300">{data.sitio_url}</a></span>}
            {data.fecha_alta && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 ad-faint" /> desde {fmtFecha(data.fecha_alta)}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Abono mensual" value={Number(data.monto_mensual) > 0 ? fmtMoney(data.monto_mensual, data.moneda) : '—'} />
        <Stat label="Cobrado total" value={money(pagado)} tone="green" />
        <Stat label="Deuda" value={money(deuda)} tone={Object.keys(deuda).length ? 'amber' : ''} />
        <Stat label="Proyectos" value={data.proyectos.length} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b ad-line overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition ${tab === t ? 'text-primary-300 border-primary-600' : 'ad-muted border-transparent hover:ad-ink'}`}>{t}</button>
        ))}
      </div>

      {/* ===== Resumen ===== */}
      {tab === 'Resumen' && (
        <div className="ad-card p-5 space-y-3">
          <div className="flex justify-between gap-3 items-center text-sm border-b ad-line pb-2">
            <span className="ad-muted">Setup inicial (pago único)</span>
            <div className="flex items-center gap-3">
              <span className="ad-ink font-medium tabular-nums">{money(setupMap)}</span>
              <button onClick={() => setManual(nuevoCobro(data.id, data.moneda))} className="ad-btn ad-btn-soft ad-btn-sm"><Plus className="w-3.5 h-3.5" /> Agregar</button>
            </div>
          </div>
          <Row label="Abono mensual" value={Number(data.monto_mensual) > 0 ? fmtMoney(data.monto_mensual, data.moneda) : '—'} />
          <Row label="Proyecto / referencia" value={data.proyecto || '—'} />
          <Row label="Canal de captación" value={data.canal || '—'} />
          <Row label="Día de cobro" value={data.dia_cobro || '—'} />
          <div>
            <p className="text-xs uppercase tracking-wide ad-faint mb-1">Notas</p>
            <p className="text-sm ad-ink whitespace-pre-wrap">{data.notas || '—'}</p>
          </div>
        </div>
      )}

      {/* ===== Pagos ===== */}
      {tab === 'Pagos' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="text-sm ad-muted">Cargá cobros y pagos con <b>cualquier fecha</b> — nuevo o histórico.</p>
            <button onClick={() => setManual(nuevoCobro(data.id, data.moneda))} className="ad-btn ad-btn-primary ad-btn-sm"><Plus className="w-4 h-4" /> Agregar cobro</button>
          </div>
          {data.cobros.length === 0 ? <p className="ad-faint text-sm py-8 text-center">Sin cobros todavía.</p> : (
            <div className="ad-card overflow-x-auto">
              <table className="w-full">
                <thead><tr><th className="ad-th">Concepto</th><th className="ad-th text-right">Monto</th><th className="ad-th">Pagado / Saldo</th><th className="ad-th text-center">Estado</th><th className="ad-th"></th></tr></thead>
                <tbody>
                  {data.cobros.map((c) => {
                    const est = estadoPago(c); const saldo = saldoCobro(c)
                    return (
                      <tr key={c.id} className="ad-hover transition">
                        <td className="ad-td"><span className="ad-ink">{c.concepto || c.periodo}</span>{c.tipo !== 'mensual' && <span className={`ad-pill ml-2 ${c.tipo === 'setup' ? 'ad-pill-violet' : 'ad-pill-blue'}`}>{tipoCobroMeta(c.tipo).label}</span>}<p className="text-xs ad-faint">{fmtFecha(c.fecha_emision)}</p></td>
                        <td className="ad-td text-right tabular-nums ad-ink">{fmtMoney(c.monto, c.moneda)}</td>
                        <td className="ad-td text-xs tabular-nums">{est === 'pagado' ? <span className="text-primary-300">{fmtMoney(c.pagado, c.moneda)}</span> : Number(c.pagado) > 0 ? <span className="text-sky-300">{fmtMoney(c.pagado, c.moneda)} <span className="ad-faint">· falta {fmtMoney(saldo, c.moneda)}</span></span> : <span className="ad-faint">—</span>}</td>
                        <td className="ad-td text-center"><span className={`ad-pill ${EST_PILL[est]}`}>{EST_LBL[est]}</span></td>
                        <td className="ad-td"><div className="flex items-center justify-end gap-1">
                          {saldo > 0 && <button onClick={() => setGestion(c)} className="ad-btn ad-btn-soft ad-btn-sm">Pago</button>}
                          <button onClick={() => setManual(editarCobro(c))} title="Editar" className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-primary-300 transition"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setComprobante(c)} title="Comprobante" className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-primary-300 transition"><Printer className="w-4 h-4" /></button>
                          <button onClick={() => delCobro(c)} title="Eliminar" className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                        </div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== Proyectos ===== */}
      {tab === 'Proyectos' && (
        <div className="space-y-3">
          <div className="flex justify-end"><button onClick={() => setProy({ nombre: '', estado: 'desarrollo', stack: '', repo_url: '', deploy_url: '', monto: '', moneda: data.moneda, fecha_inicio: '', fecha_fin: '', descripcion: '' })} className="ad-btn ad-btn-primary ad-btn-sm"><Plus className="w-4 h-4" /> Nuevo proyecto</button></div>
          {data.proyectos.length === 0 ? <p className="ad-faint text-sm py-8 text-center">Sin proyectos.</p> : (
            <div className="grid sm:grid-cols-2 gap-3">
              {data.proyectos.map((p) => (
                <div key={p.id} className="ad-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold ad-ink">{p.nombre}</p>
                    <div className="flex gap-1 shrink-0">
                      {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="ad-faint hover:ad-ink"><Github className="w-4 h-4" /></a>}
                      {p.deploy_url && <a href={p.deploy_url} target="_blank" rel="noreferrer" className="ad-faint hover:text-primary-300"><ExternalLink className="w-4 h-4" /></a>}
                      <button onClick={() => setProy(p)} className="ad-faint hover:text-primary-300"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => delProy(p)} className="ad-faint hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs ad-muted">
                    <span className="ad-pill ad-pill-gray">{PROY_LBL[p.estado] || p.estado}</span>
                    {p.stack && <span className="truncate">{p.stack}</span>}
                    {Number(p.monto) > 0 && <span className="ml-auto tabular-nums">{fmtMoney(p.monto, p.moneda)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Archivos ===== */}
      {tab === 'Archivos' && <div className="ad-card p-5"><ClienteArchivos clienteId={data.id} archivos={data.archivos || []} onChange={load} /></div>}

      {/* ===== Notas / seguimiento ===== */}
      {tab === 'Notas' && (
        <div className="space-y-3">
          <div className="flex justify-end"><button onClick={() => setSeg({ tipo: 'nota', titulo: '', detalle: '', fecha: new Date().toISOString().slice(0, 10), proxima_accion: '', proxima_fecha: '', completado: false })} className="ad-btn ad-btn-primary ad-btn-sm"><Plus className="w-4 h-4" /> Nuevo seguimiento</button></div>
          {data.seguimientos.length === 0 ? <p className="ad-faint text-sm py-8 text-center">Sin seguimientos.</p> : (
            <div className="space-y-2">
              {data.seguimientos.map((s) => (
                <div key={s.id} className="ad-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${s.completado ? 'ad-faint line-through' : 'ad-ink'}`}>{s.titulo}</p>
                    <div className="flex gap-1 shrink-0">
                      {s.proxima_accion && <button onClick={() => toggleSeg(s)} title="Completar" className={s.completado ? 'text-primary-400' : 'ad-faint hover:text-primary-300'}><CheckCircle2 className="w-4 h-4" /></button>}
                      <button onClick={() => setSeg(s)} className="ad-faint hover:text-primary-300"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => delSeg(s)} className="ad-faint hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {s.detalle && <p className="text-sm ad-muted mt-1 whitespace-pre-wrap">{s.detalle}</p>}
                  {s.proxima_accion && <p className="text-xs text-primary-300 mt-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {s.proxima_accion}{s.proxima_fecha ? ` · ${fmtFecha(s.proxima_fecha)}` : ''}</p>}
                  <p className="text-[11px] ad-faint mt-1.5">{fmtFecha(s.fecha)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {manual && <CobroForm initial={manual} clientes={[{ id: data.id, nombre: data.nombre }]} lockCliente onSave={saveCobro} onClose={() => setManual(null)} />}
      {gestion && <GestionPagos cobro={{ ...gestion, cliente_nombre: data.nombre }} onClose={() => setGestion(null)} onChanged={load} />}
      {comprobante && <Comprobante cobro={{ ...comprobante, cliente_nombre: data.nombre, cliente_email: data.email, cliente_proyecto: data.proyecto }} hoy={new Date().toISOString()} onClose={() => setComprobante(null)} />}
      {proy && <ProyectoModal initial={proy} onSave={saveProy} onClose={() => setProy(null)} />}
      {seg && <SeguimientoModal initial={seg} onSave={saveSeg} onClose={() => setSeg(null)} />}
    </div>
  )
}

function Stat({ label, value, tone }) {
  const cls = tone === 'green' ? 'text-primary-300' : tone === 'amber' ? 'text-amber-300' : 'ad-ink'
  return <div className="ad-card p-3"><p className="text-[11px] uppercase tracking-wide ad-faint">{label}</p><p className={`text-base font-bold mt-0.5 tabular-nums ${cls}`}>{value}</p></div>
}
function Row({ label, value }) {
  return <div className="flex justify-between gap-3 text-sm border-b ad-line pb-2"><span className="ad-muted">{label}</span><span className="ad-ink font-medium">{value}</span></div>
}

function ProyectoModal({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial)
  const [saving, setSaving] = useState(false)
  const s = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  async function submit(e) { e.preventDefault(); setSaving(true); try { await onSave(f) } catch { setSaving(false) } }
  return (
    <div className="ad-overlay" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="ad-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between"><h3 className="text-base font-semibold ad-ink">{f.id ? 'Editar' : 'Nuevo'} proyecto</h3><button type="button" onClick={onClose} className="ad-muted"><X className="w-5 h-5" /></button></div>
        <div className="grid grid-cols-2 gap-3">
          <L label="Nombre *" full><input required value={f.nombre} onChange={s('nombre')} className="ad-input" /></L>
          <L label="Estado"><select value={f.estado} onChange={s('estado')} className="ad-input">{PROY_EST.map((e) => <option key={e} value={e}>{PROY_LBL[e]}</option>)}</select></L>
          <L label="Stack"><input value={f.stack || ''} onChange={s('stack')} placeholder="React, Node…" className="ad-input" /></L>
          <L label="Repo (URL)"><input value={f.repo_url || ''} onChange={s('repo_url')} className="ad-input" /></L>
          <L label="Deploy (URL)"><input value={f.deploy_url || ''} onChange={s('deploy_url')} className="ad-input" /></L>
          <L label="Monto"><input type="number" min="0" step="0.01" value={f.monto ?? ''} onChange={s('monto')} className="ad-input" /></L>
          <L label="Moneda"><select value={f.moneda} onChange={s('moneda')} className="ad-input">{MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}</select></L>
          <L label="Inicio"><input type="date" value={f.fecha_inicio || ''} onChange={s('fecha_inicio')} className="ad-input" /></L>
          <L label="Fin"><input type="date" value={f.fecha_fin || ''} onChange={s('fecha_fin')} className="ad-input" /></L>
          <L label="Descripción" full><textarea rows={2} value={f.descripcion || ''} onChange={s('descripcion')} className="ad-input" /></L>
        </div>
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="ad-btn ad-btn-ghost">Cancelar</button><button type="submit" disabled={saving} className="ad-btn ad-btn-primary">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar</button></div>
      </form>
    </div>
  )
}

function SeguimientoModal({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial)
  const [saving, setSaving] = useState(false)
  const s = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  async function submit(e) { e.preventDefault(); setSaving(true); try { await onSave(f) } catch { setSaving(false) } }
  return (
    <div className="ad-overlay" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="ad-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between"><h3 className="text-base font-semibold ad-ink">{f.id ? 'Editar' : 'Nuevo'} seguimiento</h3><button type="button" onClick={onClose} className="ad-muted"><X className="w-5 h-5" /></button></div>
        <div className="grid grid-cols-2 gap-3">
          <L label="Tipo"><select value={f.tipo} onChange={s('tipo')} className="ad-input">{SEG_TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}</select></L>
          <L label="Fecha"><input type="date" value={f.fecha || ''} onChange={s('fecha')} className="ad-input" /></L>
          <L label="Título *" full><input required value={f.titulo} onChange={s('titulo')} className="ad-input" /></L>
          <L label="Detalle" full><textarea rows={2} value={f.detalle || ''} onChange={s('detalle')} className="ad-input" /></L>
          <L label="Próxima acción"><input value={f.proxima_accion || ''} onChange={s('proxima_accion')} placeholder="Ej: llamar" className="ad-input" /></L>
          <L label="Cuándo"><input type="date" value={f.proxima_fecha || ''} onChange={s('proxima_fecha')} className="ad-input" /></L>
        </div>
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="ad-btn ad-btn-ghost">Cancelar</button><button type="submit" disabled={saving} className="ad-btn ad-btn-primary">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar</button></div>
      </form>
    </div>
  )
}

function L({ label, children, full }) {
  return <label className={`flex flex-col gap-1.5 ${full ? 'col-span-2' : ''}`}><span className="text-xs font-medium uppercase tracking-wide ad-muted">{label}</span>{children}</label>
}
