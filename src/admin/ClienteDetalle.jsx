import { useEffect, useState, useCallback } from 'react'
import {
  X, Loader2, Mail, Phone, Globe, Calendar, FolderKanban, Wallet,
  MessageSquare, Github, ExternalLink, CheckCircle2, Clock, Plus,
} from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, fmtFecha, tipoCobroMeta } from './format'
import CobroForm, { nuevoCobro } from './CobroForm'

const ESTADO_PROY = {
  propuesta: 'Propuesta', desarrollo: 'Desarrollo', produccion: 'Producción',
  mantenimiento: 'Mantenimiento', pausado: 'Pausado', finalizado: 'Finalizado',
}

export default function ClienteDetalle({ id, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [manual, setManual] = useState(null) // form de cobro manual

  const load = useCallback(() => {
    setLoading(true)
    apiFetch(`/clientes/${id}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  async function guardarCobro(payload) {
    await apiFetch('/cobros', { method: 'POST', body: JSON.stringify(payload) })
    setManual(null)
    load()
  }

  // Totales del historial de pagos (por moneda)
  const pagado = {}
  const deuda = {}
  for (const c of data?.cobros || []) {
    const m = c.moneda || 'ARS'
    if (c.estado === 'pagado') pagado[m] = (pagado[m] || 0) + Number(c.monto || 0)
    else deuda[m] = (deuda[m] || 0) + Number(c.monto || 0)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl h-full overflow-y-auto bg-[#0a0f0d] border-l border-primary-500/15 shadow-2xl"
      >
        {loading ? (
          <div className="flex items-center gap-2 text-surface-200/50 text-sm py-20 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando ficha…
          </div>
        ) : error ? (
          <div className="p-6"><p className="text-sm text-red-400">{error}</p></div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-primary-500/10 px-6 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white truncate">{data.nombre}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${data.estado === 'activo' ? 'bg-primary-500/15 text-primary-300' : 'bg-surface-800 text-surface-200/50'}`}>
                    {data.estado}
                  </span>
                </div>
                {data.proyecto && <p className="text-sm text-surface-200/50 mt-0.5">{data.proyecto}</p>}
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-800 text-surface-200/70 shrink-0"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contacto + datos */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {data.email && <Info icon={Mail}><a href={`mailto:${data.email}`} className="hover:text-primary-300">{data.email}</a></Info>}
                {data.telefono && <Info icon={Phone}>{data.telefono}</Info>}
                {data.sitio_url && <Info icon={Globe}><a href={data.sitio_url} target="_blank" rel="noreferrer" className="hover:text-primary-300">{data.sitio_url}</a></Info>}
                {data.fecha_alta && <Info icon={Calendar}>Cliente desde {fmtFecha(data.fecha_alta)}</Info>}
              </div>

              {/* KPIs del cliente */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Mini label="Abono mensual" value={Number(data.monto_mensual) > 0 ? fmtMoney(data.monto_mensual, data.moneda) : '—'} />
                <Mini label="Proyectos" value={data.proyectos.length} />
                <Mini label="Cobrado" value={mapToStr(pagado)} accent="primary" />
                <Mini label="Deuda" value={mapToStr(deuda)} accent={Object.keys(deuda).length ? 'amber' : undefined} />
              </div>

              {data.notas && (
                <div className="glass rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-surface-200/40 mb-1">Notas</p>
                  <p className="text-sm text-surface-200/80 whitespace-pre-wrap">{data.notas}</p>
                </div>
              )}

              {/* Proyectos */}
              <Section icon={FolderKanban} title="Proyectos" count={data.proyectos.length}>
                {data.proyectos.length === 0 ? <Vacio /> : (
                  <div className="space-y-2">
                    {data.proyectos.map((p) => (
                      <div key={p.id} className="glass rounded-lg p-3 ring-1 ring-primary-500/10">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-white truncate">{p.nombre}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="text-surface-200/50 hover:text-white"><Github className="w-3.5 h-3.5" /></a>}
                            {p.deploy_url && <a href={p.deploy_url} target="_blank" rel="noreferrer" className="text-surface-200/50 hover:text-primary-300"><ExternalLink className="w-3.5 h-3.5" /></a>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-surface-200/50">
                          <span>{ESTADO_PROY[p.estado] || p.estado}</span>
                          {p.stack && <><span>·</span><span className="truncate">{p.stack}</span></>}
                          {Number(p.monto) > 0 && <><span>·</span><span>{fmtMoney(p.monto, p.moneda)}</span></>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Historial de pagos */}
              <Section
                icon={Wallet}
                title="Historial de pagos"
                count={data.cobros.length}
                action={
                  <button
                    onClick={() => setManual(nuevoCobro(data.id, data.moneda))}
                    className="inline-flex items-center gap-1 text-xs text-primary-300 hover:text-primary-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar cobro
                  </button>
                }
              >
                {data.cobros.length === 0 ? <Vacio /> : (
                  <div className="space-y-1">
                    {data.cobros.map((c) => {
                      const tm = tipoCobroMeta(c.tipo)
                      return (
                        <div key={c.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-primary-500/5 last:border-0">
                          <div className="flex items-center gap-2 min-w-0">
                            {c.estado === 'pagado'
                              ? <CheckCircle2 className="w-4 h-4 text-primary-300 shrink-0" />
                              : <Clock className="w-4 h-4 text-amber-300 shrink-0" />}
                            <span className="text-sm text-surface-200/80">{c.concepto || c.periodo}</span>
                            {c.tipo !== 'mensual' && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tm.cls}`}>{tm.label}</span>
                            )}
                            {c.fecha_pago && <span className="text-xs text-surface-200/40 hidden sm:inline">· {fmtFecha(c.fecha_pago)}</span>}
                          </div>
                          <span className="text-sm tabular-nums text-surface-200/80 shrink-0">{fmtMoney(c.monto, c.moneda)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Section>

              {/* Seguimientos */}
              <Section icon={MessageSquare} title="Seguimientos" count={data.seguimientos.length}>
                {data.seguimientos.length === 0 ? <Vacio /> : (
                  <div className="space-y-2">
                    {data.seguimientos.map((s) => (
                      <div key={s.id} className="glass rounded-lg p-3 ring-1 ring-primary-500/10">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium ${s.completado ? 'text-surface-200/50 line-through' : 'text-white'}`}>{s.titulo}</p>
                          <span className="text-xs text-surface-200/40 shrink-0">{fmtFecha(s.fecha)}</span>
                        </div>
                        {s.detalle && <p className="text-sm text-surface-200/60 mt-1 whitespace-pre-wrap">{s.detalle}</p>}
                        {s.proxima_accion && (
                          <p className="text-xs text-primary-300/70 mt-1.5">→ {s.proxima_accion}{s.proxima_fecha ? ` (${fmtFecha(s.proxima_fecha)})` : ''}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </>
        )}
      </div>

      {manual && data && (
        <CobroForm
          initial={manual}
          clientes={[{ id: data.id, nombre: data.nombre }]}
          lockCliente
          onSave={guardarCobro}
          onClose={() => setManual(null)}
        />
      )}
    </div>
  )
}

function mapToStr(map) {
  const e = Object.entries(map).filter(([, v]) => v)
  if (!e.length) return '—'
  return e.map(([m, v]) => fmtMoney(v, m)).join(' · ')
}

function Info({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 text-surface-200/70">
      <Icon className="w-4 h-4 text-surface-200/40" /> {children}
    </span>
  )
}

function Mini({ label, value, accent }) {
  const cls = accent === 'primary' ? 'text-primary-300' : accent === 'amber' ? 'text-amber-300' : 'text-white'
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-[11px] uppercase tracking-wide text-surface-200/40">{label}</p>
      <p className={`text-base font-bold mt-0.5 tabular-nums ${cls}`}>{value}</p>
    </div>
  )
}

function Section({ icon: Icon, title, count, children, action }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon className="w-4 h-4 text-primary-300" /> {title}
          <span className="text-xs font-normal text-surface-200/40">{count}</span>
        </h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function Vacio() {
  return <p className="text-sm text-surface-200/40 py-2">Nada por acá todavía.</p>
}
