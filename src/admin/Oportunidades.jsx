import { useEffect, useState } from 'react'
import {
  Plus, Pencil, Trash2, X, Loader2, UserCheck, Bell, Building2, Lightbulb,
} from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, MONEDAS, fmtFecha, diasHasta } from './format'
import { useNav } from './nav'

const ETAPAS = [
  { v: 'nuevo',       label: 'Nuevo',       dot: 'bg-sky-400' },
  { v: 'contactado',  label: 'Contactado',  dot: 'bg-violet-400' },
  { v: 'propuesta',   label: 'Propuesta',   dot: 'bg-amber-400' },
  { v: 'negociacion', label: 'Negociación', dot: 'bg-primary-400' },
  { v: 'ganado',      label: 'Ganado',      dot: 'bg-emerald-400' },
  { v: 'perdido',     label: 'Perdido',     dot: 'bg-surface-500' },
]

const TIPOS = [
  { v: 'lead',   label: 'Posible cliente', icon: Building2 },
  { v: 'propio', label: 'Proyecto propio', icon: Lightbulb },
]
const tipoMeta = (v) => TIPOS.find((t) => t.v === v) || TIPOS[0]

const VACIO = {
  nombre: '', tipo: 'lead', contacto: '', canal: '', etapa: 'nuevo',
  valor: '', moneda: 'ARS', notas: '', proxima_accion: '', proxima_fecha: '',
}

