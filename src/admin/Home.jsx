import { useEffect, useState } from 'react'
import {
  Loader2, TrendingUp, Wallet, AlertTriangle, Users, FolderKanban,
  CalendarClock, ArrowRight, CheckCircle2, Coins,
} from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, fmtFecha, diasHasta } from './format'
import { useNav } from './nav'

const ESTADO_PROY = {
  propuesta:     { label: 'Propuesta',    cls: 'text-sky-300' },
  desarrollo:    { label: 'Desarrollo',   cls: 'text-primary-300' },
  produccion:    { label: 'Producción',   cls: 'text-emerald-300' },
  mantenimiento: { label: 'Mantenimiento',cls: 'text-violet-300' },
  pausado:       { label: 'Pausado',      cls: 'text-amber-300' },
  finalizado:    { label: 'Finalizado',   cls: 'text-surface-200/50' },
}

// Suma montos de un arreglo [{moneda, campo}] agrupando por moneda -> {ARS: n, USD: n}
function porMoneda(rows, campo) {
  const acc = {}
  for (const r of rows || []) acc[r.moneda] = (acc[r.moneda] || 0) + Number(r[campo] || 0)
  return acc
}

// "ARS 120.000 · US$ 500" (omite monedas en cero)
function MoneyMulti({ map, className = '' }) {
  const entries = Object.entries(map).filter(([, v]) => v)
  if (!entries.length) return <span className={className}>—</span>
  return (
    <span className={className}>
      {entries.map(([m, v], i) => (
        <span key={m}>
          {i > 0 && <span className="text-surface-200/30 mx-1.5">·</span>}
          {fmtMoney(v, m)}
        </span>
      ))}
    </span>
  )
}

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { verCliente, irA } = useNav()

  useEffect(() => {
    apiFetch('/dashboard')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center gap-2 text-surface-200/50 text-sm py-20 justify-center">
      <Loader2 className="w-4 h-4 animate-spin" /> Cargando panel…
    </div>
  )
  if (error) return <p className="text-sm text-red-400">{error}</p>

  const mrr = porMoneda(data.mrr, 'mrr')
  const cobrado = porMoneda(data.mes, 'cobrado')
  const facturado = porMoneda(data.mes, 'facturado')
  const deuda = porMoneda(data.deuda, 'total')
  const deudaCant = (data.deuda || []).reduce((s, r) => s + Number(r.cantidad || 0), 0)

  // Ingresos no recurrentes (setup + únicos), cobrados, por moneda y por tipo.
  const extras = data.extras || []
  const extrasCobrado = porMoneda(extras, 'cobrado')
  const setupCant = extras.filter((r) => r.tipo === 'setup').reduce((s, r) => s + Number(r.cantidad || 0), 0)
  const unicoCant = extras.filter((r) => r.tipo === 'unico').reduce((s, r) => s + Number(r.cantidad || 0), 0)
  const hayExtras = Object.values(extrasCobrado).some(Boolean) || setupCant + unicoCant > 0

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Resumen del negocio</h2>
          <p className="text-sm text-surface-200/50">Período {data.periodo}</p>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={TrendingUp} label="MRR (ingreso recurrente)" accent="primary">
          <MoneyMulti map={mrr} className="text-2xl font-bold text-primary-300 tabular-nums" />
        </Kpi>
        <Kpi icon={Wallet} label="Cobrado este mes">
          <MoneyMulti map={cobrado} className="text-2xl font-bold text-white tabular-nums" />
          <p className="text-xs text-surface-200/40 mt-0.5">
            de <MoneyMulti map={facturado} /> facturado
          </p>
        </Kpi>
        <Kpi icon={AlertTriangle} label="Deuda pendiente" accent="amber">
          <MoneyMulti map={deuda} className="text-2xl font-bold text-amber-300 tabular-nums" />
          <p className="text-xs text-surface-200/40 mt-0.5">{deudaCant} cobro(s) sin pagar</p>
        </Kpi>
        <Kpi icon={Users} label="Clientes activos">
          <p className="text-2xl font-bold text-white tabular-nums">
            {data.clientes.activos}
            <span className="text-sm font-normal text-surface-200/40"> / {data.clientes.total}</span>
          </p>
        </Kpi>
      </div>

      {/* Ingresos no recurrentes: setup + cobros únicos (aparte del MRR) */}
      {hayExtras && (
        <div className="glass rounded-xl p-4 ring-1 ring-violet-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center w-10 h-10 rounded-lg bg-violet-500/10 text-violet-300 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-surface-200/50">Setup y pagos únicos · cobrado</p>
              <p className="text-xs text-surface-200/40 mt-0.5">
                No recurrente · {setupCant} setup · {unicoCant} único(s)
              </p>
            </div>
          </div>
          <MoneyMulti map={extrasCobrado} className="text-2xl font-bold text-violet-300 tabular-nums" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Próximos vencimientos */}
        <Panel title="Próximos vencimientos" icon={CalendarClock} onVerMas={() => irA('pagos')}>
          {data.vencimientos.length === 0 ? (
            <Vacio texto="Sin vencimientos próximos." />
          ) : (
            <ul className="divide-y divide-primary-500/5">
              {data.vencimientos.map((v) => {
                const d = diasHasta(v.vencimiento)
                const vencido = d != null && d < 0
                return (
                  <li key={v.id}>
                    <button
                      onClick={() => verCliente(v.cliente_id)}
                      className="w-full flex items-center justify-between gap-3 py-2.5 text-left hover:bg-surface-900/30 -mx-2 px-2 rounded-lg transition"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{v.cliente_nombre}</p>
                        <p className={`text-xs ${vencido ? 'text-red-400' : 'text-surface-200/40'}`}>
                          {fmtFecha(v.vencimiento)}
                          {d != null && (vencido ? ` · vencido hace ${-d}d` : d === 0 ? ' · hoy' : ` · en ${d}d`)}
                        </p>
                      </div>
                      <span className="text-sm tabular-nums text-surface-200/80 shrink-0">
                        {fmtMoney(v.monto, v.moneda)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        {/* Seguimientos pendientes */}
        <Panel title="Tareas / seguimientos" icon={CheckCircle2} onVerMas={() => irA('seguimientos')}>
          {data.pendientes.length === 0 ? (
            <Vacio texto="No hay acciones pendientes." />
          ) : (
            <ul className="divide-y divide-primary-500/5">
              {data.pendientes.map((s) => {
                const d = diasHasta(s.proxima_fecha)
                const atrasado = d != null && d < 0
                return (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{s.proxima_accion || s.titulo}</p>
                      <p className="text-xs text-surface-200/40 truncate">{s.cliente_nombre}</p>
                    </div>
                    <span className={`text-xs shrink-0 ${atrasado ? 'text-red-400' : 'text-surface-200/50'}`}>
                      {fmtFecha(s.proxima_fecha)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>

      {/* Proyectos por estado */}
      <Panel title="Proyectos" icon={FolderKanban} onVerMas={() => irA('proyectos')}>
        {data.proyectos.length === 0 ? (
          <Vacio texto="Todavía no cargaste proyectos." />
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {data.proyectos.map((p) => {
              const meta = ESTADO_PROY[p.estado] || { label: p.estado, cls: 'text-surface-200/60' }
              return (
                <span key={p.estado} className="inline-flex items-center gap-2 rounded-lg bg-surface-900/50 ring-1 ring-primary-500/10 px-3 py-1.5">
                  <span className={`text-lg font-bold tabular-nums ${meta.cls}`}>{p.cantidad}</span>
                  <span className="text-xs text-surface-200/60">{meta.label}</span>
                </span>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}

function Kpi({ icon: Icon, label, children, accent }) {
  const ring = accent === 'primary' ? 'ring-primary-500/20' : accent === 'amber' ? 'ring-amber-500/20' : 'ring-primary-500/10'
  return (
    <div className={`glass rounded-xl p-4 ring-1 ${ring}`}>
      <div className="flex items-center gap-2 text-surface-200/50">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function Panel({ title, icon: Icon, children, onVerMas }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon className="w-4 h-4 text-primary-300" /> {title}
        </h3>
        {onVerMas && (
          <button onClick={onVerMas} className="flex items-center gap-1 text-xs text-surface-200/50 hover:text-primary-300 transition">
            Ver más <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function Vacio({ texto }) {
  return <p className="text-sm text-surface-200/40 py-4 text-center">{texto}</p>
}
