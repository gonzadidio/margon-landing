import { useEffect, useState } from 'react'
import { Loader2, Trash2, MessageCircle, ChevronDown, ChevronUp, PackageCheck } from 'lucide-react'
import { apiFetch } from './api'
import { fmtMoney, fmtFecha } from './format'

const ESTADOS = [
  { v: 'nuevo', label: 'Nuevo', cls: 'ad-pill-blue' },
  { v: 'contactado', label: 'Contactado', cls: 'ad-pill-green' },
  { v: 'descartado', label: 'Descartado', cls: 'ad-pill-gray' },
]
const estMeta = (v) => ESTADOS.find((e) => e.v === v) || { label: v, cls: 'ad-pill-gray' }
const soloDigitos = (t) => (t || '').replace(/\D/g, '')

export default function PresupuestosRecibidos() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [abierto, setAbierto] = useState(null)

  async function load() {
    setLoading(true)
    try { setItems(await apiFetch('/presupuestos-web')); setError('') }
    catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function cambiarEstado(p, estado) {
    setItems((xs) => xs.map((x) => x.id === p.id ? { ...x, estado } : x))
    try { await apiFetch(`/presupuestos-web/${p.id}`, { method: 'PUT', body: JSON.stringify({ estado }) }) }
    catch { load() }
  }
  async function remove(p) {
    if (!confirm('¿Eliminar esta solicitud?')) return
    await apiFetch(`/presupuestos-web/${p.id}`, { method: 'DELETE' }); load()
  }

  if (loading) return <div className="flex items-center gap-2 ad-muted text-sm py-10 justify-center"><Loader2 className="animate-spin" size={22} /> Cargando…</div>
  if (error) return <div className="ad-muted text-sm py-10 text-center">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold ad-ink tracking-tight">Presupuestos recibidos</h2>
          <p className="text-xs ad-faint mt-0.5">Selecciones enviadas desde el configurador web.</p>
        </div>
        <span className="ad-pill ad-pill-blue">{items.length}</span>
      </div>

      {items.length === 0 && <div className="ad-muted text-sm py-10 text-center">Todavía no hay solicitudes.</div>}

      <div className="space-y-3">
        {items.map((p) => {
          const mods = Array.isArray(p.modulos) ? p.modulos : []
          const em = estMeta(p.estado)
          const isOpen = abierto === p.id
          const tel = soloDigitos(p.telefono)
          return (
            <div key={p.id} className="ad-card p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold ad-ink">{p.nombre || 'Sin nombre'}</span>
                    {p.origen && <span className="ad-pill ad-pill-violet">{p.origen}</span>}
                    <span className={`ad-pill ${em.cls}`}>{em.label}</span>
                  </div>
                  <div className="text-xs ad-faint mt-1">
                    {[p.telefono, p.email].filter(Boolean).join(' · ') || 'Sin contacto'} · {fmtFecha(p.created_at)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold ad-ink tabular-nums">{fmtMoney(p.total, p.moneda || 'USD')}</div>
                  <div className="text-xs ad-faint flex items-center gap-1 justify-end mt-0.5"><PackageCheck size={12} /> {mods.length} módulos</div>
                </div>
              </div>

              {isOpen && mods.length > 0 && (
                <div className="mt-3 border-t ad-line pt-3 space-y-1">
                  {mods.map((m, i) => (
                    <div key={m.id || i} className="flex items-center justify-between text-sm">
                      <span className="ad-ink">{m.name}</span>
                      <span className="ad-muted tabular-nums">{fmtMoney(m.price, p.moneda || 'USD')}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {mods.length > 0 && (
                  <button className="ad-btn ad-btn-soft ad-btn-sm" onClick={() => setAbierto(isOpen ? null : p.id)}>
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />} {isOpen ? 'Ocultar' : 'Ver módulos'}
                  </button>
                )}
                {tel && (
                  <a className="ad-btn ad-btn-soft ad-btn-sm" href={`https://wa.me/${tel}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                )}
                <select className="ad-input !w-auto !py-1.5 text-xs" value={p.estado} onChange={(e) => cambiarEstado(p, e.target.value)}>
                  {ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                </select>
                <button className="ml-auto p-1.5 rounded-lg hover:bg-white/10 ad-muted hover:text-red-400 transition" onClick={() => remove(p)} title="Eliminar">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
