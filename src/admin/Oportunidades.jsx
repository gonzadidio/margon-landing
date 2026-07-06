import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, UserCheck, Bell, Building2, Lightbulb } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, MONEDAS, fmtFecha, diasHasta } from './format'

// Dos tipos de seguimiento con sus propios estados.
const TIPOS = {
  lead: { label: 'Posibles clientes', icon: Building2 },
  propio: { label: 'Proyectos propios', icon: Lightbulb },
}
const ESTADOS = {
  lead: [
    { v: 'nuevo', label: 'A contactar', cls: 'ad-pill-blue' },
    { v: 'contactado', label: 'En conversación', cls: 'ad-pill-violet' },
    { v: 'propuesta', label: 'Propuesta enviada', cls: 'ad-pill-amber' },
    { v: 'negociacion', label: 'Negociando', cls: 'ad-pill-green' },
    { v: 'ganado', label: 'Ganado', cls: 'ad-pill-green' },
    { v: 'perdido', label: 'Descartado', cls: 'ad-pill-gray' },
  ],
  propio: [
    { v: 'idea', label: 'Idea', cls: 'ad-pill-blue' },
    { v: 'en_progreso', label: 'En progreso', cls: 'ad-pill-green' },
    { v: 'pausado', label: 'Pausado', cls: 'ad-pill-amber' },
    { v: 'terminado', label: 'Terminado', cls: 'ad-pill-gray' },
  ],
}
const CERRADOS = { lead: ['ganado', 'perdido'], propio: ['terminado'] }
const estMeta = (tipo, v) => (ESTADOS[tipo] || ESTADOS.lead).find((e) => e.v === v) || { label: v, cls: 'ad-pill-gray' }
const nuevoVacio = (tipo) => ({ nombre: '', tipo, contacto: '', canal: '', etapa: ESTADOS[tipo][0].v, valor: '', moneda: 'ARS', notas: '', proxima_accion: '', proxima_fecha: '' })

