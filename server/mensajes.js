// Plantillas de mensajes (WhatsApp y mail) y armado del texto final.
// Nada se manda solo: el panel muestra el mensaje armado y Gonzalo lo envía
// con un botón. Acá solo se rellenan las variables.
import { fmtMoney, periodoLargo, fmtFecha } from './formato.js'

export const PLANTILLAS_DEFAULT = {
  aviso: {
    nombre: 'Aviso de cobro',
    descripcion: 'Cuando se emite el abono del mes.',
    asunto: 'Margon · Abono de {periodo}',
    cuerpo: `Hola {nombre}! ¿Cómo estás?

Te paso el detalle del abono de {periodo}:

• Concepto: {concepto}
• Importe: {monto}
• Vencimiento: {vencimiento}

Datos para el pago:
{datos_pago}

Cuando lo hagas avisame así te mando el comprobante. ¡Gracias!

{firma}`,
  },
  recordatorio: {
    nombre: 'Recordatorio de pago',
    descripcion: 'Para un cobro vencido o por vencer.',
    asunto: 'Margon · Recordatorio de pago · {periodo}',
    cuerpo: `Hola {nombre}! Te escribo para recordarte que el abono de {periodo} ({concepto}) sigue pendiente.

• Saldo: {saldo}
• Vencimiento: {vencimiento}

Datos para el pago:
{datos_pago}

Si ya lo hiciste, ignorá este mensaje y mandame el comprobante. ¡Gracias!

{firma}`,
  },
  comprobante: {
    nombre: 'Comprobante de pago',
    descripcion: 'Después de registrar un pago. Por mail va el PDF adjunto.',
    asunto: 'Margon · Comprobante de pago · {periodo}',
    cuerpo: `Hola {nombre}! Recibimos tu pago de {pagado} correspondiente a {periodo} ({concepto}). ¡Muchas gracias!

Te adjunto el comprobante.

{firma}`,
  },
  portal: {
    nombre: 'Acceso al portal',
    descripcion: 'Invitación para que el cliente cree su contraseña.',
    asunto: 'Margon · Tu acceso al portal de clientes',
    cuerpo: `Hola {nombre}! Te creamos un acceso al portal de clientes de Margon: ahí vas a ver tus pagos, proyectos, archivos y presupuestos.

Entrá con este link y creá tu contraseña (vale 14 días):
{link}

Cualquier duda me escribís. ¡Saludos!

{firma}`,
  },
  presupuesto: {
    nombre: 'Presupuesto enviado',
    descripcion: 'Cuando se sube un presupuesto al portal.',
    asunto: 'Margon · Presupuesto: {titulo}',
    cuerpo: `Hola {nombre}! Te subimos al portal el presupuesto "{titulo}".

Podés revisarlo, elegir los opcionales y aprobarlo desde acá:
{link_portal}

Cualquier consulta, a disposición. ¡Saludos!

{firma}`,
  },
  libre: {
    nombre: 'Mensaje libre',
    descripcion: 'Un mensaje cualquiera al cliente.',
    asunto: 'Margon',
    cuerpo: `Hola {nombre}!

{firma}`,
  },
}

export const VARIABLES = [
  ['{nombre}', 'Nombre del cliente'],
  ['{proyecto}', 'Proyecto / referencia del cliente'],
  ['{periodo}', 'Período del cobro, ej. "septiembre 2026"'],
  ['{concepto}', 'Concepto del cobro'],
  ['{monto}', 'Importe total del cobro'],
  ['{pagado}', 'Lo pagado hasta ahora'],
  ['{saldo}', 'Lo que falta pagar'],
  ['{vencimiento}', 'Fecha de vencimiento'],
  ['{datos_pago}', 'Datos para transferir (Ajustes)'],
  ['{link_portal}', 'Link al portal de clientes'],
  ['{link}', 'Link de invitación al portal'],
  ['{titulo}', 'Título del presupuesto'],
  ['{firma}', 'Firma (Ajustes)'],
]

// Plantillas efectivas: las por defecto pisadas por lo guardado en Ajustes.
export function plantillasEfectivas(ajustes) {
  const out = {}
  for (const [k, def] of Object.entries(PLANTILLAS_DEFAULT)) {
    const custom = ajustes?.plantillas?.[k] || {}
    out[k] = { ...def, asunto: custom.asunto ?? def.asunto, cuerpo: custom.cuerpo ?? def.cuerpo }
  }
  return out
}

export function render(texto, vars) {
  return String(texto || '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k] ?? '') : m))
}

export function conceptoDefault(cobro, cliente) {
  if (cobro?.concepto?.trim()) return cobro.concepto.trim()
  const proy = cliente?.proyecto ? ` — ${cliente.proyecto}` : ''
  if (cobro?.tipo === 'setup') return `Setup inicial / puesta en marcha${proy}`
  if (cobro?.tipo === 'unico') return `Servicio de desarrollo de software${proy}`
  return `Servicios de desarrollo y mantenimiento de software${proy}`
}

// Variables a partir de cliente, cobro (opcional) y extras.
export function variablesDe({ cliente, cobro, ajustes, extra = {} }) {
  const nombre = (cliente?.nombre || '').trim()
  const v = {
    nombre,
    nombre_completo: cliente?.nombre || '',
    proyecto: cliente?.proyecto || '',
    datos_pago: ajustes?.datos_pago || '',
    firma: ajustes?.firma || '',
    link_portal: ajustes?.link_portal || '',
    link: '',
    titulo: '',
    periodo: '', concepto: '', monto: '', pagado: '', saldo: '', vencimiento: '',
  }
  if (cobro) {
    const monto = Number(cobro.monto) || 0
    const pagado = Number(cobro.pagado) || 0
    v.periodo = periodoLargo(cobro.periodo)
    v.concepto = conceptoDefault(cobro, cliente)
    v.monto = fmtMoney(monto, cobro.moneda)
    v.pagado = fmtMoney(pagado, cobro.moneda)
    v.saldo = fmtMoney(Math.max(monto - pagado, 0), cobro.moneda)
    v.vencimiento = cobro.vencimiento ? fmtFecha(cobro.vencimiento) : 'a convenir'
  }
  return { ...v, ...extra }
}

// Arma asunto + cuerpo listos para mostrar en el panel.
export function componer({ tipo, cliente, cobro, ajustes, extra }) {
  const todas = plantillasEfectivas(ajustes)
  const pl = todas[tipo] || todas.libre
  const vars = variablesDe({ cliente, cobro, ajustes, extra })
  return { asunto: render(pl.asunto, vars), cuerpo: render(pl.cuerpo, vars) }
}
