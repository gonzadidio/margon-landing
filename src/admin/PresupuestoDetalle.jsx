import { useEffect, useState } from 'react'
import { X, Loader2, Pencil, Send, Trash2, Lock, Check, CheckCircle2, Copy } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, fmtFecha } from './format'

const EST = {
  borrador:  { label: 'Borrador', cls: 'ad-pill-gray', hint: 'Todavía no lo ve el cliente.' },
  enviado:   { label: 'Enviado', cls: 'ad-pill-amber', hint: 'El cliente puede verlo, elegir opcionales y firmar.' },
  aprobado:  { label: 'Firmado', cls: 'ad-pill-green', hint: 'Aprobado por el cliente. No se puede editar.' },
  rechazado: { label: 'Rechazado', cls: 'ad-pill-red', hint: 'El cliente lo rechazó.' },
}

export default function PresupuestoDetalle({ id, onClose, onEdit, onEnviar, onEliminar }) {
  const [p, setP] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    apiFetch(`/presupuestos/${id}`).then(setP).catch((e) => setErr(e.message))
  }, [id])

  const e = p ? (EST[p.estado] || EST.borrador) : null
  const items = p?.items || []
  const totalBase = items.filter((i) => i.obligatorio).reduce((s, i) => s + Number(i.costo || 0), 0)
  const totalTodo = items.reduce((s, i) => s + Number(i.costo || 0), 0)
  const totalElegido = items.filter((i) => i.seleccionado).reduce((s, i) => s + Number(i.costo || 0), 0)
  const firmado = p?.estado === 'aprobado'

  // Agrupar por grupo/fase
  const grupos = []
  for (const it of items) {
    const g = it.grupo || ''
    let b = grupos.find((x) => x.g === g)
    if (!b) { b = { g, items: [] }; grupos.push(b) }
    b.items.push(it)
  }

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div onClick={(ev) => ev.stopPropagation()} className="ad-card w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {!p ? (
          <div className="flex items-center gap-2 ad-muted text-sm p-10 justify-center">
            {err ? <span className="text-red-400">{err}</span> : <><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</>}
          </div>
        ) : (
          <>
            {/* Encabezado */}
            <div className="sticky top-0 ad-panel border-b ad-line px-6 py-4 flex items-start justify-between gap-3 z-10">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold ad-ink truncate">{p.titulo}</h3>
                  <span className={`ad-pill ${e.cls}`}>{e.label}</span>
                </div>
                <p className="text-xs ad-faint mt-0.5">{e.hint}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 ad-muted shrink-0"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              {p.descripcion && <p className="text-sm ad-muted leading-relaxed">{p.descripcion}</p>}

              {/* Resumen de totales */}
              <div className="grid grid-cols-3 gap-3">
                <Tot label="Base (fijo)" value={fmtMoney(totalBase, p.moneda)} />
                <Tot label="Con todo" value={fmtMoney(totalTodo, p.moneda)} />
                <Tot
                  label={firmado ? 'Firmado' : 'Elegido ahora'}
                  value={fmtMoney(firmado ? p.firma_total : totalElegido, p.moneda)}
                  tone="green"
                />
              </div>

              {/* Ítems */}
              <div className="space-y-5">
                {grupos.map((grp, gi) => (
                  <div key={gi}>
                    {grp.g && <p className="text-[11px] font-mono uppercase tracking-wider ad-faint mb-2">{grp.g}</p>}
                    <div className="space-y-1.5">
                      {grp.items.map((it) => {
                        const on = it.seleccionado
                        return (
                          <div key={it.id} className={`flex items-start gap-3 rounded-xl border p-3 ${on ? 'border-primary-500/25 bg-primary-500/[0.05]' : 'ad-line bg-white/[0.015]'}`}>
                            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${on ? 'border-primary-500 bg-primary-500 text-[#04120c]' : 'border-white/15'}`}>
                              {it.obligatorio ? <Lock className="h-3 w-3 opacity-70" /> : (on && <Check className="h-3.5 w-3.5" />)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${on ? 'ad-ink' : 'ad-muted'}`}>{it.concepto}</p>
                                <span className={`ad-pill ${it.obligatorio ? 'ad-pill-gray' : 'ad-pill-violet'}`}>{it.obligatorio ? 'Base' : 'Opcional'}</span>
                                {!it.obligatorio && !on && <span className="text-[11px] ad-faint">no incluido</span>}
                              </div>
                              {it.descripcion && <p className="text-[12px] ad-faint mt-0.5 leading-relaxed">{it.descripcion}</p>}
                            </div>
                            <span className={`shrink-0 tabular-nums text-sm font-semibold ${on ? 'ad-ink' : 'ad-faint line-through'}`}>{fmtMoney(it.costo, p.moneda)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Firma */}
              {firmado && (
                <div className="rounded-xl border border-primary-500/25 bg-primary-500/[0.06] p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                  <div className="text-[13px]">
                    <p className="ad-ink font-semibold">Aprobado y firmado</p>
                    <p className="ad-muted mt-0.5">Firmó <b className="ad-ink">{p.firma_nombre}</b> el {fmtFecha(p.firma_fecha)} · total <b className="ad-ink tabular-nums">{fmtMoney(p.firma_total, p.moneda)}</b></p>
                  </div>
                </div>
              )}

              {/* Notas internas */}
              {p.notas && (
                <div className="rounded-xl ad-line border p-3 bg-white/[0.015]">
                  <p className="text-[11px] uppercase tracking-wide ad-faint mb-1">Notas internas · no las ve el cliente</p>
                  <p className="text-[13px] ad-muted whitespace-pre-wrap">{p.notas}</p>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="sticky bottom-0 ad-panel border-t ad-line px-6 py-3.5 flex items-center justify-between gap-2 flex-wrap">
              <button onClick={() => onEliminar(p)} className="ad-btn ad-btn-ghost ad-btn-sm !text-red-300 hover:!bg-red-500/10"><Trash2 className="w-4 h-4" /> Eliminar</button>
              <div className="flex items-center gap-2">
                {!firmado && <button onClick={() => onEdit(p)} className="ad-btn ad-btn-ghost ad-btn-sm"><Pencil className="w-4 h-4" /> Editar</button>}
                {!firmado && <button onClick={() => onEnviar(p)} className="ad-btn ad-btn-primary ad-btn-sm"><Send className="w-4 h-4" /> {p.estado === 'enviado' ? 'Reenviar' : 'Enviar al portal'}</button>}
                {firmado && <span className="text-xs ad-faint flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary-400" /> Cerrado — solo lectura</span>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Tot({ label, value, tone }) {
  return (
    <div className="ad-card p-3 text-center">
      <p className="text-[10.5px] uppercase tracking-wide ad-faint">{label}</p>
      <p className={`text-[15px] font-extrabold mt-1 tabular-nums ${tone === 'green' ? 'text-primary-300' : 'ad-ink'}`}>{value}</p>
    </div>
  )
}
