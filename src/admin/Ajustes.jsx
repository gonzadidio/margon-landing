// Ajustes: mi mail y el resumen diario, datos de pago, firma y plantillas.
import { useEffect, useState } from 'react'
import { Send, RotateCcw, Check, Info } from 'lucide-react'
import { apiGet, apiPut, apiPost } from './api'
import { Card, Btn, Field, Pill, Cargando, ErrorMsg, useToast } from './ui'

export default function Ajustes() {
  const toast = useToast()
  const [a, setA] = useState(null)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [probando, setProbando] = useState(false)
  const [pl, setPl] = useState('aviso')
  const [dirty, setDirty] = useState(false)

  useEffect(() => { apiGet('/ajustes').then(setA).catch((e) => setError(e.message)) }, [])

  if (!a && !error) return <Cargando />
  if (error && !a) return <ErrorMsg>{error}</ErrorMsg>

  const set = (k) => (e) => { setA((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setDirty(true) }
  const setPlantilla = (k, v) => { setA((x) => ({ ...x, plantillas: { ...x.plantillas, [pl]: { ...x.plantillas[pl], [k]: v } } })); setDirty(true) }
  const esDefault = a.plantillas[pl].asunto === a.plantillas_default[pl].asunto && a.plantillas[pl].cuerpo === a.plantillas_default[pl].cuerpo

  async function guardar() {
    setGuardando(true); setError('')
    try {
      const plantillas = {}
      for (const k of Object.keys(a.plantillas)) {
        const p = a.plantillas[k], d = a.plantillas_default[k]
        plantillas[k] = p.asunto === d.asunto && p.cuerpo === d.cuerpo ? null : { asunto: p.asunto, cuerpo: p.cuerpo }
      }
      await apiPut('/ajustes', { datos_pago: a.datos_pago, firma: a.firma, link_portal: a.link_portal, admin_email: a.admin_email, resumen_diario: a.resumen_diario, resumen_hora: a.resumen_hora, plantillas })
      setDirty(false); toast('Ajustes guardados')
    } catch (e) { setError(e.message) } finally { setGuardando(false) }
  }
  async function probar() {
    setProbando(true)
    try { const r = await apiPost('/ajustes/probar-mail', { email: a.admin_email }); toast(`Resumen enviado a ${r.to}`) } catch (e) { toast(e.message, 'error') } finally { setProbando(false) }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold ad-ink tracking-tight">Ajustes</h1>
          <p className="ad-muted text-sm mt-0.5">Tu mail, los datos de pago y los mensajes que salen del panel.</p>
        </div>
        <Btn variant="primary" icon={Check} loading={guardando} disabled={!dirty} onClick={guardar}>Guardar cambios</Btn>
      </div>
      <ErrorMsg>{error}</ErrorMsg>

      <Card title="Envío de mails" extra={a.mail.configurado ? <Pill tone="green">configurado · {a.mail.remitente}</Pill> : <Pill tone="amber">no configurado</Pill>}>
        {a.mail.configurado
          ? <p className="text-[13px] ad-muted">Los mails salen desde <b className="ad-ink">{a.mail.remitente}</b> con un botón desde cada cobro o cliente. Nada se manda solo.</p>
          : (
            <div className="text-[13px] ad-muted space-y-2">
              <p className="flex items-start gap-2"><Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-300" /> Mientras no esté configurado, “Enviar mail” abre el mensaje en tu programa de correo (igual queda registrado). Para que salgan solos desde el panel, cargá estas variables en Railway:</p>
              <p className="flex flex-wrap gap-1.5"><span className="ad-code">SMTP_HOST</span><span className="ad-code">SMTP_PORT</span><span className="ad-code">SMTP_USER</span><span className="ad-code">SMTP_PASS</span><span className="ad-code">MAIL_FROM</span></p>
              <p className="text-[12px] ad-faint">Con Gmail: activá la verificación en dos pasos y creá una “contraseña de aplicación”; host <span className="ad-code">smtp.gmail.com</span>, puerto <span className="ad-code">587</span>.</p>
            </div>
          )}
      </Card>

      <Card title="Recordatorios para mí">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Mi mail" full><input type="email" value={a.admin_email} onChange={set('admin_email')} placeholder="vos@margonsoftware.com" className="ad-input" /></Field>
          <label className="flex items-center gap-2 text-[13px] ad-ink cursor-pointer sm:col-span-2">
            <input type="checkbox" checked={!!a.resumen_diario} onChange={set('resumen_diario')} /> Mandarme todos los días un resumen de lo pendiente (cobros vencidos, sin avisar, recordatorios, seguimientos)
          </label>
          <Field label="A qué hora (Argentina)"><input type="number" min="0" max="23" value={a.resumen_hora} onChange={set('resumen_hora')} className="ad-input" /></Field>
          <div className="flex items-end"><Btn icon={Send} loading={probando} disabled={!a.admin_email || !a.mail.configurado} onClick={probar} title={!a.mail.configurado ? 'Necesita el envío de mails configurado' : ''}>Enviármelo ahora</Btn></div>
        </div>
        <p className="text-[11.5px] ad-faint mt-3">Solo sale si hay algo pendiente. Además, la pantalla “Hoy” muestra lo mismo cada vez que entrás.</p>
      </Card>

      <Card title="Datos que van en los mensajes">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Datos para el pago" hint="Se pega donde la plantilla dice {datos_pago}." full><textarea rows={3} value={a.datos_pago} onChange={set('datos_pago')} className="ad-input" /></Field>
          <Field label="Firma" hint="{firma}"><textarea rows={2} value={a.firma} onChange={set('firma')} className="ad-input" /></Field>
          <Field label="Link del portal" hint="{link_portal}"><input value={a.link_portal} onChange={set('link_portal')} className="ad-input" /></Field>
        </div>
      </Card>

      <Card title="Plantillas de mensajes" extra={
        <div className="flex items-center gap-2">
          <select value={pl} onChange={(e) => setPl(e.target.value)} className="ad-input !w-auto !py-1.5 text-[13px]">
            {Object.entries(a.plantillas).map(([k, p]) => <option key={k} value={k}>{p.nombre}</option>)}
          </select>
          {!esDefault && <Btn size="sm" icon={RotateCcw} onClick={() => { setPlantilla('asunto', a.plantillas_default[pl].asunto); setPlantilla('cuerpo', a.plantillas_default[pl].cuerpo) }}>Restaurar</Btn>}
        </div>}>
        <p className="text-[12.5px] ad-muted mb-3">{a.plantillas[pl].descripcion} El mismo texto se usa para WhatsApp y para mail; el asunto solo va en el mail.</p>
        <div className="space-y-3">
          <Field label="Asunto (mail)"><input value={a.plantillas[pl].asunto} onChange={(e) => setPlantilla('asunto', e.target.value)} className="ad-input" /></Field>
          <Field label="Mensaje"><textarea rows={12} value={a.plantillas[pl].cuerpo} onChange={(e) => setPlantilla('cuerpo', e.target.value)} className="ad-input ad-textarea" /></Field>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {a.variables.map(([v, d]) => <span key={v} className="ad-code" title={d}>{v}</span>)}
        </div>
        <p className="text-[11.5px] ad-faint mt-2">Pasá el mouse sobre cada variable para ver qué reemplaza. Se rellenan al armar cada mensaje y siempre podés retocar el texto antes de mandarlo.</p>
      </Card>

      <div className="flex justify-end"><Btn variant="primary" icon={Check} loading={guardando} disabled={!dirty} onClick={guardar}>Guardar cambios</Btn></div>
    </div>
  )
}
