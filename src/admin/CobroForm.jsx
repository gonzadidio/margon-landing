import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { MONEDAS, TIPOS_COBRO, periodoActual } from './format'

// Formulario para cargar un cobro manual: setup inicial (pago único) o
// cobros históricos ("cosas viejas"). Reutilizable desde Facturación y la ficha.
export function nuevoCobro(clienteId = '', moneda = 'ARS') {
  return {
    cliente_id: clienteId,
    tipo: 'setup',
    concepto: '',
    periodo: periodoActual(),
    monto: '',
    moneda,
    estado: 'pagado',
    fecha_pago: new Date().toISOString().slice(0, 10),
    metodo_pago: '',
  }
}

const PLACEHOLDER = {
  setup: 'Setup inicial / puesta en marcha',
  unico: 'Ej: desarrollo de módulo extra',
  mensual: 'Abono mensual',
}

export default function CobroForm({ initial, clientes, lockCliente = false, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const pagado = form.estado === 'pagado'

  async function submit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await onSave({ ...form, monto: Number(form.monto) || 0 })
    } catch (err) { setError(err.message); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="glass relative w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Cargar cobro manual</h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-surface-800 text-surface-200/60"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-xs text-surface-200/50 -mt-1">
          Para registrar el <span className="text-violet-300">setup inicial</span> (pago único),
          o cobros históricos ya realizados.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Cliente *" className="col-span-2">
            <select required value={form.cliente_id} onChange={set('cliente_id')} disabled={lockCliente} className={inputCls}>
              <option value="" disabled>Elegí un cliente…</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Field>

          <Field label="Tipo">
            <select value={form.tipo} onChange={set('tipo')} className={inputCls}>
              {TIPOS_COBRO.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Período (mes)">
            <input type="month" value={form.periodo} onChange={set('periodo')} className={inputCls} />
          </Field>

          <Field label="Concepto" className="col-span-2">
            <input value={form.concepto} onChange={set('concepto')} placeholder={PLACEHOLDER[form.tipo]} className={inputCls} />
          </Field>

          <Field label="Monto *">
            <input required type="number" min="0" step="0.01" value={form.monto} onChange={set('monto')} className={inputCls} />
          </Field>
          <Field label="Moneda">
            <select value={form.moneda} onChange={set('moneda')} className={inputCls}>
              {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>

          <Field label="Estado">
            <select value={form.estado} onChange={set('estado')} className={inputCls}>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </Field>
          {pagado && (
            <Field label="Fecha de pago">
              <input type="date" value={form.fecha_pago || ''} onChange={set('fecha_pago')} className={inputCls} />
            </Field>
          )}
          {pagado && (
            <Field label="Método de pago" className="col-span-2">
              <input value={form.metodo_pago || ''} onChange={set('metodo_pago')} placeholder="Transferencia, efectivo, MercadoPago…" className={inputCls} />
            </Field>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-surface-200/70 hover:bg-surface-800 transition">Cancelar</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-[#0a0f0d] font-semibold text-sm transition">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar cobro
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg bg-surface-900/60 border border-primary-500/15 px-3 py-2 text-white outline-none focus:border-primary-400/50 transition text-sm disabled:opacity-60'

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-surface-200/50">{label}</span>
      {children}
    </label>
  )
}
