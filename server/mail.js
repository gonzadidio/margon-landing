// Envío de mails por SMTP (nodemailer). Si no hay credenciales configuradas,
// el panel avisa y ofrece abrir el mensaje en el correo del usuario (mailto).
//
// Variables de entorno (Railway):
//   SMTP_HOST   ej: smtp.gmail.com
//   SMTP_PORT   587 (STARTTLS) o 465 (SSL)
//   SMTP_USER   la cuenta que envía
//   SMTP_PASS   contraseña o "app password" (en Gmail: 2FA + contraseña de aplicación)
//   MAIL_FROM   opcional, ej: "Margon Software <hola@margonsoftware.com>"
import nodemailer from 'nodemailer'

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env

export const mailConfigurado = () => Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS)
export const mailRemitente = () => MAIL_FROM || (SMTP_USER ? `Margon Software <${SMTP_USER}>` : '')

let transport = null
function getTransport() {
  if (!transport) {
    const port = Number(SMTP_PORT || 587)
    transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }
  return transport
}

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Texto plano -> HTML simple y prolijo (links clickeables, saltos de línea).
export function textoAHtml(texto) {
  const conLinks = escapeHtml(texto).replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" style="color:#059669">$1</a>'
  )
  return `<!doctype html><html><body style="margin:0;background:#f4f5f4;padding:24px 12px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px 30px;font:15px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2924;white-space:pre-wrap">${conLinks}</div>
  <p style="max-width:560px;margin:14px auto 0;text-align:center;font:12px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#8a958e">Margon Software · margonsoftware.com</p>
  </body></html>`
}

export async function enviarMail({ to, subject, text, attachments = [] }) {
  if (!mailConfigurado()) {
    const e = new Error('El envío de mails no está configurado (faltan SMTP_HOST, SMTP_USER y SMTP_PASS).')
    e.status = 409
    throw e
  }
  if (!to) { const e = new Error('El cliente no tiene email cargado.'); e.status = 400; throw e }
  return getTransport().sendMail({
    from: mailRemitente(),
    to,
    subject,
    text,
    html: textoAHtml(text),
    attachments,
  })
}
