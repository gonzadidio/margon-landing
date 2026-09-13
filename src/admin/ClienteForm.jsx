import { useState } from 'react'
import { apiPost, apiPut } from './api'
import { Modal, Btn, Field, ErrorMsg } from './ui'
import { MONEDAS } from './format'

const vacio = { nombre: '', proyecto: '', email: '', telefono: '', sitio_url: '', canal: '', monto_mensual: '', moneda: 'ARS', dia_cobro: '', fecha_alta: '', estado: 'activo', notas: '' }

export default function ClienteForm({ cliente, onClose, onSaved }) {
  const editando = !!cliente?.id
  const [f, setF] = useState(() => ({ ...vacio, ...(cliente || {}), fecha_alta: cliente?.fecha_alta ? String(cliente.fecha_alta).slice(0, 10) : '' }))
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  async function guardar(e) {
    e.preventDefault(); setError(''); setGuardando(true)
    try {
      const body = { ...f, monto_mensual: Number(f.monto_mensual) || 0, dia_cobro: f.dia_cobro ? Number(f.dia_cobro) : null, fecha_alta: f.fecha_alta || null }
      const r = editando ? await apiPut(`/clientes/${cliente.id}`, body) : await apiPost('/clientes', body)
      onSaved?.(r)
    } catch (err) { setError(err.message) } finally { setGuardando(false) }
  }

  return (
    <Modal title={editando ? 'Editar cliente' : 'Nuevo cliente'} onClose={onClose} width="max-w-2xl"
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" loading={guardando} onClick={guardar}>{editando ? 'Guardar' : 'Crear cliente'}</Btn></>}>
      <form onSubmit={guardar} className="grid sm:grid-cols-2 gap-3">
        <Field label="Nombre"><input required autoFocus value={f.nombre} onChange={set('nombre')} className="ad-input" /></Field>
        <Field label="Proyecto / referencia"><input value={f.proyecto || ''} onChange={set('proyecto')} placeholder="Ej: Sitio institucional" className="ad-input" /></Field>
        <Field label="Email"><input type="email" value={f.email || ''} onChange={set('email')} className="ad-input" /></Field>
        <Field label="Teléfono / WhatsApp" hint="Con código de área, ej: 11 5555 5555"><input value={f.telefono || ''} onChange={set('telefono')} className="ad-input" /></Field>
        <Field label="Abono mensual" hint="0 si no tiene abono"><input type="number" min="0" step="0.01" value={f.monto_mensual ?? ''} onChange={set('monto_mensual')} className="ad-input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Moneda"><select value={f.moneda} onChange={set('moneda')} className="ad-input">{MONEDAS.map((m) => <option key={m}>{m}</option>)}</select></Field>
          <Field label="Día de cobro"><input type="number" min="1" max="28" value={f.dia_cobro ?? ''} onChange={set('dia_cobro')} placeholder="1-28" className="ad-input" /></Field>
        </div>
        <Field label="Sitio web"><input value={f.sitio_url || ''} onChange={set('sitio_url')} placeholder="https://…" className="ad-input" /></Field>
        <Field label="Cómo llegó"><input value={f.canal || ''} onChange={set('canal')} placeholder="Instagram, referido…" className="ad-input" /></Field>
        <Field label="Cliente desde"><input type="date" value={f.fecha_alta} onChange={set('fecha_alta')} className="ad-input" /></Field>
        <Field label="Estado"><select value={f.estado} onChange={set('estado')} className="ad-input"><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></Field>
        <Field label="Notas" full><textarea rows={2} value={f.notas || ''} onChange={set('notas')} className="ad-input" /></Field>
        <ErrorMsg>{error}</ErrorMsg>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