export default function Oportunidades() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [tipo, setTipo] = useState('lead')

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
  async function cambiarEstado(o, etapa) { await apiFetch(`/oportunidades/${o.id}`, { method: 'PUT', body: JSON.stringify({ ...o, etapa }) }); setItems((xs) => xs.map((x) => x.id === o.id ? { ...x, etapa } : x)) }
  async function remove(o) { if (confirm(`¿Eliminar "${o.nombre}"?`)) { await apiFetch(`/oportunidades/${o.id}`, { method: 'DELETE' }); load() } }
  async function convertir(o) {
    if (!confirm(`¿Convertir "${o.nombre}" en cliente?`)) return
    try { await apiFetch(`/oportunidades/${o.id}/convertir`, { method: 'POST' }); load(); alert('¡Cliente creado! Lo ves en Clientes.') }
    catch (e) { alert(e.message) }
  }

  // Los del tipo activo, ordenados por próxima acción (lo más urgente arriba; sin fecha al final).
  const lista = items
    .filter((o) => (o.tipo || 'lead') === tipo)
    .sort((a, b) => {
      const fa = a.proxima_fecha || '9999', fb = b.proxima_fecha || '9999'
      return fa.localeCompare(fb)
    })
  const abiertos = lista.filter((o) => !CERRADOS[tipo].includes(o.etapa))
  const atrasados = abiertos.filter((o) => o.proxima_fecha && diasHasta(o.proxima_fecha) < 0).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold ad-ink tracking-tight">Oportunidades</h1>
          <p className="ad-muted text-sm mt-0.5">Seguimiento de posibles clientes y proyectos propios.</p>
        </div>
        <button onClick={() => setEditing(nuevoVacio(tipo))} className="ad-btn ad-btn-primary ad-btn-sm"><Plus className="w-4 h-4" /> Nuevo</button>
      </div>

      {/* Toggle tipo */}
      <div className="flex rounded-lg border ad-line overflow-hidden text-sm bg-transparent w-max">
        {Object.entries(TIPOS).map(([k, t]) => {
          const Icon = t.icon
          return (
            <button key={k} onClick={() => setTipo(k)} className={`px-4 py-2 font-medium flex items-center gap-2 ${tipo === k ? 'bg-primary-500/15 text-primary-300' : 'ad-muted hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          )
        })}
      </div>

      <p className="text-xs ad-faint">{abiertos.length} abierto(s){atrasados > 0 && <span className="text-red-400"> · {atrasados} con acción atrasada</span>}</p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 ad-muted text-sm py-10 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</div>
      ) : lista.length === 0 ? (
        <p className="ad-muted text-sm py-10 text-center">Nada en {TIPOS[tipo].label.toLowerCase()} todavía. Creá el primero con “Nuevo”.</p>
      ) : (
        <div className="space-y-2">
          {lista.map((o) => <Fila key={o.id} o={o} tipo={tipo} onEstado={cambiarEstado} onEdit={setEditing} onRemove={remove} onConvertir={convertir} />)}
        </div>
      )}

      {editing && <Form initial={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}

function Fila({ o, tipo, onEstado, onEdit, onRemove, onConvertir }) {
  const cerrado = CERRADOS[tipo].includes(o.etapa)
  const d = diasHasta(o.proxima_fecha)
  const atras = !cerrado && d != null && d < 0
  const meta = estMeta(tipo, o.etapa)
  return (
    <div className={`ad-card p-4 flex flex-wrap items-center gap-x-4 gap-y-2 ${atras ? 'ring-1 ring-red-500/30' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold ${cerrado ? 'ad-muted' : 'ad-ink'}`}>{o.nombre}</span>
          {Number(o.valor) > 0 && <span className="text-xs ad-muted tabular-nums">{fmtMoney(o.valor, o.moneda)}</span>}
          {o.cliente_id && <span className="ad-pill ad-pill-green"><UserCheck className="w-3 h-3" /> cliente</span>}
        </div>
        {(o.contacto || o.canal) && <p className="text-xs ad-faint mt-0.5">{[o.contacto, o.canal && `vía ${o.canal}`].filter(Boolean).join(' · ')}</p>}
        {o.proxima_accion
          ? <p className={`text-xs mt-1 flex items-center gap-1 ${atras ? 'text-red-400 font-medium' : 'ad-muted'}`}><Bell className="w-3.5 h-3.5" /> {o.proxima_accion}{o.proxima_fecha && <span>· {atras ? `atrasada (${fmtFecha(o.proxima_fecha)})` : fmtFecha(o.proxima_fecha)}</span>}</p>
          : <p className="text-xs ad-faint mt-1 flex items-center gap-1"><Bell className="w-3.5 h-3.5" /> sin próxima acción</p>}
        {o.notas && <p className="text-xs ad-faint mt-1 line-clamp-1">{o.notas}</p>}
      </div>

      <select value={o.etapa} onChange={(e) => onEstado(o, e.target.value)} className="ad-input !w-auto !py-1.5 text-xs">
        {ESTADOS[tipo].map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
      </select>

      <div className="flex items-center gap-1">
        {tipo === 'lead' && !o.cliente_id && !cerrado && <button onClick={() => onConvertir(o)} title="Convertir en cliente" className="ad-btn ad-btn-soft ad-btn-sm"><UserCheck className="w-3.5 h-3.5" /> Cliente</button>}
        <button onClick={() => onEdit(o)} className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-primary-300 transition"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => onRemove(o)} className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  )
}

function Form({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const s = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const esLead = f.tipo === 'lead'
  const estadoOpts = ESTADOS[f.tipo] || ESTADOS.lead
  const titulo = TIPOS[f.tipo] ? TIPOS[f.tipo].label : 'Oportunidad'

  async function submit(e) {
    e.preventDefault(); setSaving(true); setError('')
    try { await onSave(f) } catch (err) { setError(err.message); setSaving(false) }
  }

  return (
    <div className="ad-overlay" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="ad-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold ad-ink">{f.id ? 'Editar' : 'Nuevo'} · {titulo}</h3>
          <button type="button" onClick={onClose} className="ad-muted"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <L label={esLead ? 'Nombre / empresa *' : 'Nombre del proyecto *'} full>
            <input required value={f.nombre} onChange={s('nombre')} placeholder={esLead ? 'Ej: Cafetería Norte' : 'Ej: App de turnos propia'} className="ad-input" />
          </L>
          <L label="Estado">
            <select value={f.etapa} onChange={s('etapa')} className="ad-input">
              {estadoOpts.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
            </select>
          </L>
          {esLead && <L label="Contacto"><input value={f.contacto || ''} onChange={s('contacto')} placeholder="Email o teléfono" className="ad-input" /></L>}
          {esLead && <L label="Canal / origen"><input value={f.canal || ''} onChange={s('canal')} placeholder="Instagram, referido…" className="ad-input" /></L>}
          {esLead && <L label="Valor estimado"><input type="number" min="0" step="0.01" value={f.valor || ''} onChange={s('valor')} className="ad-input" /></L>}
          {esLead && (
            <L label="Moneda">
              <select value={f.moneda} onChange={s('moneda')} className="ad-input">
                {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </L>
          )}
          <div className="col-span-2 border-t ad-line pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-300">Próxima acción (seguimiento)</p>
          </div>
          <L label="Qué hacer"><input value={f.proxima_accion || ''} onChange={s('proxima_accion')} placeholder={esLead ? 'Ej: mandar propuesta' : 'Ej: definir MVP'} className="ad-input" /></L>
          <L label="Cuándo"><input type="date" value={f.proxima_fecha || ''} onChange={s('proxima_fecha')} className="ad-input" /></L>
          <L label="Notas" full><textarea rows={2} value={f.notas || ''} onChange={s('notas')} className="ad-input" /></L>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="ad-btn ad-btn-ghost">Cancelar</button>
          <button type="submit" disabled={saving} className="ad-btn ad-btn-primary">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar</button>
        </div>
      </form>
    </div>
  )
}

function L({ label, children, full }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? 'col-span-2' : ''}`}>
      <span className="text-xs font-medium uppercase tracking-wide ad-muted">{label}</span>
      {children}
    </label>
  )
}
