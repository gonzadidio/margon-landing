import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Search, FolderKanban, Bell } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, MONEDAS } from './format'
import { useNav } from './nav'

const VACIO = {
  nombre: '', email: '', telefono: '', proyecto: '',
  monto_mensual: '', moneda: 'ARS', estado: 'activo', notas: '',
  dia_cobro: '', sitio_url: '', canal: '', fecha_alta: '',
  setup_monto: '', setup_estado: 'pagado',
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [q, setQ] = useState('')
  const { verCliente } = useNav()

  async function load() {
    setLoading(true)
    try { setClientes(await apiFetch('/clientes')); setError('') }
    catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function save(data) {
    const { setup_monto, setup_estado, ...rest } = data
    const payload = { ...rest, monto_mensual: Number(rest.monto_mensual) || 0, dia_cobro: rest.dia_cobro ? Number(rest.dia_cobro) : null }
    if (data.id) {
      await apiFetch(`/clientes/${data.id}`, { method: 'PUT', body: JSON.stringify(payload) })
    } else {
      const cliente = await apiFetch('/clientes', { method: 'POST', body: JSON.stringify(payload) })
      const monto = Number(setup_monto) || 0
      if (monto > 0 && cliente?.id) {
        const est = setup_estado || 'pagado'
        await apiFetch('/cobros', { method: 'POST', body: JSON.stringify({
          cliente_id: cliente.id, tipo: 'setup', concepto: 'Setup inicial',
          periodo: new Date().toISOString().slice(0, 7), monto, moneda: payload.moneda,
          estado: est, fecha_pago: est === 'pagado' ? new Date().toISOString().slice(0, 10) : null,
        }) })
      }
    }
    setEditing(null); load()
  }

  async function remove(c) {
    if (!confirm(`¿Eliminar a "${c.nombre}"? Se borran también sus cobros, proyectos y archivos.`)) return
    await apiFetch(`/clientes/${c.id}`, { method: 'DELETE' }); load()
  }

  const list = clientes.filter((c) => c.nombre.toLowerCase().includes(q.toLowerCase()) || (c.proyecto || '').toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold ad-ink tracking-tight">Clientes</h1>
        <button onClick={() => setEditing({ ...VACIO })} className="ad-btn ad-btn-primary"><Plus className="w-4 h-4" /> Nuevo cliente</button>
      </div>

      <div className="flex items-center gap-2 ad-card px-3 max-w-sm">
        <Search className="w-4 h-4 ad-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente…" className="w-full bg-transparent py-2.5 text-sm outline-none ad-ink" />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 ad-muted text-sm py-10 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</div>
      ) : list.length === 0 ? (
        <p className="ad-muted text-sm py-10 text-center">{q ? 'Sin resultados.' : 'Todavía no hay clientes. Creá el primero.'}</p>
      ) : (
        <div className="ad-card overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              <th className="ad-th">Nombre</th><th className="ad-th">Contacto</th>
              <th className="ad-th text-center">Actividad</th><th className="ad-th text-right">Abono</th>
              <th className="ad-th text-center">Estado</th><th className="ad-th"></th>
            </tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="ad-hover transition">
                  <td className="ad-td">
                    <button onClick={() => verCliente(c.id)} className="font-semibold ad-ink hover:text-primary-300 transition text-left flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-primary-500/15 text-primary-300 grid place-items-center text-xs font-bold">{c.nombre.slice(0, 2).toUpperCase()}</span>
                      <span>{c.nombre}{c.proyecto && <span className="block text-xs ad-faint font-normal">{c.proyecto}</span>}</span>
                    </button>
                  </td>
                  <td className="ad-td ad-muted">{c.email || c.telefono || '—'}</td>
                  <td className="ad-td">
                    <div className="flex items-center justify-center gap-3 text-xs ad-muted">
                      {Number(c.proyectos_count) > 0 && <span className="flex items-center gap-1"><FolderKanban className="w-3.5 h-3.5" /> {c.proyectos_count}</span>}
                      {Number(c.pendientes_count) > 0 && <span className="flex items-center gap-1 text-amber-300"><Bell className="w-3.5 h-3.5" /> {c.pendientes_count}</span>}
                      {Number(c.proyectos_count) === 0 && Number(c.pendientes_count) === 0 && '—'}
                    </div>
                  </td>
                  <td className="ad-td text-right tabular-nums ad-ink">{fmtMoney(c.monto_mensual, c.moneda)}{c.moneda === 'USD' && <span className="text-xs text-primary-300 ml-1">USD</span>}</td>
                  <td className="ad-td text-center"><span className={`ad-pill ${c.estado === 'activo' ? 'ad-pill-green' : 'ad-pill-gray'}`}>{c.estado}</span></td>
                  <td className="ad-td">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditing(c)} className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-primary-300 transition"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => remove(c)} className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
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
    e.preventDefault(); setSaving(true); setError('')
    try { await onSave(form) } catch (err) { setError(err.message); setSaving(false) }
  }

  return (
    <div className="ad-overlay" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="ad-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold ad-ink">{form.id ? 'Editar cliente' : 'Nuevo cliente'}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 ad-muted"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre *" full><input required value={form.nombre} onChange={set('nombre')} className="ad-input" /></Field>
          <Field label="Proyecto / referencia" full><input value={form.proyecto || ''} onChange={set('proyecto')} className="ad-input" /></Field>
          <Field label="Email"><input type="email" value={form.email || ''} onChange={set('email')} className="ad-input" /></Field>
          <Field label="Teléfono"><input value={form.telefono || ''} onChange={set('telefono')} className="ad-input" /></Field>
          <Field label="Sitio web"><input value={form.sitio_url || ''} onChange={set('sitio_url')} placeholder="https://…" className="ad-input" /></Field>
          <Field label="Canal de captación"><input value={form.canal || ''} onChange={set('canal')} placeholder="Instagram, referido…" className="ad-input" /></Field>
          <Field label="Abono mensual"><input type="number" min="0" step="0.01" value={form.monto_mensual ?? ''} onChange={set('monto_mensual')} className="ad-input" /></Field>
          <Field label="Moneda"><select value={form.moneda} onChange={set('moneda')} className="ad-input">{MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}</select></Field>
          <Field label="Día de cobro (1-28)"><input type="number" min="1" max="28" value={form.dia_cobro ?? ''} onChange={set('dia_cobro')} placeholder="Ej: 10" className="ad-input" /></Field>
          <Field label="Cliente desde"><input type="date" value={form.fecha_alta || ''} onChange={set('fecha_alta')} className="ad-input" /></Field>
          <Field label="Estado"><select value={form.estado} onChange={set('estado')} className="ad-input"><option value="activo">activo</option><option value="inactivo">inactivo</option></select></Field>

          {!form.id && (
            <>
              <div className="col-span-2 border-t ad-line pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">Setup inicial · pago único (opcional)</p>
                <p className="text-[11px] ad-faint mt-0.5">Si cobrás una puesta en marcha, ponés el monto y se registra solo.</p>
              </div>
              <Field label={`Monto del setup (${form.moneda})`}><input type="number" min="0" step="0.01" value={form.setup_monto} onChange={set('setup_monto')} placeholder="0" className="ad-input" /></Field>
              <Field label="Estado del setup"><select value={form.setup_estado} onChange={set('setup_estado')} className="ad-input"><option value="pagado">Pagado</option><option value="pendiente">Pendiente</option></select></Field>
            </>
          )}

          <Field label="Notas" full><textarea rows={2} value={form.notas || ''} onChange={set('notas')} className="ad-input" /></Field>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="ad-btn ad-btn-ghost">Cancelar</button>
          <button type="submit" disabled={saving} className="ad-btn ad-btn-primary">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar</button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children, full }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? 'col-span-2' : ''}`}>
      <span className="text-xs font-medium uppercase tracking-wide ad-muted">{label}</span>
      {children}
    </label>
  )
}
