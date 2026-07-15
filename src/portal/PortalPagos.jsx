import { useState, useEffect } from 'react'
import { portalGet } from './portalApi'
import { fmtMoney, fmtFecha, estadoPago, saldoCobro } from '../admin/format'

const PILL = {
  pagado:    'ad-pill ad-pill-green',
  parcial:   'ad-pill ad-pill-blue',
  pendiente: 'ad-pill ad-pill-amber',
  vencido:   'ad-pill ad-pill-red',
}
const LABEL = { pagado: 'Pagado', parcial: 'Parcial', pendiente: 'Pendiente', vencido: 'Vencido' }

export default function PortalPagos() {
  const [pagos, setPagos] = useState(null)

  useEffect(() => { portalGet('/pagos').then(setPagos).catch(() => setPagos([])) }, [])

  if (!pagos) return <p className="ad-muted">Cargando…</p>
  if (pagos.length === 0) return <Empty />

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold ad-ink">Tus pagos</h1>
      <div className="ad-card overflow-hidden">
        <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-white/5 px-5 py-3 sm:grid">
          {['Período / concepto', 'Monto', 'Estado', 'Saldo'].map((h) => (
            <span key={h} className="ad-faint text-[11px] font-mono uppercase tracking-wider">{h}</span>
          ))}
        </div>
        <div className="divide-y divide-white/5">
          {pagos.map((c) => {
            const est = estadoPago(c)
            const saldo = saldoCobro(c)
            return (
              <div key={c.id} className="grid grid-cols-2 items-center gap-3 px-5 py-3.5 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm ad-ink">{c.concepto || c.periodo}</p>
                  <p className="ad-faint text-[12px]">
                    {c.periodo}{c.fecha_pago ? ` · pagado ${fmtFecha(c.fecha_pago)}` : c.vencimiento ? ` · vence ${fmtFecha(c.vencimiento)}` : ''}
                  </p>
                </div>
                <span className="ad-ink tabular-nums text-sm font-medium">{fmtMoney(c.monto, c.moneda)}</span>
                <span className={PILL[est]}>{LABEL[est]}</span>
                <span className="tabular-nums text-sm text-right ad-muted">{saldo > 0 ? fmtMoney(saldo, c.moneda) : '—'}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="ad-card p-10 text-center">
      <p className="ad-ink font-semibold">Todavía no hay pagos cargados</p>
      <p className="ad-muted text-[13px] mt-1">Acá vas a ver tus cobros y su estado.</p>
    </div>
  )
}
