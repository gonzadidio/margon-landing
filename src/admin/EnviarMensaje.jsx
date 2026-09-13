// Modal para mandar un mensaje al cliente. El texto se arma con la plantilla
// y se puede retocar. Nada sale hasta que se aprieta el botón.
import { useEffect, useState } from 'react'
import { MessageCircle, Mail, ExternalLink, Paperclip, Info } from 'lucide-react'
import { apiGet, apiPost } from './api'
import { Modal, Btn, Field, Segment, ErrorMsg, Cargando, useToast } from './ui'

const TIPOS = [
  { v: 'aviso', label: 'Aviso de cobro' },
  { v: 'recordatorio', label: 'Recordatorio de pago' },
  { v: 'comprobante', label: 'Comprobante de pago' },
  { v: 'portal', label: 'Acceso al portal' },
  { v: 'presupuesto', label: 'Presupuesto enviado' },
  { v: 'libre', label: 'Mensaje libre' },
]

export default function EnviarMensaje({ tipo: tipoInicial = 'libre', canal: canalPreferido, clienteId, cobro, extra = {}, onClose, onEnviado }) {
  const toast = useToast()
  const [tipo, setTipo] = useState(tipoInicial)
  const [data, setData] = useState(null)
  const [canal, setCanal] = useState(null)
  const [asunto, setAsunto] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [adjuntar, setAdjuntar] = useState(tipoInicial === 'comprobante')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const cid = clienteId || cobro?.cliente_id

  useEffect(() => {
    let vivo = true
    setError('')
    apiGet('/mensajes/componer', { tipo, cliente_id: cid, cobro_id: cobro?.id, link: extra.link, titulo: extra.titulo })
      .then((d) => {
        if (!vivo) return
        setData(d); setAsunto(d.asunto); setCuerpo(d.cuerpo)
        setCanal((c) => {
          if (c) return c
          const disponible = { whatsapp: !!d.whatsapp, email: !!d.email }
          if (canalPreferido && disponible[canalPreferido]) return canalPreferido
          return d.whatsapp ? 'whatsapp' : 'email'
        })
      })
      .catch((e) => vivo && setError(e.message))
    return () => { vivo = false }
  }, [tipo, cid, cobro?.id, extra.link, extra.titulo, canalPreferido])

  const puedeAdjuntar = canal === 'email' && data?.puede_email && !!cobro

  async function enviar(canalReal) {
    setError(''); setEnviando(true)
    // Abrimos la pestaña antes del await para que el navegador no la bloquee.
    const w = canalReal === 'whatsapp' ? window.open('', '_blank') : null
    try {
      const r = await apiPost('/mensajes/enviar', {
        tipo, canal: canalReal, cliente_id: cid, cobro_id: cobro?.id || null,
        asunto, cuerpo, adjuntar_comprobante: puedeAdjuntar && adjuntar,
      })
      if (canalReal === 'whatsapp') { if (w) w.location = r.wa_url; else window.open(r.wa_url, '_blank') }
      if (canalReal === 'mailto') window.location.href = r.mailto_url
      toast(canalReal === 'email' ? `Mail enviado a ${data.email}` : canalReal === 'whatsapp' ? 'WhatsApp abierto y registrado' : 'Abierto en tu correo y registrado')
      onEnviado?.(r.envio)
    } catch (e) {
      if (w) w.close()
      setError(e.message)
    } finally { setEnviando(false) }
  }

  const sinTel = !data?.whatsapp, sinMail = !data?.email
  const footer = data && (
    <>
      <Btn onClick={onClose}>Cancelar</Btn>
      {canal === 'whatsapp' && (
        <Btn variant="wa" icon={ExternalLink} loading={enviando} disabled={sinTel || !cuerpo.trim()} onClick={() => enviar('whatsapp')}>
          Abrir WhatsApp con el mensaje
        </Btn>
      )}
      {canal === 'email' && data.puede_email && (
        <Btn variant="primary" icon={Mail} loading={enviando} disabled={sinMail || !cuerpo.trim()} onClick={() => enviar('email')}>
          Enviar mail
        </Btn>
      )}
      {canal === 'email' && !data.puede_email && (
        <Btn variant="primary" icon={ExternalLink} loading={enviando} disabled={sinMail || !cuerpo.trim()} onClick={() => enviar('mailto')}>
          Abrir en mi correo
        </Btn>
      )}
    </>
  )

  return (
    <Modal title="Mandar mensaje" subtitle={data ? `Para ${data.email || data.telefono || 'el cliente'}` : ''} onClose={onClose} footer={footer} width="max-w-2xl">
      {!data && !error && <Cargando texto="Armando el mensaje…" />}
      <ErrorMsg>{error}</ErrorMsg>
      {data && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <select value={tipo} onChange={(e) => { setTipo(e.target.value); setAdjuntar(e.target.value === 'comprobante') }} className="ad-input !w-auto !py-1.5 text-[13px]">
              {TIPOS.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
            </select>
            <Segment value={canal} onChange={setCanal} options={[
              { v: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, disabled: sinTel },
              { v: 'email', label: 'Mail', icon: Mail, disabled: sinMail },
            ]} />
          </div>

          {canal === 'whatsapp' && sinTel && <p className="text-[13px] text-amber-300">El cliente no tiene teléfono cargado.</p>}
          {canal === 'email' && sinMail && <p className="text-[13px] text-amber-300">El cliente no tiene email cargado.</p>}
          {canal === 'email' && !sinMail && !data.puede_email && (
            <p className="text-[12.5px] ad-muted flex items-start gap-2 rounded-lg bg-white/4 px-3 py-2 ring-1 ad-line">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-300" />
              <span>El envío automático de mails no está configurado (ver Ajustes). El mensaje se abre en tu programa de correo, listo para mandar, y queda registrado igual.</span>
            </p>
          )}

          {canal === 'email' && (
            <Field label="Asunto"><input value={asunto} onChange={(e) => setAsunto(e.target.value)} className="ad-input" /></Field>
          )}
          <Field label={canal === 'whatsapp' ? `Mensaje · se abre en WhatsApp a +${data.whatsapp}` : 'Mensaje'}>
            <textarea value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} rows={12} className="ad-input ad-textarea" />
          </Field>
          {puedeAdjuntar && (
            <label className="flex items-center gap-2 text-[13px] ad-ink cursor-pointer">
              <input type="checkbox" checked={adjuntar} onChange={(e) => setAdjuntar(e.target.checked)} />
              <Paperclip className="w-3.5 h-3.5 ad-muted" /> Adjuntar el comprobante en PDF
            </label>
          )}
          {canal === 'whatsapp' && tipo === 'comprobante' && (
            <p className="text-[12px] ad-faint">Por WhatsApp va solo el texto. El PDF lo descargás desde el cobro con el botón “Comprobante” y lo adjuntás en el chat.</p>
          )}
        </div>
      )}
    </Modal>
  )
}
