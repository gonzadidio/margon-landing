import { useEffect, useState } from 'react'
import {
  Plus, Pencil, Trash2, X, Loader2, Check, StickyNote, Phone, Mail,
  Users, MessageCircle, CheckSquare, Bell,
} from 'lucide-react'
import { apiFetch } from './api'
import { fmtFecha, diasHasta } from './format'
import { useNav } from './nav'

const TIPOS = [
  { v: 'nota',    label: 'Nota',     icon: StickyNote },
  { v: 'llamada', label: 'Llamada',  icon: Phone },
  { v: 'email',   label: 'Email',    icon: Mail },
  { v: 'reunion', label: 'Reunión',  icon: Users },
  { v: 'whatsapp',label: 'WhatsApp', icon: MessageCircle },
  { v: 'tarea',   label: 'Tarea',    icon: CheckSquare },
]
const TIPO_MAP = Object.fromEntries(TIPOS.map((t) => [t.v, t]))

const nuevoVacio = () => ({
  cliente_id: '', proyecto_id: '', tipo: 'nota', titulo: '', detalle: '',
  fecha: new Date().toISOString().slice(0, 10),
  proxima_accion: '', proxima_fecha: '', completado: false,
})

export default function Seguimientos() {
  const [items, setItems] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [vista, setVista] = useState('agenda') // agenda | historial
  const { verCliente } = useNav()

  async function load() {
    setLoading(true)
    try {
      const q = vista === 'agenda' ? '?pendientes=1' : ''
      const [s, c] = await Promise.all([apiFetch(`/seguimientos${q}`), apiFetch('/clientes')])
      setItems(s)
      setClientes(c)
      setError('')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [vista])

  async function save(data) {
    if (data.id) await apiFetch(`/seguimientos/${data.id}`, { method: 'PUT', body: JSON.stringify(data) })
    else await apiFetch('/seguimientos', { method: 'POST', body: JSON.stringify(data) })
    setEditing(null)
    load()
  }

  async function completar(s) {
    await apiFetch(`/seguimientos/${s.id}`, { method: 'PUT', body: JSON.stringify({ ...s, completado: !s.completado }) })
    load()
  }

  async function remove(s) {
    if (!confirm('¿Eliminar este seguimiento?')) return
    await apiFetch(`/seguimientos/${s.id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Seguimientos</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg ring-1 ring-primary-500/15 overflow-hidden text-sm">
            <button onClick={() => setVista('agenda')} className={`px-3 py-1.5 flex items-center gap-1.5 ${vista === 'agenda' ? 'bg-primary-500/20 text-primary-300' : 'text-surface-200/50 hover:bg-surface-800'}`}>
              <Bell className="w-3.5 h-3.5" /> Agenda
            </button>
            <button onClick={() => setVista('historial')} className={`px-3 py-1.5 ${vista === 'historial' ? 'bg-primary-500/20 text-primary-300' : 'text-surface-200/50 hover:bg-surface-800'}`}>
              Historial
            </button>
          </div>
          <button
            onClick={() => setEditing({ ...nuevoVacio(), cliente_id: clientes[0]?.id || '' })}
            disabled={clientes.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-40 text-[#0a0f0d] font-semibold text-sm px-3.5 py-2 transition"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        </div>
      </div>

      <p className="text-sm text-surface-200/50">
        {vista === 'agenda'
          ? 'Próximas acciones pendientes, ordenadas por fecha. Marcá ✓ cuando las completes.'
          : 'Historial completo de interacciones con clientes.'}
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-surface-200/50 text-sm py-10 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : items.length === 0 ? (
        <p className="text-surface-200/50 text-sm py-10 text-center">
          {vista === 'agenda' ? 'No hay acciones pendientes. ¡Todo al día!' : 'Todavía no registraste seguimientos.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <Item key={s.id} s={s} onEdit={setEditing} onRemove={remove} onCompletar={completar} onVerCliente={verCliente} />
          ))}
        </ul>
      )}

      {editing && (
        <SeguimientoForm initial={editing} clientes={clientes} onSave={save} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

function Item({ s, onEdit, onRemove, onCompletar, onVerCliente }) {
  const tipo = TIPO_MAP[s.tipo] || TIPO_MAP.nota
  const Icon = tipo.icon
  const d = diasHasta(s.proxima_fecha)
  const atrasado = !s.completado && d != null && d < 0
  const hoy = !s.completado && d === 0

  return (
    <li className={`glass rounded-xl p-4 ring-1 transition ${atrasado ? 'ring-red-500/30' : 'ring-primary-500/10'}`}>
      <div className="flex items-start gap-3">
        <div className={`grid place-items-center w-9 h-9 rounded-lg shrink-0 ${s.completado ? 'bg-surface-800 text-surface-200/40' : 'bg-primary-500/10 text-primary-300'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium ${s.completado ? 'text-surface-200/50 line-through' : 'text-white'}`}>{s.titulo}</p>
            <button onClick={() => onVerCliente(s.cliente_id)} className="text-xs text-surface-200/50 hover:text-primary-300 transition">
              · {s.cliente_nombre}{s.proyecto_nombre ? ` / ${s.proyecto_nombre}` : ''}
            </button>
          </div>
          {s.detalle && <p className="text-sm text-surface-200/60 mt-1 whitespace-pre-wrap">{s.detalle}</p>}

          {s.proxima_accion && (
            <div className={`mt-2 inline-flex items-center gap-1.5 text-xs rounded-lg px-2 py-1 ${
              atrasado ? 'bg-red-500/10 text-red-300' : hoy ? 'bg-amber-500/10 text-amber-300' : 'bg-surface-900/60 text-surface-200/60'
            }`}>
              <Bell className="w-3.5 h-3.5" />
              {s.proxima_accion}
              {s.proxima_fecha && <span className="opacity-70">· {fmtFecha(s.proxima_fecha)}{atrasado ? ` (hace ${-d}d)` : hoy ? ' (hoy)' : d != null ? ` (en ${d}d)` : ''}</span>}
            </div>
          )}

          <p className="text-[11px] text-surface-200/30 mt-2">{fmtFecha(s.fecha)}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {s.proxima_accion && (
            <button onClick={() => onCompletar(s)} title={s.completado ? 'Reabrir' : 'Marcar completado'}
              className={`p-1.5 rounded transition ${s.completado ? 'text-primary-300 bg-primary-500/10' : 'text-surface-200/50 hover:bg-surface-800 hover:text-primary-300'}`}>
              <Check className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onEdit(s)} className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-primary-300 transition"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => onRemove(s)} className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </li>
  )
}

function SeguimientoForm({ initial, clientes, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const [proyectos, setProyectos] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Cargar proyectos del cliente elegido para poder vincular el seguimiento.
  useEffect(() => {
    if (!form.cliente_id) { setProyectos([]); return }
    apiFetch(`/proyectos?cliente_id=${form.cliente_id}`).then(setProyectos).catch(() => setProyectos([]))
  }, [form.cliente_id])

  async function submit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try { await onSave(form) }
    catch (err) { setError(err.message); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="glass relative w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{form.id ? 'Editar seguimiento' : 'Nuevo seguimiento'}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-surface-800 text-surface-200/60"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Cliente *">
            <select required value={form.cliente_id} onChange={(e) => setForm((f) => ({ ...f, cliente_id: e.target.value, proyecto_id: '' }))} className={inputCls} disabled={!!form.id}>
              <option value="" disabled>Elegí…</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Field>
          <Field label="Proyecto (opcional)">
            <select value={form.proyecto_id || ''} onChange={set('proyecto_id')} className={inputCls}>
              <option value="">—</option>
              {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </Field>
          <Field label="Tipo">
            <select value={form.tipo} onChange={set('tipo')} className={inputCls}>
              {TIPOS.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Fecha">
            <input type="date" value={form.fecha || ''} onChange={set('fecha')} className={inputCls} />
          </Field>
          <Field label="Título *" className="col-span-2">
            <input required value={form.titulo} onChange={set('titulo')} placeholder="Ej: Reunión de kickoff" className={inputCls} />
          </Field>
          <Field label="Detalle" className="col-span-2">
            <textarea rows={3} value={form.detalle || ''} onChange={set('detalle')} className={inputCls} />
          </Field>

          <div className="col-span-2 border-t border-primary-500/10 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-300/70 mb-2">Próxima acción (recordatorio)</p>
          </div>
          <Field label="Qué hay que hacer">
            <input value={form.proxima_accion || ''} onChange={set('proxima_accion')} placeholder="Ej: Enviar propuesta" className={inputCls} />
          </Field>
          <Field label="Cuándo">
            <input type="date" value={form.proxima_fecha || ''} onChange={set('proxima_fecha')} className={inputCls} />
          </Field>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-surface-200/70 hover:bg-surface-800 transition">Cancelar</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-[#0a0f0d] font-semibold text-sm transition">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg bg-surface-900/60 border border-primary-500/15 px-3 py-2 text-white outline-none focus:border-primary-400/50 transition text-sm'

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-surface-200/50">{label}</span>
      {children}
    </label>
  )
}
