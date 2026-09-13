// Comprobante de pago en PDF (pdfkit). Se descarga desde el panel o el portal
// y se adjunta al mail de "comprobante de pago".
import PDFDocument from 'pdfkit'
import { fmtMoney, periodoLargo, fmtFecha } from './formato.js'
import { conceptoDefault } from './mensajes.js'

const INK = '#18211c', MUTED = '#6b7570', LINE = '#d9ded9'
const GREEN = '#047857', AMBER = '#b45309', BLUE = '#0369a1'

export const nroComprobante = (c) => `${c.periodo}-${String(c.id).padStart(4, '0')}`

const capitalizar = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)

// Devuelve un Buffer con el PDF.
export function comprobantePdf({ cobro, cliente, concepto, emitido }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4', margin: 54,
      info: { Title: `Comprobante ${nroComprobante(cobro)}`, Author: 'Margon Software' },
    })
    const chunks = []
    doc.on('data', (c) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const monto = Number(cobro.monto) || 0
    const pagado = Number(cobro.pagado) || 0
    const saldo = Math.max(monto - pagado, 0)
    const estaPagado = monto > 0 && pagado >= monto
    const parcial = !estaPagado && pagado > 0
    const texto = concepto || conceptoDefault(cobro, cliente)
    const L = doc.page.margins.left
    const R = doc.page.width - doc.page.margins.right
    const W = R - L

    // Encabezado
    doc.font('Helvetica-Bold').fontSize(26).fillColor(INK).text('MARGON', L, 54)
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GREEN).text('SOFTWARE HOUSE', L, 84, { characterSpacing: 3 })
    doc.font('Helvetica-Bold').fontSize(14).fillColor(INK).text('COMPROBANTE DE PAGO', L, 54, { width: W, align: 'right' })
    doc.font('Helvetica').fontSize(10).fillColor(MUTED)
      .text(`N° ${nroComprobante(cobro)}`, L, 76, { width: W, align: 'right' })
      .text(`Emitido: ${fmtFecha(emitido || new Date())}`, L, 90, { width: W, align: 'right' })
    doc.moveTo(L, 112).lineTo(R, 112).lineWidth(1.5).strokeColor(INK).stroke()

    // Cliente / período
    let y = 132
    doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED).text('CLIENTE', L, y, { characterSpacing: 1 })
    doc.font('Helvetica-Bold').fontSize(12).fillColor(INK).text(cliente?.nombre || '', L, y + 14)
    if (cliente?.email) doc.font('Helvetica').fontSize(10).fillColor(MUTED).text(cliente.email, L, y + 31)
    doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED).text('PERÍODO', L, y, { width: W, align: 'right', characterSpacing: 1 })
    doc.font('Helvetica-Bold').fontSize(12).fillColor(INK).text(capitalizar(periodoLargo(cobro.periodo)), L, y + 14, { width: W, align: 'right' })

    // Tabla
    y = 200
    doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED)
      .text('DETALLE', L, y, { characterSpacing: 1 })
      .text('IMPORTE', L, y, { width: W, align: 'right', characterSpacing: 1 })
    doc.moveTo(L, y + 16).lineTo(R, y + 16).lineWidth(0.8).strokeColor(LINE).stroke()
    y += 28
    doc.font('Helvetica').fontSize(11).fillColor(INK).text(texto, L, y, { width: W - 140 })
    const hConcepto = doc.heightOfString(texto, { width: W - 140 })
    doc.font('Helvetica-Bold').fontSize(11).text(fmtMoney(monto, cobro.moneda), L, y, { width: W, align: 'right' })
    y += Math.max(hConcepto, 14) + 14
    doc.moveTo(L, y).lineTo(R, y).lineWidth(0.8).strokeColor(LINE).stroke()

    // Totales
    y += 16
    const tx = R - 230
    doc.moveTo(tx, y).lineTo(R, y).lineWidth(1.5).strokeColor(INK).stroke()
    y += 10
    doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text('TOTAL', tx, y + 4)
    doc.font('Helvetica-Bold').fontSize(16).text(fmtMoney(monto, cobro.moneda), tx, y, { width: 230, align: 'right' })
    y += 28
    if (pagado > 0) {
      doc.font('Helvetica').fontSize(10).fillColor(GREEN).text('Pagado', tx, y)
      doc.font('Helvetica-Bold').text(fmtMoney(pagado, cobro.moneda), tx, y, { width: 230, align: 'right' })
      y += 16
      if (saldo > 0) {
        doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text('Saldo pendiente', tx, y)
        doc.text(fmtMoney(saldo, cobro.moneda), tx, y, { width: 230, align: 'right' })
        y += 16
      }
    }

    // Estado
    y += 14
    const estado = estaPagado
      ? { txt: `PAGADO${cobro.fecha_pago ? `  ·  ${fmtFecha(cobro.fecha_pago)}` : ''}`, color: GREEN, bg: '#ecfdf5' }
      : parcial
        ? { txt: `PAGO PARCIAL  ·  pagado ${fmtMoney(pagado, cobro.moneda)}  ·  saldo ${fmtMoney(saldo, cobro.moneda)}`, color: BLUE, bg: '#f0f9ff' }
        : { txt: 'PENDIENTE DE PAGO', color: AMBER, bg: '#fffbeb' }
    doc.font('Helvetica-Bold').fontSize(9.5)
    const ew = doc.widthOfString(estado.txt) + 24
    doc.roundedRect(L, y, ew, 24, 5).fillColor(estado.bg).fill()
    doc.fillColor(estado.color).text(estado.txt, L + 12, y + 7)

    // Aclaración
    y += 54
    doc.roundedRect(L, y, W, 58, 6).fillColor('#f6f7f6').fill()
    doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(
      'Importante: este documento es un comprobante interno de pago de servicios emitido por Margon. ' +
      'No constituye una factura ni un comprobante fiscal de AFIP y no tiene validez tributaria. ' +
      'Se entrega únicamente como constancia del pago del servicio contratado.',
      L + 12, y + 11, { width: W - 24, lineGap: 2 }
    )

    // Pie
    const fy = doc.page.height - doc.page.margins.bottom - 20
    doc.moveTo(L, fy - 10).lineTo(R, fy - 10).lineWidth(0.8).strokeColor(LINE).stroke()
    doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
      .text('Margon · Software House', L, fy)
      .text('margonsoftware.com', L, fy, { width: W, align: 'right' })

    doc.end()
  })
}
