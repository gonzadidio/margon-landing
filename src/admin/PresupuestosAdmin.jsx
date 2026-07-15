import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Send, X, Loader2, GripVertical, CheckCircle2 } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, fmtFecha, MONEDAS } from './format'

const EST = {
  borrador:  { label: 'Borrador', cls: 'ad-pill-gray' },
  enviado:   { label: 'Enviado', cls: 'ad-pill-amber' },
  aprobado:  { label: 'Firmado', cls: 'ad-pill-green' },
  rechazado: { label: 'Rechazado', cls: 'ad-pill-red' },
}

export default function PresupuestosAdmin({ clienteId, defaultMoneda = 'ARS' }) {
  const [list, setList] = useState(null)
  const [form, setForm] = useState(null)   // objeto presupuesto en edición / creación
  const [busy, setBusy] = useState(null)

  const load = useCallback(() => {
    apiFetch(`/clientes/${clienteId}/presupuestos`).then(setList).catch(() => setList([]))
  }, [clienteId])
  useEffect(() => { load() }, [load])

  async function nuevo() {
    setForm({
      titulo: '', descripcion: '', moneda: defaultMoneda, notas: '',
      items: [nuevoItem(true), nuevoItem(false)],
    })
  }
  async function editar(p) {
    const full = await apiFetch(`/presupuestos/${p.id}`)
    setForm({ ...full, items: full.items.length ? full.items : [nuevoItem(true)] })
  }
  async function enviar(p) {
    if (!confirm(`¿Enviar "${p.titulo}" al portal del cliente? Va a poder verlo, elegir ítems y firmarlo.`)) return
    setBusy(p.id)
    try { await apiFetch(`/presupuestos/${p.id}/enviar`, { method: 'POST' }); load() }
    catch (e) { alert(e.message) } finally { setBusy(null) }
  }
  async function borrar(p) {
    if (!confirm(`¿Eliminar el presupuesto "${p.titulo}"?`)) return
    await apiFetch(`/presupuestos/${p.id}`, { method: 'DELETE' }); load()
  }
  async function save(payload) {
    if (payload.id) await apiFetch(`/presupuestos/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) })
    else await apiFetch('/presupuestos', { method: 'POST', body: JSON.stringify({ ...payload, cliente_id: clienteId }) })
    setForm(null); load()
  }

  if (!list) return <p className="ad-faint text-sm py-8 text-center">Cargando…</p>

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm ad-muted">Armá un presupuesto con ítems <b>base</b> y <b>opcionales</b>. El cliente elige los opcionales y lo firma desde su portal.</p>
        <button onClick={nuevo} className="ad-btn ad-btn-primary ad-btn-sm"><Plus className="w-4 h-4" /> Nuevo presupuesto</button>
      </div>

      {list.length === 0 ? (
        <p className="ad-faint text-sm py-8 text-center">Sin presupuestos todavía.</p>
      ) : (
        <div className="space-y-2">
          {list.map((p) => {
            const e = EST[p.estado] || EST.borrador
            return (
              <div key={p.id} className="ad-card p-4 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold ad-ink truncate">{p.titulo}</p>
                    <span className={`ad-pill ${e.cls}`}>{e.label}</span>
                  </div>
                  <p className="text-xs ad-faint mt-0.5">
                    {p.items_count} ítem{p.items_count === 1 ? '' : 's'} · {fmtFecha(p.created_at)}
                    {p.estado === 'aprobado' && p.firma_nombre ? ` · firmó ${p.firma_nombre}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold ad-ink tabular-nums text-sm">{fmtMoney(p.estado === 'aprobado' ? p.firma_total : p.total_elegido, p.moneda)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {p.estado !== 'aprobado' && (
                    <button onClick={() => enviar(p)} disabled={busy === p.id} title="Enviar al portal" className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-primary-300 transition">
                      {busy === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  )}
                  {p.estado === 'aprobado'
                    ? <span className="p-1.5 text-primary-400" title="Firmado"><CheckCircle2 className="w-4 h-4" /></span>
                    : <button onClick={() => editar(p)} title="Editar" className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-primary-300 transition"><Pencil className="w-4 h-4" /></button>}
                  <button onClick={() => borrar(p)} title="Eliminar" className="p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {form && <PresupuestoForm initial={form} onSave={save} onClose={() => setForm(null)} />}
    </div>
  )
}

function nuevoItem(obligatorio) {
  return { grupo: '', concepto: '', descripcion: '', costo: '', obligatorio, seleccionado: true }
}

function PresupuestoForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const setItem = (i, k, v) => setF((x) => ({ ...x, items: x.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }))
  const addItem = (obl) => setF((x) => ({ ...x, items: [...x.items, nuevoItem(obl)] }))
  const delItem = (i) => setF((x) => ({ ...x, items: x.items.filter((_, j) => j !== i) }))

  const items = f.items.filter((it) => it.concepto.trim())
  const totalBase = items.filter((it) => it.obligatorio).reduce((s, it) => s + (Number(it.costo) || 0), 0)
  const totalMax = items.reduce((s, it) => s + (Number(it.costo) || 0), 0)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    if (!f.titulo.trim()) return setErr('Poné un título.')
    if (!items.length) return setErr('Agregá al menos un ítem con concepto.')
    setSaving(true)
    try {
      await onSave({
        ...f,
        items: items.map((it, idx) => ({
          grupo: it.grupo?.trim() || null,
          concepto: it.concepto.trim(),
          descripcion: it.descripcion?.trim() || null,
          costo: Number(it.costo) || 0,
          obligatorio: !!it.obligatorio,
          seleccionado: it.obligatorio ? true : (it.seleccionado !== false),
          orden: idx,
        })),
      })
    } catch (e2) { setErr(e2.message); setSaving(false) }
  }

  return (
    <div className="ad-overlay" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="ad-card w-full max-w-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold ad-ink">{f.id ? 'Editar' : 'Nuevo'} presupuesto</h3>
          <button type="button" onClick={onClose} className="ad-muted"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <L label="Título *" full><input required value={f.titulo} onChange={set('titulo')} placeholder="Ej: Sitio web + reservas online" className="ad-input" /></L>
          <L label="Descripción" full><textarea rows={2} value={f.descripcion || ''} onChange={set('descripcion')} placeholder="Resumen breve de lo que incluye" className="ad-input" /></L>
          <L label="Moneda"><select value={f.moneda} onChange={set('moneda')} className="ad-input">{MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}</select></L>
          <L label="Notas internas" ><input value={f.notas || ''} onChange={set('notas')} placeholder="No lo ve el cliente" className="ad-input" /></L>
        </div>

        {/* Ítems */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide ad-muted">Ítems</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => addItem(true)} className="ad-btn ad-btn-soft ad-btn-sm"><Plus className="w-3.5 h-3.5" /> Base</button>
              <button type="button" onClick={() => addItem(false)} className="ad-btn ad-btn-ghost ad-btn-sm"><Plus className="w-3.5 h-3.5" /> Opcional</button>
            </div>
          </div>

          {f.items.map((it, i) => (
            <div key={i} className="rounded-xl border ad-line p-3 space-y-2" style={{ background: 'rgba(255,255,255,.02)' }}>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setItem(i, 'obligatorio', !it.obligatorio)}
                  className={`ad-pill ${it.obligatorio ? 'ad-pill-gray' : 'ad-pill-violet'} cursor-pointer`}
                  title="Cambiar tipo">
                  {it.obligatorio ? 'Base' : 'Opcional'}
                </button>
                <input value={it.concepto} onChange={(e) => setItem(i, 'concepto', e.target.value)} placeholder="Concepto (ej: Diseño UI)" className="ad-input flex-1" />
                <input type="number" min="0" step="0.01" value={it.costo} onChange={(e) => setItem(i, 'costo', e.target.value)} placeholder="Costo" className="ad-input w-28 text-right tabular-nums" />
                <button type="button" onClick={() => delItem(i)} className="p-1.5 rounded-lg hover:bg-white/10 ad-faint hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={it.grupo || ''} onChange={(e) => setItem(i, 'grupo', e.target.value)} placeholder="Fase / grupo (opcional)" className="ad-input" />
                <input value={it.descripcion || ''} onChange={(e) => setItem(i, 'descripcion', e.target.value)} placeholder="Detalle (opcional)" className="ad-input" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm border-t ad-line pt-3">
          <span className="ad-muted">Base <b className="ad-ink tabular-nums">{fmtMoney(totalBase, f.moneda)}</b> · Con todo <b className="ad-ink tabular-nums">{fmtMoney(totalMax, f.moneda)}</b></span>
        </div>

        {err && <p className="text-sm text-red-400">{err}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="ad-btn ad-btn-ghost">Cancelar</button>
          <button type="submit" disabled={saving} className="ad-btn ad-btn-primary">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar</button>
        </div>
      </form>
    </div>
  )
}

function L({ label, children, full }) {
  return <label className={`flex flex-col gap-1.5 ${full ? 'col-span-2' : ''}`}><span className="text-xs font-medium uppercase tracking-wide ad-muted">{label}</span>{children}</label>
}
