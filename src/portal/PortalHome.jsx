import { FileText, ArrowRight, Wallet, FolderKanban, CalendarClock } from 'lucide-react'
import { fmtMoney, fmtFecha, diasHasta } from '../admin/format'

export default function PortalHome({ me, onGo }) {
  if (!me) return <p className="ad-muted">Cargando…</p>
  const saldos = (me.saldo || []).filter((s) => Number(s.saldo) > 0)

  return (
    <div className="space-y-6">
      <div>
        <p className="ad-faint text-[12px] font-mono uppercase tracking-wider">Tu resumen</p>
        <h1 className="mt-1 text-2xl font-bold ad-ink">Hola, {me.cliente?.nombre?.split(' ')[0] || me.cliente?.nombre} 👋</h1>
      </div>

      {/* Aviso de presupuestos por aprobar */}
      {me.presupuestos_pendientes > 0 && (
        <button onClick={() => onGo('presupuestos')}
          className="group flex w-full items-center gap-4 rounded-2xl border border-[#10b981]/25 p-5 text-left transition hover:border-[#10b981]/50"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,.10), rgba(16,185,129,.02))' }}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(16,185,129,.18)' }}>
            <FileText className="h-5 w-5 text-[#34d399]" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold ad-ink">
              Tenés {me.presupuestos_pendientes} presupuesto{me.presupuestos_pendientes > 1 ? 's' : ''} para revisar
            </p>
            <p className="ad-muted text-[13px]">Elegí qué incluir y firmalo cuando estés listo.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-[#34d399] shrink-0 transition group-hover:translate-x-0.5" />
        </button>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi icon={Wallet} label="Saldo pendiente" tone={saldos.length ? 'amber' : 'green'}>
          {saldos.length === 0
            ? <span className="text-[#6ee7b7]">Al día ✓</span>
            : saldos.map((s, i) => <span key={s.moneda}>{i > 0 && <span className="ad-faint"> · </span>}{fmtMoney(s.saldo, s.moneda)}</span>)}
        </Kpi>
        <Kpi icon={FolderKanban} label="Proyectos activos">{me.proyectos_activos}</Kpi>
        <Kpi icon={FileText} label="Por aprobar" tone={me.presupuestos_pendientes ? 'amber' : ''}>{me.presupuestos_pendientes}</Kpi>
      </div>

      {/* Próximos vencimientos */}
      {me.proximos?.length > 0 && (
        <div className="ad-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold ad-ink"><CalendarClock className="h-4 w-4 ad-muted" /> Próximos vencimientos</h2>
          <div className="divide-y divide-white/5">
            {me.proximos.map((c, i) => {
              const d = diasHasta(c.vencimiento)
              const atras = d != null && d < 0
              return (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm ad-ink">{c.periodo}</p>
                    <p className={`text-[12px] ${atras ? 'text-amber-300' : 'ad-faint'}`}>
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

function Kpi({ icon: Icon, label, tone, children }) {
  const val = tone === 'amber' ? 'text-amber-300' : tone === 'green' ? 'text-[#6ee7b7]' : 'ad-ink'
  return (
    <div className="ad-card p-5">
      <div className="flex items-center gap-1.5 ad-faint text-[11px] font-mono uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className={`mt-2 text-2xl font-extrabold tabular-nums leading-tight ${val}`}>{children}</p>
    </div>
  )
}
