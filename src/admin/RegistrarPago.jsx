// Registrar un pago (total o parcial) de un cobro y ver los pagos anteriores.
import { useEffect, useState } from 'react'
import { Trash2, CheckCircle2, Send } from 'lucide-react'
import { apiGet, apiPost, apiDelete } from './api'
import { Modal, Btn, Field, ErrorMsg, Cargando, IconBtn, useToast } from './ui'
import { fmtMoney, fmtFecha, hoyISO, FORMAS_PAGO, saldoCobro, periodoLargo } from './format'

export default function RegistrarPago({ cobro: inicial, onClose, onChange, onEnviarComprobante }) {
  const toast = useToast()
  const [cobro, setCobro] = useState(null)
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(hoyISO())
  const [metodo, setMetodo] = useState('')
  const [nota, setNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [registrado, setRegistrado] = useState(false)

  useEffect(() => {
    apiGet(`/cobros/${inicial.id}`).then((c) => {
      setCobro(c); setMonto(String(saldoCobro(c) || '')); setMetodo(c.metodo_pago || '')
    }).catch((e) => setError(e.message))
  }, [inicial.id])

  async function guardar(e) {
    e?.preventDefault()
    if (!(Number(monto) > 0)) return setError('El monto tiene que ser mayor a 0')
    setError(''); setGuardando(true)
    try {
      await apiPost(`/cobros/${cobro.id}/pagos`, { monto: Number(monto), fecha, metodo: metodo || null, nota: nota || null })
      const c = await apiGet(`/cobros/${cobro.id}`)
      setCobro(c); setMonto(String(saldoCobro(c) || '')); setNota('')
      setRegistrado(true); onChange?.(c)
      toast('Pago registrado')
    } catch (err) { setError(err.message) } finally { setGuardando(false) }
  }

  async function borrar(p) {
    if (!confirm(`¿Eliminar el pago de ${fmtMoney(p.monto, cobro.moneda)} del ${fmtFecha(p.fecha)}?`)) return
    try {
      await apiDelete(`/pagos/${p.id}`)
      const c = await apiGet(`/cobros/${cobro.id}`)
      setCobro(c); setMonto(String(saldoCobro(c) || '')); onChange?.(c)
    } catch (err) { setError(err.message) }
  }

  const saldo = cobro ? saldoCobro(cobro) : 0
  const pagadoTodo = cobro && saldo === 0 && Number(cobro.monto) > 0

  return (
    <Modal title="Registrar pago" subtitle={cobro ? `${cobro.cliente_nombre} · ${cobro.concepto || periodoLargo(cobro.periodo)} · ${fmtMoney(cobro.monto, cobro.moneda)}` : ''} onClose={onClose}
      footer={cobro && (
        <>
          <Btn onClick={onClose}>{registrado ? 'Listo' : 'Cancelar'}</Btn>
          {registrado && <Btn variant="primary" icon={Send} onClick={() => onEnviarComprobante?.(cobro)}>Mandar comprobante</Btn>}
          {!pagadoTodo && <Btn variant={registrado ? 'soft' : 'primary'} icon={CheckCircle2} loading={guardando} onClick={guardar}>Registrar {fmtMoney(monto, cobro.moneda)}</Btn>}
        </>
      )}>
      {!cobro && !error && <Cargando />}
      <ErrorMsg>{error}</ErrorMsg>
      {cobro && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Dato label="Total" valor={fmtMoney(cobro.monto, cobro.moneda)} />
            <Dato label="Pagado" valor={fmtMoney(cobro.pagado, cobro.moneda)} tone="text-primary-300" />
            <Dato label="Saldo" valor={fmtMoney(saldo, cobro.moneda)} tone={saldo > 0 ? 'text-amber-300' : 'text-primary-300'} />
          </div>

          {pagadoTodo ? (
            <p className="text-[13.5px] ad-ink flex items-center gap-2 rounded-lg bg-primary-500/10 px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary-300" /> Este cobro está pagado por completo.
            </p>
          ) : (
            <form onSubmit={guardar} className="grid sm:grid-cols-2 gap-3">
              <Field label="Monto"><input type="number" min="0" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} className="ad-input" autoFocus /></Field>
              <Field label="Fecha"><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="ad-input" /></Field>
              <Field label="Forma de pago">
                <select value={metodo} onChange={(e) => setMetodo(e.target.value)} className="ad-input">
                  <option value="">—</option>
                  {FORMAS_PAGO.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Nota"><input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Opcional" className="ad-input" /></Field>
            </form>
          )}

          {cobro.pagos?.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide ad-muted mb-1.5">Pagos registrados</p>
              <div className="ad-card divide-y divide-white/5">
                {cobro.pagos.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-2 text-[13px]">
                    <span className="ad-ink font-semibold tabular-nums">{fmtMoney(p.monto, cobro.moneda)}</span>
                    <span className="ad-muted">{fmtFecha(p.fecha)}{p.metodo ? ` · ${p.metodo}` : ''}{p.nota ? ` · ${p.nota}` : ''}</span>
                    <IconBtn icon={Trash2} tone="danger" title="Eliminar pago" className="ml-auto" onClick={() => borrar(p)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

const Dato = ({ label, valor, tone = 'ad-ink' }) => (
  <div className="rounded-lg bg-white/4 ring-1 ad-line py-2.5 px-2 min-w-0">
    <p className="text-[10.5px] uppercase tracking-wide ad-muted font-semibold">{label}</p>
    <p className={`text-[15px] font-bold tabular-nums mt-0.5 truncate ${tone}`}>{valor}</p>
  </div>
)
