import { FileText, ArrowRight } from 'lucide-react'
import { fmtMoney, fmtFecha, diasHasta } from '../admin/format'

export default function PortalHome({ me, onGo }) {
  if (!me) return <p className="ad-muted">Cargando…</p>
  const saldos = (me.saldo || []).filter((s) => Number(s.saldo) > 0)

  return (
    <div className="space-y-6">
      <div>
        <p className="ad-faint text-[12px] font-mono uppercase tracking-wider">Tu resumen</p>
        <h1 className="mt-1 text-2xl font-bold ad-ink">Hola, {me.cliente?.nombre?.split(' ')[0] || me.cliente?.nombre}</h1>
      </div>

      {/* Aviso de presupuestos por aprobar */}
      {me.presupuestos_pendientes > 0 && (
        <button onClick={() => onGo('presupuestos')}
          className="ad-card flex w-full items-center gap-4 p-5 text-left transition hover:border-[#10b981]/40">
          <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: 'rgba(16,185,129,.15)' }}>
            <FileText className="h-5 w-5 text-[#34d399]" />
          </span>
          <div className="flex-1">
            <p className="font-semibold ad-ink">
              Tenés {me.presupuestos_pendientes} presupuesto{me.presupuestos_pendientes > 1 ? 's' : ''} para revisar
            </p>
            <p className="ad-muted text-[13px]">Elegí qué incluir y firmalo cuando estés listo.</p>
          </div>
          <ArrowRight className="h-5 w-5 ad-muted" />
        </button>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="ad-card p-5">
          <p className="ad-faint text-[11px] font-mono uppercase tracking-wider">Saldo pendiente</p>
          {saldos.length === 0
            ? <p className="mt-2 text-xl font-bold text-[#6ee7b7]">Al día ✓</p>
            : saldos.map((s) => (
                <p key={s.moneda} className="mt-2 text-xl font-bold ad-ink tabular-nums">{fmtMoney(s.saldo, s.moneda)}</p>
              ))}
        </div>
        <div className="ad-card p-5">
          <p className="ad-faint text-[11px] font-mono uppercase tracking-wider">Proyectos activos</p>
          <p className="mt-2 text-2xl font-bold ad-ink">{me.proyectos_activos}</p>
        </div>
        <div className="ad-card p-5">
          <p className="ad-faint text-[11px] font-mono uppercase tracking-wider">Presupuestos por aprobar</p>
          <p className="mt-2 text-2xl font-bold ad-ink">{me.presupuestos_pendientes}</p>
        </div>
      </div>

      {/* Próximos vencimientos */}
      {me.proximos?.length > 0 && (
        <div className="ad-card p-5">
          <h2 className="mb-3 font-semibold ad-ink">Próximos vencimientos</h2>
          <div className="divide-y divide-white/5">
            {me.proximos.map((c, i) => {
              const d = diasHasta(c.vencimiento)
              return (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm ad-ink">{c.periodo}</p>
                    <p className="ad-faint text-[12px]">
                      Vence {fmtFecha(c.vencimiento)}{d != null && ` · ${d < 0 ? `hace ${-d} días` : d === 0 ? 'hoy' : `en ${d} días`}`}
                    </p>
                  </div>
                  <span className="font-semibold ad-ink tabular-nums">{fmtMoney(c.monto, c.moneda)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
