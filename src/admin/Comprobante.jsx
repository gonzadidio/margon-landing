import { useState } from 'react'
import { Printer, X } from 'lucide-react'
import { fmtMoney, estadoPago, saldoCobro } from './format'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// "2026-06" -> "Junio 2026"
function periodoLargo(periodo) {
  const [y, m] = (periodo || '').split('-')
  const mes = MESES[Number(m) - 1]
  return mes ? `${mes} ${y}` : periodo
}

// Acepta Date, ISO o "YYYY-MM-DD" y devuelve "DD/MM/YYYY"
function fmtFecha(v) {
  if (!v) return ''
  const s = String(v).slice(0, 10) // "YYYY-MM-DD"
  const [y, m, d] = s.split('-')
  return d ? `${d}/${m}/${y}` : s
}

// N° de comprobante a partir del período y el id del cobro
const nroComprobante = (c) => `${c.periodo}-${String(c.id).padStart(4, '0')}`

// Concepto por defecto según el tipo de cobro (se puede editar antes de imprimir).
function conceptoDefault(cobro) {
  if (cobro.concepto?.trim()) return cobro.concepto.trim()
  if (cobro.notas?.trim()) return cobro.notas.trim()
  const proy = cobro.cliente_proyecto ? ` — ${cobro.cliente_proyecto}` : ''
  if (cobro.tipo === 'setup') return `Setup inicial / puesta en marcha${proy}`
  if (cobro.tipo === 'unico') return `Servicio de desarrollo de software${proy}`
  return `Servicios de desarrollo y mantenimiento de software${proy}`
}

export default function Comprobante({ cobro, hoy, onClose }) {
  // El usuario puede ajustar el concepto antes de imprimir
  const [concepto, setConcepto] = useState(() => conceptoDefault(cobro))

  const montoPagado = Number(cobro.pagado) || 0
  const saldo = saldoCobro(cobro)
  const est = estadoPago(cobro)   // pagado | parcial | pendiente | vencido
  const parcial = est === 'parcial' || (montoPagado > 0 && saldo > 0)
  const pagado = est === 'pagado'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm overflow-auto">
      {/* Barra de acciones (no se imprime) */}
      <div className="no-print sticky top-0 flex items-center justify-between gap-3 px-4 py-3 bg-surface-900/90 border-b border-primary-500/15">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm text-surface-200/60 hidden sm:inline">Concepto:</span>
          <input
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className="flex-1 min-w-0 rounded-lg bg-surface-900/60 border border-primary-500/15 px-3 py-1.5 text-sm text-white outline-none focus:border-primary-400/50"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-[#0a0f0d] font-semibold text-sm px-3.5 py-2 transition"
          >
            <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-800 text-surface-200/70">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hoja del comprobante */}
      <div className="flex-1 flex justify-center p-4 sm:p-8">
        <div
          id="comprobante-print"
          className="bg-white text-zinc-800 w-full max-w-[800px] h-fit rounded-lg shadow-2xl p-10 sm:p-12"
        >
          {/* Encabezado */}
          <div className="flex items-start justify-between border-b-2 border-zinc-800 pb-5">
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-zinc-900 leading-none">
                MARGON
              </div>
              <div className="text-[11px] font-semibold tracking-[0.25em] text-emerald-700 mt-1">
                SOFTWARE HOUSE
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-zinc-900">COMPROBANTE DE PAGO</div>
              <div className="text-sm text-zinc-500 mt-0.5">N° {nroComprobante(cobro)}</div>
              <div className="text-sm text-zinc-500">Emitido: {fmtFecha(hoy)}</div>
            </div>
          </div>

          {/* Cliente y período */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Cliente</div>
              <div className="text-base font-semibold text-zinc-900 mt-1">{cobro.cliente_nombre}</div>
              {cobro.cliente_email && <div className="text-sm text-zinc-500">{cobro.cliente_email}</div>}
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Período</div>
              <div className="text-base font-semibold text-zinc-900 mt-1">{periodoLargo(cobro.periodo)}</div>
            </div>
          </div>

          {/* Detalle */}
          <table className="w-full mt-8 text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400">
                <th className="text-left font-semibold uppercase text-[11px] tracking-wide py-2">Detalle</th>
                <th className="text-right font-semibold uppercase text-[11px] tracking-wide py-2">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-100">
                <td className="py-4 pr-4 text-zinc-700">{concepto}</td>
                <td className="py-4 text-right font-medium text-zinc-900 tabular-nums whitespace-nowrap">
                  {fmtMoney(cobro.monto, cobro.moneda)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total y detalle de pago */}
          <div className="flex justify-end mt-4">
            <div className="w-72 space-y-1.5">
              <div className="flex items-center justify-between border-t-2 border-zinc-800 pt-3">
                <span className="font-bold text-zinc-900">TOTAL</span>
                <span className="text-xl font-extrabold text-zinc-900 tabular-nums">{fmtMoney(cobro.monto, cobro.moneda)}</span>
              </div>
              {(parcial || montoPagado > 0) && (
                <>
                  <div className="flex items-center justify-between text-sm text-emerald-700">
                    <span>Pagado</span>
                    <span className="tabular-nums font-semibold">{fmtMoney(montoPagado, cobro.moneda)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-zinc-700">
                    <span className="font-semibold">Saldo pendiente</span>
                    <span className="tabular-nums font-bold">{fmtMoney(saldo, cobro.moneda)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Estado del pago */}
          <div className="mt-6">
            {pagado ? (
              <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-3 py-1.5">
                ✓ PAGADO{cobro.fecha_pago ? ` el ${fmtFecha(cobro.fecha_pago)}` : ''}
              </span>
            ) : parcial ? (
              <span className="inline-flex items-center gap-2 rounded-md bg-sky-50 border border-sky-200 text-sky-700 text-sm font-semibold px-3 py-1.5">
                PAGO PARCIAL — Pagado {fmtMoney(montoPagado, cobro.moneda)} · Saldo {fmtMoney(saldo, cobro.moneda)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold px-3 py-1.5">
                PENDIENTE DE PAGO
              </span>
            )}
          </div>

          {/* Aclaración legal */}
          <div className="mt-10 rounded-md bg-zinc-50 border border-zinc-200 px-4 py-3 text-[12px] leading-relaxed text-zinc-500">
            <strong className="text-zinc-600">Importante:</strong> Este documento es un comprobante interno
            de pago de servicios emitido por Margon. <strong>No constituye una factura ni un comprobante
            fiscal de AFIP</strong> y no tiene validez tributaria. Se entrega únicamente como constancia
            del abono mensual del servicio contratado.
          </div>

          {/* Pie */}
          <div className="mt-8 pt-5 border-t border-zinc-200 flex items-center justify-between text-[12px] text-zinc-400">
            <span>Margon · Software House</span>
            <span>margonsoftware.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}
