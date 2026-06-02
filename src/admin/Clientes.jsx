import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import { apiFetch } from './api'

const VACIO = {
  nombre: '', email: '', telefono: '', proyecto: '',
  monto_mensual: '', estado: 'activo', notas: '',
}

const fmtMoney = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(n) || 0)

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | {} (nuevo) | cliente

  async function load() {
    setLoading(true)
    try {
      setClientes(await apiFetch('/clientes'))
      setError('')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function save(data) {
    const payload = { ...data, monto_mensual: Number(data.monto_mensual) || 0 }
    if (data.id) {
      await apiFetch(`/clientes/${data.id}`, { method: 'PUT', body: JSON.stringify(payload) })
    } else {
      await apiFetch('/clientes', { method: 'POST', body: JSON.stringify(payload) })
    }
    setEditing(null)
    load()
  }

  async function remove(c) {
    if (!confirm(`¿Eliminar a "${c.nombre}"? Se borran también sus cobros.`)) return
    await apiFetch(`/clientes/${c.id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Clientes</h2>
        <button
          onClick={() => setEditing({ ...VACIO })}
          className="flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-[#0a0f0d] font-semibold text-sm px-3.5 py-2 transition"
        >
          <Plus className="w-4 h-4" /> Nuevo cliente
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-surface-200/50 text-sm py-10 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : clientes.length === 0 ? (
        <p className="text-surface-200/50 text-sm py-10 text-center">
          Todavía no hay clientes. Creá el primero con “Nuevo cliente”.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-primary-500/10">
          <table className="w-full text-sm">
            <thead className="bg-surface-900/40 text-surface-200/50 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-4 py-3">Nombre</th>
                <th className="text-left font-medium px-4 py-3">Proyecto</th>
                <th className="text-left font-medium px-4 py-3">Contacto</th>
                <th className="text-right font-medium px-4 py-3">Abono mensual</th>
                <th className="text-center font-medium px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-500/5">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-surface-900/30 transition">
                  <td className="px-4 py-3 font-medium text-white">{c.nombre}</td>
                  <td className="px-4 py-3 text-surface-200/70">{c.proyecto || '—'}</td>
                  <td className="px-4 py-3 text-surface-200/70">
                    {c.email || c.telefono || '—'}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtMoney(c.monto_mensual)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.estado === 'activo'
                        ? 'bg-primary-500/15 text-primary-300'
                        : 'bg-surface-800 text-surface-200/50'
                    }`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditing(c)} className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-primary-300 transition">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(c)} className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-red-400 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <ClienteForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}

function ClienteForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try { await onSave(form) }
    catch (err) { setError(err.message); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="glass relative w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">
            {form.id ? 'Editar cliente' : 'Nuevo cliente'}
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-surface-800 text-surface-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre *" className="col-span-2">
            <input required value={form.nombre} onChange={set('nombre')} className={inputCls} />
          </Field>
          <Field label="Proyecto" className="col-span-2">
            <input value={form.proyecto || ''} onChange={set('proyecto')} className={inputCls} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email || ''} onChange={set('email')} className={inputCls} />
          </Field>
          <Field label="Teléfono">
            <input value={form.telefono || ''} onChange={set('telefono')} className={inputCls} />
          </Field>
          <Field label="Abono mensual (ARS)">
            <input type="number" min="0" step="0.01" value={form.monto_mensual ?? ''} onChange={set('monto_mensual')} className={inputCls} />
          </Field>
          <Field label="Estado">
            <select value={form.estado} onChange={set('estado')} className={inputCls}>
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>
          </Field>
          <Field label="Notas" className="col-span-2">
            <textarea rows={2} value={form.notas || ''} onChange={set('notas')} className={inputCls} />
          </Field>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-surface-200/70 hover:bg-surface-800 transition">
            Cancelar
          </button>
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
