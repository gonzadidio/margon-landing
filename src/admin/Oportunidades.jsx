import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, UserCheck, Bell, Building2, Lightbulb } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, MONEDAS, fmtFecha, diasHasta } from './format'

const ETAPAS = [
  { v: 'nuevo', label: 'Nuevo', dot: 'bg-sky-400' },
  { v: 'contactado', label: 'Contactado', dot: 'bg-violet-400' },
  { v: 'propuesta', label: 'Propuesta', dot: 'bg-amber-400' },
  { v: 'negociacion', label: 'Negociación', dot: 'bg-emerald-400' },
  { v: 'ganado', label: 'Ganado', dot: 'bg-emerald-600' },
  { v: 'perdido', label: 'Perdido', dot: 'bg-zinc-400' },
]
const TIPOS = [{ v: 'lead', label: 'Posible cliente', icon: Building2 }, { v: 'propio', label: 'Proyecto propio', icon: Lightbulb }]
const tipoMeta = (v) => TIPOS.find((t) => t.v === v) || TIPOS[0]
const VACIO = { nombre: '', tipo: 'lead', contacto: '', canal: '', etapa: 'nuevo', valor: '', moneda: 'ARS', notas: '', proxima_accion: '', proxima_fecha: '' }

export default function Oportunidades() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [filtro, setFiltro] = useState('todas')

  async function load() {
    setLoading(true)
    try { setItems(await apiFetch('/oportunidades')); setError('') }
    catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function save(data) {
    const payload = { ...data, valor: Number(data.valor) || 0 }
    if (data.id) await apiFetch(`/oportunidades/${data.id}`, { method: 'PUT', body: JSON.stringify(payload) })
    else await apiFetch('/oportunidades', { method: 'POST', body: JSON.stringify(payload) })
    setEditing(null); load()
  }
  async function cambiarEtapa(o, etapa) { await apiFetch(`/oportunidades/${o.id}`, { method: 'PUT', body: JSON.stringify({ ...o, etapa }) }); setItems((xs) => xs.map((x) => x.id === o.id ? { ...x, etapa } : x)) }
  async function remove(o) { if (confirm(`¿Eliminar "${o.nombre}"?`)) { await apiFetch(`/oportunidades/${o.id}`, { method: 'DELETE' }); load() } }
  async function convertir(o) {
    if (!confirm(`¿Convertir "${o.nombre}" en cliente?`)) return
    try { await apiFetch(`/oportunidades/${o.id}/convertir`, { method: 'POST' }); load(); alert('¡Cliente creado! Lo ves en Clientes.') }
    catch (e) { alert(e.message) }
  }

  const visibles = filtro === 'todas' ? items : items.filter((o) => o.tipo === filtro)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold ad-ink tracking-tight">Oportunidades</h1><p className="ad-muted text-sm mt-0.5">Posibles clientes y proyectos propios que estamos persiguiendo.</p></div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border ad-line overflow-hidden text-sm bg-white">
            {[{ v: 'todas', l: 'Todas' }, { v: 'lead', l: 'Clientes' }, { v: 'propio', l: 'Propios' }].map((f) => (
              <button key={f.v} onClick={() => setFiltro(f.v)} className={`px-3 py-1.5 font-medium ${filtro === f.v ? 'bg-primary-50 text-primary-700' : 'ad-muted hover:bg-[#f3f6f4]'}`}>{f.l}</button>
            ))}
          </div>
          <button onClick={() => setEditing({ ...VACIO })} className="ad-btn ad-btn-primary ad-btn-sm"><Plus className="w-4 h-4" /> Nueva</button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 ad-muted text-sm py-10 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {ETAPAS.map((col) => {
            const cards = visibles.filter((o) => o.etapa === col.v)
            const total = cards.reduce((s, o) => s + Number(o.valor || 0), 0)
            return (
              <div key={col.v} className="shrink-0 w-72">
                <div className="flex items-center gap-2 px-1 pb-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} /><span className="text-sm font-semibold ad-ink">{col.label}</span><span className="text-xs ad-faint">{cards.length}</span>
                  {total > 0 && <span className="ml-auto text-[11px] ad-faint tabular-nums">{fmtMoney(total)}</span>}
                </div>
                <div className="space-y-2 min-h-[60px]">
                  {cards.map((o) => <Card key={o.id} o={o} onEdit={setEditing} onEtapa={cambiarEtapa} onConvertir={convertir} onRemove={remove} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {items.length === 0 && !loading && <p className="ad-muted text-sm py-6 text-center">Todavía no hay oportunidades. Creá la primera con “Nueva”.</p>}
      {editing && <Form initial={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}

function Card({ o, onEdit, onEtapa, onConvertir, onRemove }) {
  const tm = tipoMeta(o.tipo); const Icon = tm.icon
  const d = diasHasta(o.proxima_fecha); const atras = !o.cliente_id && d != null && d < 0
  return (
    <div className="ad-card p-3 group">
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => onEdit(o)} className="text-left min-w-0"><p className="text-sm font-semibold ad-ink truncate">{o.nombre}</p></button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button onClick={() => onEdit(o)} className="ad-faint hover:text-primary-700"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onRemove(o)} className="ad-faint hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1 text-[11px] ad-faint"><Icon className="w-3 h-3" /> {tm.label}{o.contacto && <span className="truncate">· {o.contacto}</span>}</div>
      {o.proxima_accion && <div className={`mt-2 inline-flex items-center gap-1 text-[11px] rounded-md px-1.5 py-0.5 ${atras ? 'ad-pill-red' : 'ad-pill-gray'}`}><Bell className="w-3 h-3" /> {o.proxima_accion}{o.proxima_fecha && <span>· {fmtFecha(o.proxima_fecha)}</span>}</div>}
      <div className="flex items-center justify-between mt-2 gap-2">
        {Number(o.valor) > 0 ? <span className="text-xs tabular-nums ad-muted">{fmtMoney(o.valor, o.moneda)}</span> : <span />}
        <select value={o.etapa} onChange={(e) => onEtapa(o, e.target.value)} className="text-[11px] rounded border ad-line px-1.5 py-0.5 ad-muted bg-white outline-none">{ETAPAS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}</select>
      </div>
      {o.tipo === 'lead' && !o.cliente_id && <button onClick={() => onConvertir(o)} className="mt-2 w-full ad-btn ad-btn-soft ad-btn-sm"><UserCheck className="w-3.5 h-3.5" /> Convertir en cliente</button>}
      {o.cliente_id && <p className="mt-2 text-[11px] text-primary-700 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Ya es cliente</p>}
    </div>
  )
}

function Form({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const s = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  async function submit(e) { e.preventDefault(); setSaving(true); setError(''); try { await onSave(f) } catch (err) { setError(err.message); setSaving(false) } }
  return (
    <div className="ad-overlay" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="ad-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between"><h3 className="text-base font-semibold ad-ink">{f.id ? 'Editar' : 'Nueva'} oportunidad</h3><button type="button" onClick={onClose} className="ad-muted"><X className="w-5 h-5" /></button></div>
        <div className="grid grid-cols-2 gap-3">
          <L label="Nombre *" full><input required value={f.nombre} onChange={s('nombre')} placeholder="Ej: Cafetería Norte" className="ad-input" /></L>
          <L label="Tipo"><select value={f.tipo} onChange={s('tipo')} className="ad-input">{TIPOS.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}</select></L>
          <L label="Etapa"><select value={f.etapa} onChange={s('etapa')} className="ad-input">{ETAPAS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}</select></L>
          <L label="Contacto"><input value={f.contacto || ''} onChange={s('contacto')} placeholder="Email o teléfono" className="ad-input" /></L>
          <L label="Canal / origen"><input value={f.canal || ''} onChange={s('canal')} placeholder="Instagram, referido…" className="ad-input" /></L>
          <L label="Valor estimado"><input type="number" min="0" step="0.01" value={f.valor ?? ''} onChange={s('valor')} className="ad-input" /></L>
          <L label="Moneda"><select value={f.moneda} onChange={s('moneda')} className="ad-input">{MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}</select></L>
          <div className="col-span-2 border-t ad-line pt-3"><p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Próximo paso</p></div>
          <L label="Qué hacer"><input value={f.proxima_accion || ''} onChange={s('proxima_accion')} placeholder="Ej: mandar propuesta" className="ad-input" /></L>
          <L label="Cuándo"><input type="date" value={f.proxima_fecha || ''} onChange={s('proxima_fecha')} className="ad-input" /></L>
          <L label="Notas" full><textarea rows={2} value={f.notas || ''} onChange={s('notas')} className="ad-input" /></L>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="ad-btn ad-btn-ghost">Cancelar</button><button type="submit" disabled={saving} className="ad-btn ad-btn-primary">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar</button></div>
      </form>
    </div>
  )
}

function L({ label, children, full }) {
  return <label className={`flex flex-col gap-1.5 ${full ? 'col-span-2' : ''}`}><span className="text-xs font-medium uppercase tracking-wide ad-muted">{label}</span>{children}</label>
}
