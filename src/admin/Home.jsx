import { useEffect, useState } from 'react'
import { Loader2, Wallet, TrendingUp, Users, Target, ArrowRight, CheckCircle2 } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, fmtFecha, diasHasta, estadoPago, saldoCobro } from './format'
import { useNav } from './nav'

const EST_PILL = { vencido: 'ad-pill-red', parcial: 'ad-pill-blue', pendiente: 'ad-pill-amber', pagado: 'ad-pill-green' }
const EST_LBL = { vencido: 'Vencido', parcial: 'Parcial', pendiente: 'Pendiente', pagado: 'Pagado' }

function porMoneda(rows, campo) {
  const acc = {}
  for (const r of rows || []) acc[r.moneda] = (acc[r.moneda] || 0) + Number(r[campo] || 0)
  return acc
}
function MoneyMulti({ map }) {
  const e = Object.entries(map).filter(([, v]) => v)
  if (!e.length) return <>—</>
  return <>{e.map(([m, v], i) => <span key={m}>{i > 0 && <span className="ad-faint mx-1">·</span>}{fmtMoney(v, m)}</span>)}</>
}

export default function Home() {
  const [d, setD] = useState(null)
  const [pend, setPend] = useState([])
  const [opps, setOpps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { verCliente, irA } = useNav()

  useEffect(() => {
    Promise.all([apiFetch('/dashboard'), apiFetch('/pendientes'), apiFetch('/oportunidades')])
      .then(([dd, pp, oo]) => { setD(dd); setPend(pp); setOpps(oo) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center gap-2 ad-muted text-sm py-20 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</div>
  if (error) return <p className="text-sm text-red-400">{error}</p>

  const porCobrar = porMoneda(pend.map((c) => ({ moneda: c.moneda, s: saldoCobro(c) })), 's')
  const cobrado = porMoneda(d.mes, 'cobrado')
  const oppsAbiertas = opps.filter((o) => !['ganado', 'perdido'].includes(o.etapa))
  const pipeline = porMoneda(oppsAbiertas, 'valor')

  // Tareas: seguimientos + próximos pasos de oportunidades
  const tareas = [
    ...(d.pendientes || []).map((s) => ({ id: `s${s.id}`, txt: s.proxima_accion || s.titulo, ref: s.cliente_nombre, fecha: s.proxima_fecha })),
    ...oppsAbiertas.filter((o) => o.proxima_accion && o.proxima_fecha).map((o) => ({ id: `o${o.id}`, txt: o.proxima_accion, ref: `${o.nombre} · oportunidad`, fecha: o.proxima_fecha })),
  ].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))).slice(0, 6)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold ad-ink tracking-tight">Inicio</h1>
        <p className="ad-muted text-sm mt-0.5">Lo que necesitás atender · período {d.periodo}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={Wallet} label="Por cobrar" tone="amber"><MoneyMulti map={porCobrar} /></Kpi>
        <Kpi icon={TrendingUp} label="Cobrado este mes" tone="green"><MoneyMulti map={cobrado} /></Kpi>
        <Kpi icon={Users} label="Clientes activos">{d.clientes.activos}<span className="text-base ad-faint font-normal"> / {d.clientes.total}</span></Kpi>
        <Kpi icon={Target} label="Pipeline"><MoneyMulti map={pipeline} /></Kpi>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Para cobrar */}
        <div className="ad-card">
          <div className="flex items-center justify-between px-4 py-3 border-b ad-line">
            <b className="text-sm ad-ink">Para cobrar</b>
            <button onClick={() => irA('cobros')} className="text-xs text-primary-300 font-semibold flex items-center gap-1 hover:gap-1.5 transition-all">Ver todo <ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          {pend.length === 0
            ? <p className="text-sm ad-muted text-center py-8">🎉 No hay nada pendiente de cobro.</p>
            : pend.slice(0, 5).map((c) => {
              const est = estadoPago(c)
              return (
                <button key={c.id} onClick={() => verCliente(c.cliente_id)} className="w-full flex items-center gap-3 px-4 py-3 border-b ad-line last:border-0 ad-hover text-left transition">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/15 text-primary-300 grid place-items-center text-xs font-bold shrink-0">{c.cliente_nombre.slice(0, 2).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold ad-ink truncate">{c.cliente_nombre}</p>
                    <p className="text-xs ad-muted truncate">{c.concepto || c.periodo}</p>
                  </div>
                  <span className={`ad-pill ${EST_PILL[est]}`}>{EST_LBL[est]}</span>
                  <span className="text-[13.5px] font-bold ad-ink tabular-nums shrink-0">{fmtMoney(saldoCobro(c), c.moneda)}</span>
                </button>
              )
            })}
        </div>

        {/* Tareas */}
        <div className="ad-card">
          <div className="flex items-center justify-between px-4 py-3 border-b ad-line">
            <b className="text-sm ad-ink">Tareas y seguimiento</b>
            <button onClick={() => irA('oportunidades')} className="text-xs text-primary-300 font-semibold flex items-center gap-1 hover:gap-1.5 transition-all">Oportunidades <ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          {tareas.length === 0
            ? <p className="text-sm ad-muted text-center py-8 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary-400" /> Todo al día.</p>
            : tareas.map((t) => {
              const dd = diasHasta(t.fecha)
              const atras = dd != null && dd < 0
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3 border-b ad-line last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium ad-ink truncate">{t.txt}</p>
                    <p className="text-xs ad-muted truncate">{t.ref}</p>
                  </div>
                  <span className={`text-xs shrink-0 ${atras ? 'text-red-400 font-semibold' : 'ad-muted'}`}>{atras ? `hace ${-dd}d` : fmtFecha(t.fecha)}</span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, label, tone, children }) {
  const val = tone === 'amber' ? 'text-amber-300' : tone === 'green' ? 'text-primary-300' : 'ad-ink'
  return (
    <div className="ad-card p-4">
      <div className="flex items-center gap-1.5 ad-muted text-xs"><Icon className="w-4 h-4" /> {label}</div>
      <p className={`text-[22px] font-extrabold mt-2 tabular-nums tracking-tight ${val}`}>{children}</p>
    </div>
  )
}
