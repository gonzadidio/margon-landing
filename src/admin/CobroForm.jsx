import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { MONEDAS, TIPOS_COBRO, periodoActual } from './format'

export function nuevoCobro(clienteId = '', moneda = 'ARS') {
  return {
    cliente_id: clienteId, tipo: 'setup', concepto: '', periodo: periodoActual(),
    monto: '', moneda, estado: 'pagado', fecha_pago: new Date().toISOString().slice(0, 10), metodo_pago: '',
  }
}

const PLACEHOLDER = { setup: 'Setup inicial / puesta en marcha', unico: 'Ej: desarrollo de módulo extra', mensual: 'Abono mensual' }

export default function CobroForm({ initial, clientes, lockCliente = false, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const pagado = form.estado === 'pagado'

  async function submit(e) {
    e.preventDefault(); setSaving(true); setError('')
    try { await onSave({ ...form, monto: Number(form.monto) || 0 }) }
    catch (err) { setError(err.message); setSaving(false) }
  }

  return (
    <div className="ad-overlay" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="ad-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold ad-ink">Cargar cobro</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-[#eef1ef] ad-muted"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs ad-muted -mt-1">Setup inicial, abono o un cobro puntual. Podés cargarlo con <b>cualquier fecha</b> (sirve para cosas viejas).</p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Cliente *" full>
            <select required value={form.cliente_id} onChange={set('cliente_id')} disabled={lockCliente} className="ad-input">
              <option value="" disabled>Elegí un cliente…</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Field>
          <Field label="Tipo"><select value={form.tipo} onChange={set('tipo')} className="ad-input">{TIPOS_COBRO.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}</select></Field>
          <Field label="Período (mes)"><input type="month" value={form.periodo} onChange={set('periodo')} className="ad-input" /></Field>
          <Field label="Concepto" full><input value={form.concepto} onChange={set('concepto')} placeholder={PLACEHOLDER[form.tipo]} className="ad-input" /></Field>
          <Field label="Monto *"><input required type="number" min="0" step="0.01" value={form.monto} onChange={set('monto')} className="ad-input" /></Field>
          <Field label="Moneda"><select value={form.moneda} onChange={set('moneda')} className="ad-input">{MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}</select></Field>
          <Field label="Estado"><select value={form.estado} onChange={set('estado')} className="ad-input"><option value="pagado">Pagado</option><option value="pendiente">Pendiente</option></select></Field>
          {pagado && <Field label="Fecha de pago"><input type="date" value={form.fecha_pago || ''} onChange={set('fecha_pago')} className="ad-input" /></Field>}
          {pagado && <Field label="Método de pago" full><input value={form.metodo_pago || ''} onChange={set('metodo_pago')} placeholder="Transferencia, efectivo…" className="ad-input" /></Field>}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="ad-btn ad-btn-ghost">Cancelar</button>
          <button type="submit" disabled={saving} className="ad-btn ad-btn-primary">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar cobro</button>
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
