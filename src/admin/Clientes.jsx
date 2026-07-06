import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Eye, FolderKanban, Bell } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, MONEDAS } from './format'
import { useNav } from './nav'

const VACIO = {
  nombre: '', email: '', telefono: '', proyecto: '',
  monto_mensual: '', moneda: 'ARS', estado: 'activo', notas: '',
  dia_cobro: '', sitio_url: '', canal: '', fecha_alta: '',
  setup_monto: '', setup_estado: 'pagado', // solo al crear: pago único inicial
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | {} (nuevo) | cliente
  const { verCliente } = useNav()

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
    const { setup_monto, setup_estado, ...rest } = data
    const payload = {
      ...rest,
      monto_mensual: Number(rest.monto_mensual) || 0,
      dia_cobro: rest.dia_cobro ? Number(rest.dia_cobro) : null,
    }
    if (data.id) {
      await apiFetch(`/clientes/${data.id}`, { method: 'PUT', body: JSON.stringify(payload) })
    } else {
      const cliente = await apiFetch('/clientes', { method: 'POST', body: JSON.stringify(payload) })
      // Setup inicial (pago único) opcional: se crea como cobro tipo 'setup'.
      const monto = Number(setup_monto) || 0
      if (monto > 0 && cliente?.id) {
        const est = setup_estado || 'pagado'
        await apiFetch('/cobros', {
          method: 'POST',
          body: JSON.stringify({
            cliente_id: cliente.id,
            tipo: 'setup',
            concepto: 'Setup inicial',
            periodo: new Date().toISOString().slice(0, 7),
            monto,
            moneda: payload.moneda,
            estado: est,
            fecha_pago: est === 'pagado' ? new Date().toISOString().slice(0, 10) : null,
          }),
        })
      }
    }
    setEditing(null)
    load()
  }

  async function remove(c) {
    if (!confirm(`¿Eliminar a "${c.nombre}"? Se borran también sus cobros, proyectos y seguimientos.`)) return
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
                <th className="text-left font-medium px-4 py-3">Contacto</th>
                <th className="text-center font-medium px-4 py-3">Actividad</th>
                <th className="text-right font-medium px-4 py-3">Abono mensual</th>
                <th className="text-center font-medium px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-500/5">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-surface-900/30 transition">
                  <td className="px-4 py-3">
                    <button onClick={() => verCliente(c.id)} className="font-medium text-white hover:text-primary-300 transition text-left">
                      {c.nombre}
                    </button>
                    {c.proyecto && <p className="text-xs text-surface-200/40">{c.proyecto}</p>}
                  </td>
                  <td className="px-4 py-3 text-surface-200/70">{c.email || c.telefono || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3 text-xs text-surface-200/50">
                      {Number(c.proyectos_count) > 0 && (
                        <span className="flex items-center gap-1" title="Proyectos"><FolderKanban className="w-3.5 h-3.5" /> {c.proyectos_count}</span>
                      )}
                      {Number(c.pendientes_count) > 0 && (
                        <span className="flex items-center gap-1 text-amber-300/80" title="Acciones pendientes"><Bell className="w-3.5 h-3.5" /> {c.pendientes_count}</span>
                      )}
                      {Number(c.proyectos_count) === 0 && Number(c.pendientes_count) === 0 && '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmtMoney(c.monto_mensual, c.moneda)}
                    {c.moneda === 'USD' && <span className="text-xs text-primary-300/60 ml-1">USD</span>}
                  </td>
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
                      <button onClick={() => verCliente(c.id)} title="Ver ficha" className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-primary-300 transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditing(c)} title="Editar" className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-primary-300 transition">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(c)} title="Eliminar" className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-red-400 transition">
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
          <Field label="Proyecto / referencia" className="col-span-2">
            <input value={form.proyecto || ''} onChange={set('proyecto')} className={inputCls} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email || ''} onChange={set('email')} className={inputCls} />
          </Field>
          <Field label="Teléfono">
            <input value={form.telefono || ''} onChange={set('telefono')} className={inputCls} />
          </Field>
          <Field label="Sitio web">
            <input value={form.sitio_url || ''} onChange={set('sitio_url')} placeholder="https://…" className={inputCls} />
          </Field>
          <Field label="Canal de captación">
            <input value={form.canal || ''} onChange={set('canal')} placeholder="Instagram, referido…" className={inputCls} />
          </Field>
          <Field label="Abono mensual">
            <input type="number" min="0" step="0.01" value={form.monto_mensual ?? ''} onChange={set('monto_mensual')} className={inputCls} />
          </Field>
          <Field label="Moneda">
            <select value={form.moneda} onChange={set('moneda')} className={inputCls}>
              {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Día de cobro (1-28)">
            <input type="number" min="1" max="28" value={form.dia_cobro ?? ''} onChange={set('dia_cobro')} placeholder="Ej: 10" className={inputCls} />
          </Field>
          <Field label="Cliente desde">
            <input type="date" value={form.fecha_alta || ''} onChange={set('fecha_alta')} className={inputCls} />
          </Field>
          <Field label="Estado">
            <select value={form.estado} onChange={set('estado')} className={inputCls}>
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>
          </Field>

          {!form.id && (
            <>
              <div className="col-span-2 border-t border-primary-500/10 pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-violet-300/80">
                  Setup inicial · pago único (opcional)
                </p>
                <p className="text-[11px] text-surface-200/40 mt-0.5">
                  Si cobrás una puesta en marcha, ponés el monto acá y se registra solo.
                </p>
              </div>
              <Field label={`Monto del setup (${form.moneda})`}>
                <input type="number" min="0" step="0.01" value={form.setup_monto} onChange={set('setup_monto')} placeholder="0" className={inputCls} />
              </Field>
              <Field label="Estado del setup">
                <select value={form.setup_estado} onChange={set('setup_estado')} className={inputCls}>
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </Field>
            </>
          )}

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
