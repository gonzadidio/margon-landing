// Fila de cobro + acciones (avisar por WhatsApp / mail, registrar pago,
// comprobante, editar, borrar). Se usa en Hoy, Cobros y la ficha del cliente.
import { useState } from 'react'
import { MessageCircle, Mail, FileText, Pencil, Trash2, Wallet } from 'lucide-react'
import { apiDelete, abrirEnPestana } from './api'
import { Pill, IconBtn, Avatar, useToast } from './ui'
import { fmtMoney, fmtFecha, relFecha, estadoPago, ESTADO_PAGO, saldoCobro, periodoLargo, capitalizar, tipoCobroMeta } from './format'
import { hrefCliente } from './nav'
import EnviarMensaje from './EnviarMensaje'
import RegistrarPago from './RegistrarPago'
import CobroForm from './CobroForm'

// Maneja los modales de acciones sobre cobros. Devuelve las funciones y el
// JSX de los modales para renderizar una sola vez por pantalla.
export function useAccionesCobro(onChange) {
  const toast = useToast()
  const [aviso, setAviso] = useState(null)   // { cobro, tipo }
  const [pago, setPago] = useState(null)     // cobro
  const [edit, setEdit] = useState(null)     // cobro

  async function verComprobante(cobro) {
    try { await abrirEnPestana(`/cobros/${cobro.id}/comprobante.pdf`) } catch (e) { toast(e.message, 'error') }
  }
  async function borrar(cobro) {
    if (!confirm(`¿Eliminar el cobro de ${cobro.cliente_nombre} (${cobro.concepto || periodoLargo(cobro.periodo)})? Se borran también sus pagos.`)) return
    try { await apiDelete(`/cobros/${cobro.id}`); toast('Cobro eliminado'); onChange?.() } catch (e) { toast(e.message, 'error') }
  }

  const modales = (
    <>
      {aviso && (
        <EnviarMensaje tipo={aviso.tipo} canal={aviso.canal} cobro={aviso.cobro} clienteId={aviso.cobro.cliente_id}
          onClose={() => setAviso(null)} onEnviado={() => { setAviso(null); onChange?.() }} />
      )}
      {pago && (
        <RegistrarPago cobro={pago} onClose={() => { setPago(null); onChange?.() }} onChange={() => onChange?.()}
          onEnviarComprobante={(c) => { setPago(null); setAviso({ cobro: c, tipo: 'comprobante' }) }} />
      )}
      {edit && (
        <CobroForm cobro={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); toast('Cobro guardado'); onChange?.() }} />
      )}
    </>
  )
  return {
    avisar: (cobro, canal, tipo) => setAviso({ cobro, canal, tipo: tipo || (estadoPago(cobro) === 'vencido' ? 'recordatorio' : 'aviso') }),
    cobrar: setPago, editar: setEdit, verComprobante, borrar, modales,
  }
}

export function UltimoAviso({ e }) {
  if (!e) return <span className="text-[11.5px] text-amber-300/90">sin avisar</span>
  const canal = e.canal === 'whatsapp' ? 'WhatsApp' : 'mail'
  const tipo = { aviso: 'aviso', recordatorio: 'recordatorio', comprobante: 'comprobante', libre: 'mensaje' }[e.tipo] || e.tipo
  return <span className="text-[11.5px] ad-faint">{tipo} por {canal} · {relFecha(e.fecha)}</span>
}

export default function CobroRow({ c, acciones, mostrarCliente = true, mostrarPeriodo = true, compacto = false }) {
  const est = estadoPago(c)
  const meta = ESTADO_PAGO[est]
  const saldo = saldoCobro(c)
  const pagado = est === 'pagado'
  const tipo = tipoCobroMeta(c.tipo)
  const dias = c.vencimiento ? relFecha(c.vencimiento) : null

  // Segunda línea: concepto / período, vencimiento o pago, último aviso.
  const detalle = []
  if (mostrarCliente) {
    if (c.concepto) detalle.push(c.concepto)
    if (mostrarPeriodo && (!c.concepto || c.tipo !== 'mensual')) detalle.push(capitalizar(periodoLargo(c.periodo)))
  } else if (mostrarPeriodo && c.concepto) {
    detalle.push(capitalizar(periodoLargo(c.periodo)))
  }
  if (!pagado && c.vencimiento) detalle.push(<span key="v" className={est === 'vencido' ? 'text-red-300' : ''}>vence {fmtFecha(c.vencimiento)} ({dias})</span>)
  if (pagado && c.fecha_pago) detalle.push(`pagado el ${fmtFecha(c.fecha_pago)}${c.metodo_pago ? ` · ${c.metodo_pago}` : ''}`)
  if (!compacto && !pagado) detalle.push(<UltimoAviso key="u" e={c.ultimo_envio} />)

  return (
    <div className="ad-row">
      {mostrarCliente && <Avatar nombre={c.cliente_nombre} size="sm" />}
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-tight truncate">
          {mostrarCliente
            ? <a href={hrefCliente(c.cliente_id)} className="ad-link">{c.cliente_nombre}</a>
            : <span className="ad-link">{c.concepto || capitalizar(periodoLargo(c.periodo))}</span>}
          {c.tipo !== 'mensual' && <Pill tone={tipo.tone} className="ml-2 !text-[10px]">{tipo.label}</Pill>}
        </p>
        {detalle.length > 0 && (
          <p className="text-[12px] ad-muted mt-0.5 leading-snug">
            {detalle.map((d, i) => <span key={i}>{i > 0 && <span className="ad-faint"> · </span>}{d}</span>)}
          </p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13.5px] font-bold ad-ink tabular-nums">{fmtMoney(pagado ? c.monto : saldo, c.moneda)}</p>
        {est === 'parcial' && <p className="text-[11px] ad-faint tabular-nums">de {fmtMoney(c.monto, c.moneda)}</p>}
      </div>
      {/* En pantallas chicas, estado y acciones pasan a una segunda línea */}
      <div className="basis-full sm:basis-auto flex items-center justify-between sm:justify-start gap-2 -mr-1">
        <Pill tone={meta.tone} className="sm:w-[76px] justify-center">{meta.label}</Pill>
        <div className="flex items-center shrink-0">
          {!pagado && <IconBtn icon={MessageCircle} tone="wa" title="Avisar por WhatsApp" disabled={!c.cliente_telefono} onClick={() => acciones.avisar(c, 'whatsapp')} />}
          {!pagado && <IconBtn icon={Mail} tone="mail" title="Avisar por mail" disabled={!c.cliente_email} onClick={() => acciones.avisar(c, 'email')} />}
          {!pagado
            ? <IconBtn icon={Wallet} title="Registrar pago" onClick={() => acciones.cobrar(c)} className="text-primary-300" />
            : <IconBtn icon={FileText} title="Comprobante PDF" onClick={() => acciones.verComprobante(c)} />}
          {!compacto && <IconBtn icon={Pencil} title="Editar" onClick={() => acciones.editar(c)} />}
          {!compacto && <IconBtn icon={Trash2} tone="danger" title="Eliminar" onClick={() => acciones.borrar(c)} />}
        </div>
      </div>
    </div>
  )
}
