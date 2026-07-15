import { useState, useEffect } from 'react'
import { ArrowLeft, Check, Lock, PenLine, Printer } from 'lucide-react'
import { portalGet, portalPost, portalPatch } from './portalApi'
import { fmtMoney, fmtFecha } from '../admin/format'
import PresupuestoPrint from './PresupuestoPrint'

const ESTADO = {
  enviado:   { label: 'Por revisar', cls: 'ad-pill ad-pill-amber' },
  aprobado:  { label: 'Firmado', cls: 'ad-pill ad-pill-green' },
  rechazado: { label: 'Rechazado', cls: 'ad-pill ad-pill-red' },
}

export default function PortalPresupuestos({ clienteNombre }) {
  const [list, setList] = useState(null)
  const [sel, setSel] = useState(null)

  const load = () => portalGet('/presupuestos').then(setList).catch(() => setList([]))
  useEffect(() => { load() }, [])

  if (sel) return <Detalle id={sel} clienteNombre={clienteNombre} onBack={() => { setSel(null); load() }} />
  if (!list) return <p className="ad-muted">Cargando…</p>
  if (list.length === 0) {
    return (
      <div className="ad-card p-10 text-center">
        <p className="ad-ink font-semibold">Todavía no hay presupuestos</p>
        <p className="ad-muted text-[13px] mt-1">Cuando Margon te suba uno, vas a poder elegir qué incluir y firmarlo acá.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold ad-ink">Presupuestos</h1>
      <div className="grid gap-4">
        {list.map((p) => {
          const m = ESTADO[p.estado] || ESTADO.enviado
          return (
            <button key={p.id} onClick={() => setSel(p.id)}
              className="ad-card flex items-center gap-4 p-5 text-left transition hover:border-[#10b981]/40">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold ad-ink truncate">{p.titulo}</h2>
                  <span className={m.cls}>{m.label}</span>
                </div>
                <p className="ad-faint text-[12px] mt-0.5">{fmtFecha(p.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold ad-ink tabular-nums">{fmtMoney(p.total_elegido, p.moneda)}</p>
                <p className="ad-faint text-[11px]">{p.estado === 'aprobado' ? 'firmado' : 'total actual'}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Detalle({ id, clienteNombre, onBack }) {
  const [p, setP] = useState(null)
  const [items, setItems] = useState([])
  const [modo, setModo] = useState('ver')   // 'ver' | 'firmar'
  const [nombre, setNombre] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [imprimir, setImprimir] = useState(false)

  useEffect(() => {
    portalGet(`/presupuestos/${id}`).then((d) => { setP(d); setItems(d.items) }).catch(() => {})
  }, [id])

  if (!p) return <p className="ad-muted">Cargando…</p>

  const editable = p.estado === 'enviado'
  const firmado = p.estado === 'aprobado'
  const rechazado = p.estado === 'rechazado'
  const total = items.filter((i) => i.seleccionado).reduce((s, i) => s + Number(i.costo || 0), 0)

  // Agrupar por fase/grupo
  const grupos = []
  for (const it of items) {
    const g = it.grupo || ''
    let bucket = grupos.find((x) => x.g === g)
    if (!bucket) { bucket = { g, items: [] }; grupos.push(bucket) }
    bucket.items.push(it)
  }

  function toggle(item) {
    if (!editable || item.obligatorio) return
    const nuevo = !item.seleccionado
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, seleccionado: nuevo } : i)))
    portalPatch(`/presupuestos/${id}/seleccion`, { seleccion: { [item.id]: nuevo } }).catch(() => {})
  }

  async function firmar() {
    setErr('')
    if (!nombre.trim()) return setErr('Ingresá tu nombre para firmar.')
    setSaving(true)
    try {
      const d = await portalPost(`/presupuestos/${id}/firmar`, { nombre: nombre.trim() })
      setP(d); setItems(d.items); setModo('ver')
    } catch (e) { setErr(e.message) } finally { setSaving(false) }
  }

  async function rechazar() {
    if (!confirm('¿Rechazar este presupuesto? Podés hablar con Margon para que te arme otro.')) return
    try { const d = await portalPost(`/presupuestos/${id}/rechazar`, {}); setP(d); setItems(d.items) } catch { /* noop */ }
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="ad-btn ad-btn-ghost ad-btn-sm no-print"><ArrowLeft className="h-4 w-4" /> Presupuestos</button>

      <div className="ad-card p-6 sm:p-8">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <h1 className="text-2xl font-bold ad-ink">{p.titulo}</h1>
            {p.descripcion && <p className="ad-muted text-sm mt-1 max-w-xl leading-relaxed">{p.descripcion}</p>}
          </div>
          <span className={(ESTADO[p.estado] || ESTADO.enviado).cls}>{(ESTADO[p.estado] || ESTADO.enviado).label}</span>
        </div>

        {editable && (
          <p className="ad-muted text-[13px] mt-4">
            Los ítems <b className="ad-ink">base</b> están incluidos. Tildá los <b className="ad-ink">opcionales</b> que quieras
            y mirá cómo cambia el total. Cuando estés conforme, firmalo.
          </p>
        )}

        {/* Ítems */}
        <div className="mt-5 space-y-6">
          {grupos.map((grp, gi) => (
            <div key={gi}>
              {grp.g && <p className="ad-faint text-[11px] font-mono uppercase tracking-wider mb-2">{grp.g}</p>}
              <div className="space-y-2">
                {grp.items.map((it) => {
                  const on = it.seleccionado
                  const canToggle = editable && !it.obligatorio
                  return (
                    <div key={it.id}
                      onClick={() => canToggle && toggle(it)}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 transition ${
                        on ? 'border-[#10b981]/30 bg-[#10b981]/[0.05]' : 'ad-line bg-white/[0.02]'
                      } ${canToggle ? 'cursor-pointer hover:border-[#10b981]/50' : ''}`}>
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                        on ? 'border-[#10b981] bg-[#10b981] text-[#04120c]' : 'border-white/20'
                      }`}>
                        {it.obligatorio ? <Lock className="h-3 w-3 opacity-70" /> : (on && <Check className="h-3.5 w-3.5" />)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${on ? 'ad-ink' : 'ad-muted'}`}>{it.concepto}</p>
                          {it.obligatorio && <span className="ad-pill ad-pill-gray">Base</span>}
                          {!it.obligatorio && <span className="ad-pill ad-pill-violet">Opcional</span>}
                        </div>
                        {it.descripcion && <p className="ad-faint text-[12px] mt-0.5 leading-relaxed">{it.descripcion}</p>}
                      </div>
                      <span className={`shrink-0 tabular-nums text-sm font-semibold ${on ? 'ad-ink' : 'ad-faint line-through'}`}>
                        {fmtMoney(it.costo, p.moneda)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-6 flex items-center justify-between border-t-2 border-white/10 pt-4">
          <span className="font-bold ad-ink">{firmado ? 'Total firmado' : 'Total con lo que elegiste'}</span>
          <span className="text-2xl font-extrabold text-[#34d399] tabular-nums">
            {fmtMoney(firmado ? p.firma_total : total, p.moneda)}
          </span>
        </div>

        {/* Firma */}
        {firmado && (
          <div className="mt-5 rounded-xl border border-[#10b981]/20 bg-[#10b981]/[0.05] p-4 text-[13px]">
            <p className="ad-ink font-semibold">✓ Aprobado y firmado</p>
            <p className="ad-muted mt-1">Firmado por <b className="ad-ink">{p.firma_nombre}</b> el {fmtFecha(p.firma_fecha)}.</p>
          </div>
        )}
        {rechazado && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4 text-[13px]">
            <p className="text-red-300 font-semibold">Presupuesto rechazado</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      {editable && modo === 'ver' && (
        <div className="flex flex-wrap gap-3 no-print">
          <button onClick={() => setModo('firmar')} className="ad-btn ad-btn-primary"><PenLine className="h-4 w-4" /> Aceptar y firmar</button>
          <button onClick={rechazar} className="ad-btn ad-btn-ghost">Rechazar</button>
        </div>
      )}

      {editable && modo === 'firmar' && (
        <div className="ad-card p-6 space-y-4 no-print">
          <div>
            <h2 className="font-bold ad-ink">Firmar el presupuesto</h2>
            <p className="ad-muted text-[13px] mt-1">
              Estás por aceptar por <b className="ad-ink">{fmtMoney(total, p.moneda)}</b>. Ingresá tu nombre y apellido como firma.
            </p>
          </div>
          <input className="ad-input" value={nombre} autoFocus placeholder="Tu nombre y apellido"
            onChange={(e) => setNombre(e.target.value)} />
          {err && <p className="text-[13px] text-red-400">{err}</p>}
          <div className="flex gap-3">
            <button onClick={firmar} disabled={saving} className="ad-btn ad-btn-primary">
              {saving ? 'Firmando…' : 'Confirmar firma'}
            </button>
            <button onClick={() => { setModo('ver'); setErr('') }} className="ad-btn ad-btn-ghost">Cancelar</button>
          </div>
        </div>
      )}

      {firmado && (
        <button onClick={() => setImprimir(true)} className="ad-btn ad-btn-ghost no-print">
          <Printer className="h-4 w-4" /> Descargar / imprimir
        </button>
      )}

      {imprimir && <PresupuestoPrint p={p} items={items} clienteNombre={clienteNombre} onClose={() => setImprimir(false)} />}
    </div>
  )
}