export default function Oportunidades() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [filtro, setFiltro] = useState('todas') // todas | lead | propio
  const { irA } = useNav()

  async function load() {
    setLoading(true)
    try {
      setItems(await apiFetch('/oportunidades'))
      setError('')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function save(data) {
    const payload = { ...data, valor: Number(data.valor) || 0 }
    if (data.id) await apiFetch(`/oportunidades/${data.id}`, { method: 'PUT', body: JSON.stringify(payload) })
    else await apiFetch('/oportunidades', { method: 'POST', body: JSON.stringify(payload) })
    setEditing(null)
    load()
  }

  async function cambiarEtapa(o, etapa) {
    await apiFetch(`/oportunidades/${o.id}`, { method: 'PUT', body: JSON.stringify({ ...o, etapa }) })
    setItems((xs) => xs.map((x) => (x.id === o.id ? { ...x, etapa } : x)))
  }

  async function remove(o) {
    if (!confirm(`¿Eliminar la oportunidad "${o.nombre}"?`)) return
    await apiFetch(`/oportunidades/${o.id}`, { method: 'DELETE' })
    load()
  }

  async function convertir(o) {
    if (!confirm(`¿Convertir "${o.nombre}" en cliente? Se crea un cliente nuevo y la oportunidad queda como ganada.`)) return
    try {
      await apiFetch(`/oportunidades/${o.id}/convertir`, { method: 'POST' })
      load()
      alert('¡Cliente creado! Lo vas a ver en la pestaña Clientes.')
    } catch (e) { alert(e.message) }
  }

  const visibles = filtro === 'todas' ? items : items.filter((o) => o.tipo === filtro)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Oportunidades</h2>
          <p className="text-sm text-surface-200/50">Posibles clientes y proyectos propios que estamos persiguiendo.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg ring-1 ring-primary-500/15 overflow-hidden text-sm">
            {[{ v: 'todas', l: 'Todas' }, { v: 'lead', l: 'Clientes' }, { v: 'propio', l: 'Propios' }].map((f) => (
              <button key={f.v} onClick={() => setFiltro(f.v)}
                className={`px-3 py-1.5 ${filtro === f.v ? 'bg-primary-500/20 text-primary-300' : 'text-surface-200/50 hover:bg-surface-800'}`}>
                {f.l}
              </button>
            ))}
          </div>
          <button
            onClick={() => setEditing({ ...VACIO })}
            className="flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-[#0a0f0d] font-semibold text-sm px-3.5 py-2 transition"
          >
            <Plus className="w-4 h-4" /> Nueva
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-surface-200/50 text-sm py-10 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {ETAPAS.map((col) => {
            const cards = visibles.filter((o) => o.etapa === col.v)
            const total = cards.reduce((s, o) => s + Number(o.valor || 0), 0)
            return (
              <div key={col.v} className="shrink-0 w-72">
                <div className="flex items-center gap-2 px-1 pb-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-sm font-medium text-white">{col.label}</span>
                  <span className="text-xs text-surface-200/40">{cards.length}</span>
                  {total > 0 && <span className="ml-auto text-[11px] text-surface-200/40 tabular-nums">{fmtMoney(total)}</span>}
                </div>
                <div className="space-y-2 min-h-[60px]">
                  {cards.map((o) => (
                    <Card key={o.id} o={o} onEdit={setEditing} onEtapa={cambiarEtapa} onConvertir={convertir} onRemove={remove} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {items.length === 0 && !loading && (
        <p className="text-surface-200/50 text-sm py-6 text-center">
          Todavía no hay oportunidades. Creá la primera con “Nueva”.{' '}
          <button onClick={() => irA('seguimientos')} className="text-primary-300 hover:underline">Ver seguimientos</button>
        </p>
      )}

      {editing && <OportunidadForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}

function Card({ o, onEdit, onEtapa, onConvertir, onRemove }) {
  const tm = tipoMeta(o.tipo)
  const Icon = tm.icon
  const d = diasHasta(o.proxima_fecha)
  const atrasado = !o.cliente_id && d != null && d < 0

  return (
    <div className="glass rounded-xl p-3 ring-1 ring-primary-500/10 group">
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => onEdit(o)} className="text-left min-w-0">
          <p className="text-sm font-medium text-white truncate">{o.nombre}</p>
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button onClick={() => onEdit(o)} className="text-surface-200/50 hover:text-primary-300"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onRemove(o)} className="text-surface-200/50 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-surface-200/40">
        <Icon className="w-3 h-3" /> {tm.label}
        {o.contacto && <span className="truncate">· {o.contacto}</span>}
      </div>

      {o.proxima_accion && (
        <div className={`mt-2 inline-flex items-center gap-1 text-[11px] rounded-md px-1.5 py-0.5 ${atrasado ? 'bg-red-500/10 text-red-300' : 'bg-surface-900/60 text-surface-200/60'}`}>
          <Bell className="w-3 h-3" /> {o.proxima_accion}
          {o.proxima_fecha && <span className="opacity-70">· {fmtFecha(o.proxima_fecha)}</span>}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 gap-2">
        {Number(o.valor) > 0
          ? <span className="text-xs tabular-nums text-surface-200/70">{fmtMoney(o.valor, o.moneda)}</span>
          : <span />}
        <select
          value={o.etapa}
          onChange={(e) => onEtapa(o, e.target.value)}
          className="text-[11px] rounded bg-surface-900/70 border border-primary-500/15 px-1.5 py-0.5 text-surface-200/70 outline-none focus:border-primary-400/50"
        >
          {ETAPAS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
        </select>
      </div>

      {/* Convertir a cliente (solo leads no convertidos) */}
      {o.tipo === 'lead' && !o.cliente_id && (
        <button
          onClick={() => onConvertir(o)}
          className="mt-2 w-full flex items-center justify-center gap-1.5 text-[11px] rounded-lg border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/10 py-1.5 transition"
        >
          <UserCheck className="w-3.5 h-3.5" /> Convertir en cliente
        </button>
      )}
      {o.cliente_id && (
        <p className="mt-2 text-[11px] text-emerald-300/70 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Ya es cliente</p>
      )}
    </div>
  )
}

function OportunidadForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

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
          <h3 className="text-base font-semibold text-white">{form.id ? 'Editar oportunidad' : 'Nueva oportunidad'}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-surface-800 text-surface-200/60"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre *" className="col-span-2">
            <input required value={form.nombre} onChange={set('nombre')} placeholder="Ej: Cafetería Norte / App de turnos" className={inputCls} />
          </Field>
          <Field label="Tipo">
            <select value={form.tipo} onChange={set('tipo')} className={inputCls}>
              {TIPOS.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Etapa">
            <select value={form.etapa} onChange={set('etapa')} className={inputCls}>
              {ETAPAS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
            </select>
          </Field>
          <Field label="Contacto">
            <input value={form.contacto || ''} onChange={set('contacto')} placeholder="Email o teléfono" className={inputCls} />
          </Field>
          <Field label="Canal / origen">
            <input value={form.canal || ''} onChange={set('canal')} placeholder="Instagram, referido…" className={inputCls} />
          </Field>
          <Field label="Valor estimado">
            <input type="number" min="0" step="0.01" value={form.valor ?? ''} onChange={set('valor')} className={inputCls} />
          </Field>
          <Field label="Moneda">
            <select value={form.moneda} onChange={set('moneda')} className={inputCls}>
              {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>

          <div className="col-span-2 border-t border-primary-500/10 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-300/70">Próximo paso (seguimiento)</p>
          </div>
          <Field label="Qué hacer">
            <input value={form.proxima_accion || ''} onChange={set('proxima_accion')} placeholder="Ej: Mandar propuesta" className={inputCls} />
          </Field>
          <Field label="Cuándo">
            <input type="date" value={form.proxima_fecha || ''} onChange={set('proxima_fecha')} className={inputCls} />
          </Field>

          <Field label="Notas" className="col-span-2">
            <textarea rows={2} value={form.notas || ''} onChange={set('notas')} className={inputCls} />
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
