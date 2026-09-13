// Resumen diario por mail para Gonzalo: lo que hay que cobrar, avisar y
// recordar. Sale una vez por día a la hora configurada en Ajustes, solo si
// hay mail configurado y un admin_email cargado.
import { getAjustes, setAjustes } from './ajustes.js'
import { mailConfigurado, enviarMail } from './mail.js'
import { resumenHoy, resumenTexto, hayPendientes } from './hoy.js'
import { hoyAR, horaAR, fmtFecha } from './formato.js'

async function tick() {
  try {
    if (!mailConfigurado()) return
    const a = await getAjustes()
    if (!a.resumen_diario || !a.admin_email) return
    const hoy = hoyAR()
    if (a.resumen_ultimo === hoy) return
    if (horaAR() < Number(a.resumen_hora ?? 9)) return

    const r = await resumenHoy()
    // Marcamos antes de enviar para no repetir si el envío tarda.
    await setAjustes({ resumen_ultimo: hoy })
    if (!hayPendientes(r)) return
    await enviarMail({
      to: a.admin_email,
      subject: `Margon · Pendientes de hoy ${fmtFecha(hoy)}`,
      text: resumenTexto(r),
    })
    console.log('[digest] resumen diario enviado a', a.admin_email)
  } catch (e) {
    console.error('[digest] error:', e.message)
  }
}

export function iniciarResumenDiario() {
  setTimeout(tick, 15 * 1000)
  setInterval(tick, 10 * 60 * 1000)
}

// Para el botón "Enviármelo ahora" de Ajustes.
export async function enviarResumenAhora(to) {
  const r = await resumenHoy()
  await enviarMail({ to, subject: `Margon · Pendientes de hoy ${fmtFecha(r.hoy)}`, text: resumenTexto(r) })
  return r
}
