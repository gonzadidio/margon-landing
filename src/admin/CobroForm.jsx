// Alta / edición de un cobro (setup, único, histórico o mensual puntual).
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut } from './api'
import { Modal, Btn, Field, ErrorMsg } from './ui'
import { MONEDAS, TIPOS_COBRO, FORMAS_PAGO, periodoActual, hoyISO } from './format'

export default function CobroForm({ cobro, clienteId, clienteNombre, onClose, onSaved }) {
  const editando = !!cobro?.id
  const [clientes, setClientes] = useState(null)
  const [f, setF] = useState(() => ({
    cliente_id: cobro?.cliente_id || clienteId || '',
    tipo: cobro?.tipo || 'mensual',
    concepto: cobro?.concepto || '',
    periodo: cobro?.periodo || periodoActual(),
    monto: cobro?.monto ?? '',
    moneda: cobro?.moneda || 'ARS',
    vencimiento: cobro?.vencimiento ? String(cobro.vencimiento).slice(0, 10) : '',
    notas: cobro?.notas || '',
    pagado: false, fecha_pago: hoyISO(), metodo_pago: '',
  }))
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  useEffect(() => {
    if (clienteId || editando) return
    apiGet('/clientes').then((cs) => {
      setClientes(cs)
      setF((x) => x.cliente_id ? x : { ...x, cliente_id: cs[0]?.id || '' })
    }).catch((e) => setError(e.message))
  }, [clienteId, editando])

  // Al elegir cliente, heredamos su moneda y abono.
  useEffect(() => {
    if (!clientes || editando) return
    const c = clientes.find((x) => String(x.id) === String(f.cliente_id))
    if (c) setF((x) => ({ ...x, moneda: c.moneda || 'ARS', monto: x.monto === '' && f.tipo === 'mensual' ? c.monto_mensual : x.monto }))
  }, [f.cliente_id, clientes]) // eslint-disable-line react-hooks/exhaustive-deps

  async function guardar(e) {
    e.preventDefault(); setError(''); setGuardando(true)
    try {
      const body = { ...f, monto: Number(f.monto) || 0, vencimiento: f.vencimiento || null, concepto: f.concepto || null, notas: f.notas || null }
      const r = editando ? await apiPut(`/cobros/${cobro.id}`, body) : await apiPost('/cobros', body)
      onSaved?.(r)
    } catch (err) { setError(err.message) } finally { setGuardando(false) }
  }

  return (
    <Modal title={editando ? 'Editar cobro' : 'Nuevo cobro'} subtitle={clienteNombre || cobro?.cliente_nombre} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" loading={guardando} onClick={guardar}>{editando ? 'Guardar' : 'Crear cobro'}</Btn></>}>
      <form onSubmit={guardar} className="grid sm:grid-cols-2 gap-3">
        {!clienteId && !editando && (
          <Field label="Cliente" full>
            <select value={f.cliente_id} onChange={set('cliente_id')} className="ad-input" required>
              {(clientes || []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Field>
        )}
        <Field label="Tipo">
          <select value={f.tipo} onChange={set('tipo')} className="ad-input">
            {TIPOS_COBRO.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Período"><input type="month" value={f.periodo} onChange={set('periodo')} className="ad-input" required /></Field>
        <Field label="Concepto" full hint="Si lo dejás vacío se usa uno genérico según el tipo."><input value={f.concepto} onChange={set('concepto')} placeholder="Ej: Setup inicial · Sitio institucional" className="ad-input" /></Field>
        <Field label="Monto"><input type="number" min="0" step="0.01" value={f.monto} onChange={set('monto')} className="ad-input" required /></Field>
        <Field label="Moneda"><select value={f.moneda} onChange={set('moneda')} className="ad-input">{MONEDAS.map((m) => <option key={m}>{m}</option>)}</select></Field>
        <Field label="Vencimiento"><input type="date" value={f.vencimiento} onChange={set('vencimiento')} className="ad-input" /></Field>
        <Field label="Notas internas"><input value={f.notas} onChange={set('notas')} className="ad-input" /></Field>
        {!editando && (
          <div className="sm:col-span-2 rounded-lg bg-white/4 ring-1 ad-line p-3 space-y-3">
            <label className="flex items-center gap-2 text-[13px] ad-ink cursor-pointer">
              <input type="checkbox" checked={f.pagado} onChange={set('pagado')} /> Ya está pagado (cobro histórico)
            </label>
            {f.pagado && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Fecha de pago"><input type="date" value={f.fecha_pago} onChange={set('fecha_pago')} className="ad-input" /></Field>
                <Field label="Forma de pago">
                  <select value={f.metodo_pago} onChange={set('metodo_pago')} className="ad-input">
                    <option value="">—</option>{FORMAS_PAGO.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </Field>
              </div>
            )}
          </div>
        )}
        <ErrorMsg>{error}</ErrorMsg>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
