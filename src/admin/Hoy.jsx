// Pantalla de inicio: todo lo que hay que atender hoy, con los botones para
// resolverlo desde acá (avisar, cobrar, generar el mes, tachar recordatorios).
import { useState } from 'react'
import {
  Wallet, TrendingUp, Users, Repeat, AlertTriangle, Clock, BellOff, Check, Plus, Trash2,
  Bell, Sparkles, Inbox, FileSignature, ArrowRight, Target,
} from 'lucide-react'
import { apiGet, apiPost, apiPut, apiDelete } from './api'
import { Card, Kpi, Money, Btn, Cargando, ErrorMsg, Empty, Field, useToast, useCarga } from './ui'
import CobroRow, { useAccionesCobro } from './CobroRow'
import { fmtMoney, fmtFecha, relFecha, diasHasta, fechaLarga, periodoLargo, capitalizar, hoyISO } from './format'
import { hrefCliente, ir } from './nav'

export default function Hoy() {
  const { data: d, error, loading, recargar } = useCarga(() => apiGet('/hoy'))
  const acciones = useAccionesCobro(recargar)
  const toast = useToast()
  const [generando, setGenerando] = useState(false)

  if (loading) return <Cargando />
  if (error) return <ErrorMsg>{error}</ErrorMsg>

  async function generar() {
    setGenerando(true)
    try {
      const r = await apiPost('/cobros/generar', { periodo: d.periodo })
      toast(`${r.creados} cobro${r.creados === 1 ? '' : 's'} generado${r.creados === 1 ? '' : 's'} para ${periodoLargo(d.periodo)}`)
      recargar()
    } catch (e) { toast(e.message, 'error') } finally { setGenerando(false) }
  }

  const nCobros = d.vencidos.length + d.por_vencer.length + d.sin_avisar.length
  const seguimiento = [
    ...d.notas.map((n) => ({ id: `n${n.id}`, txt: n.proxima_accion || n.titulo, ref: n.cliente_nombre, fecha: n.proxima_fecha, href: hrefCliente(n.cliente_id), icon: Bell })),
    ...d.oportunidades.map((o) => ({ id: `o${o.id}`, txt: o.proxima_accion || o.etapa, ref: `${o.nombre} · ${o.tipo === 'propio' ? 'proyecto propio' : 'posible cliente'}`, fecha: o.proxima_fecha, href: '#/ventas', icon: Target })),
    ...d.presupuestos_enviados.map((p) => ({ id: `p${p.id}`, txt: `Presupuesto "${p.titulo}" esperando respuesta`, ref: p.cliente_nombre, fecha: p.sent_at, href: hrefCliente(p.cliente_id), icon: FileSignature, sinUrgencia: true })),
    ...d.solicitudes.map((s) => ({ id: `s${s.id}`, txt: `Solicitud web de ${s.nombre || 'alguien'} · ${fmtMoney(s.total, s.moneda)}`, ref: [s.email, s.telefono].filter(Boolean).join(' · ') || 'sin contacto', fecha: s.created_at, href: '#/ventas', icon: Inbox, sinUrgencia: true })),
  ].sort((a, b) => String(a.fecha || '9').localeCompare(String(b.fecha || '9')))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold ad-ink tracking-tight">Hoy</h1>
          <p className="ad-muted text-sm mt-0.5">{capitalizar(fechaLarga(d.hoy))} · {nCobros + d.recordatorios.length + seguimiento.length === 0 ? 'nada pendiente' : 'lo que hay que atender'}</p>
        </div>
        <Btn size="sm" icon={Plus} onClick={() => ir('cobros')}>Ver cobros del mes</Btn>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={Wallet} label="Por cobrar" tone={Object.values(d.kpis.por_cobrar).some((v) => v > 0) ? 'amber' : ''} value={<Money map={d.kpis.por_cobrar} />} hint={`${d.pendientes_total} cobro${d.pendientes_total === 1 ? '' : 's'} con saldo`} />
        <Kpi icon={TrendingUp} label="Cobrado este mes" tone="green" value={<Money map={d.kpis.cobrado_mes} />} hint={`de ${Object.entries(d.kpis.facturado_mes).map(([m, v]) => fmtMoney(v, m)).join(' · ') || '—'} emitido`} />
        <Kpi icon={Repeat} label="Abonos mensuales" value={<Money map={d.kpis.mrr} />} hint="clientes activos" />
        <Kpi icon={Users} label="Clientes activos" value={<>{d.kpis.clientes_activos}<span className="text-base ad-faint font-normal"> / {d.kpis.clientes_total}</span></>} />
      </div>

      {d.sin_generar.length > 0 && (
        <div className="ad-banner">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <b>Falta generar el cobro de {periodoLargo(d.periodo)}</b> para {d.sin_generar.length} cliente{d.sin_generar.length === 1 ? '' : 's'}:{' '}
            <span className="opacity-80">{d.sin_generar.map((c) => c.nombre).join(', ')}</span>
          </div>
          <Btn variant="primary" size="sm" loading={generando} onClick={generar}>Generar ahora</Btn>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-4 items-start">
        {/* ===== Cobros ===== */}
        <div className="lg:col-span-3 space-y-4">
          {nCobros === 0 ? (
            <Card><Empty icon={Sparkles} title="Cobros al día" text="No hay cobros vencidos, por vencer ni sin avisar." /></Card>
          ) : (
            <>
              <Bloque titulo="Vencidos" icon={AlertTriangle} tone="red" items={d.vencidos} acciones={acciones} />
              <Bloque titulo="Vencen esta semana" icon={Clock} tone="amber" items={d.por_vencer} acciones={acciones} />
              <Bloque titulo={`De ${periodoLargo(d.periodo)}, todavía sin avisar`} icon={BellOff} tone="gray" items={d.sin_avisar} acciones={acciones} />
            </>
          )}
        </div>

        {/* ===== Recordatorios + seguimiento ===== */}
        <div className="lg:col-span-2 space-y-4">
          <Recordatorios items={d.recordatorios} onChange={recargar} />

          <Card title="Seguimiento" flush extra={<a href="#/ventas" className="text-xs text-primary-300 font-semibold flex items-center gap-1">Ventas <ArrowRight className="w-3 h-3" /></a>}>
            {seguimiento.length === 0
              ? <p className="text-[13px] ad-muted text-center py-6">Nada pendiente de seguimiento.</p>
              : seguimiento.map((t) => {
                const dd = t.fecha ? diasHasta(t.fecha) : null
                const atras = !t.sinUrgencia && dd != null && dd < 0
                return (
                  <a key={t.id} href={t.href} className="ad-row !py-2.5">
                    <t.icon className={`w-4 h-4 shrink-0 ${atras ? 'text-red-300' : 'ad-faint'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] ad-ink truncate">{t.txt}</p>
                      <p className="text-[11.5px] ad-muted truncate">{t.ref}</p>
                    </div>
                    <span className={`text-[11.5px] shrink-0 ${atras ? 'text-red-300 font-semibold' : 'ad-faint'}`}>{t.fecha ? relFecha(t.fecha) : ''}</span>
                  </a>
                )
              })}
          </Card>
        </div>
      </div>
      {acciones.modales}
    </div>
  )
}

function Bloque({ titulo, icon: Icon, tone, items, acciones }) {
  if (!items.length) return null
  const color = tone === 'red' ? 'text-red-300' : tone === 'amber' ? 'text-amber-300' : 'ad-muted'
  return (
    <Card flush title={<span className={`flex items-center gap-1.5 ${color}`}><Icon className="w-4 h-4" /> {titulo} <span className="ad-faint font-normal">· {items.length}</span></span>}>
      {items.map((c) => <CobroRow key={c.id} c={c} acciones={acciones} compacto />)}
    </Card>
  )
}

// ---------- Recordatorios propios ----------
function Recordatorios({ items, onChange }) {
  const toast = useToast()
  const [nuevo, setNuevo] = useState(false)
  const [todos, setTodos] = useState(null) // lista completa (con hechos) cuando se abre
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState(hoyISO())
  const [guardando, setGuardando] = useState(false)

  async function crear(e) {
    e.preventDefault()
    if (!titulo.trim()) return
    setGuardando(true)
    try {
      await apiPost('/recordatorios', { titulo, fecha: fecha || null })
      setTitulo(''); setNuevo(false); onChange(); if (todos) verTodos()
    } catch (err) { toast(err.message, 'error') } finally { setGuardando(false) }
  }
  async function marcar(r, hecho) {
    try { await apiPut(`/recordatorios/${r.id}`, { hecho }); onChange(); if (todos) verTodos() } catch (err) { toast(err.message, 'error') }
  }
  async function borrar(r) {
    if (!confirm(`¿Eliminar "${r.titulo}"?`)) return
    try { await apiDelete(`/recordatorios/${r.id}`); onChange(); if (todos) verTodos() } catch (err) { toast(err.message, 'error') }
  }
  async function verTodos() { setTodos(await apiGet('/recordatorios', { todos: 1 })) }

  const lista = todos || items
  return (
    <Card title={<span className="flex items-center gap-1.5"><Bell className="w-4 h-4 text-primary-300" /> Recordatorios</span>} flush
      extra={<div className="flex items-center gap-2">
        <button onClick={() => todos ? setTodos(null) : verTodos()} className="text-xs ad-muted hover:text-white">{todos ? 'Solo pendientes' : 'Ver todos'}</button>
        <Btn size="sm" variant="soft" icon={Plus} onClick={() => setNuevo((v) => !v)}>Nuevo</Btn>
      </div>}>
      {nuevo && (
        <form onSubmit={crear} className="p-3 border-b ad-line grid grid-cols-[1fr_auto] gap-2 items-end">
          <Field label="Qué no me quiero olvidar" className="col-span-2"><input autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: renovar dominio de PBV" className="ad-input" /></Field>
          <Field label="Fecha"><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="ad-input" /></Field>
          <Btn type="submit" variant="primary" loading={guardando} disabled={!titulo.trim()}>Guardar</Btn>
        </form>
      )}
      {lista.length === 0
        ? <p className="text-[13px] ad-muted text-center py-6">Sin recordatorios pendientes.</p>
        : lista.map((r) => {
          const dd = r.fecha ? diasHasta(r.fecha) : null
          const atras = !r.hecho && dd != null && dd < 0
          const hoy = !r.hecho && dd === 0
          return (
            <div key={r.id} className={`ad-row !py-2.5 ${r.hecho ? 'opacity-50' : ''}`}>
              <button onClick={() => marcar(r, !r.hecho)} title={r.hecho ? 'Marcar pendiente' : 'Marcar hecho'}
                className={`w-5 h-5 rounded-md ring-1 grid place-items-center shrink-0 transition ${r.hecho ? 'bg-primary-500 ring-primary-500 text-[#04120c]' : 'ring-white/20 hover:ring-primary-400'}`}>
                {r.hecho && <Check className="w-3.5 h-3.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] ad-ink ${r.hecho ? 'line-through' : ''}`}>{r.titulo}</p>
                {(r.cliente_nombre || r.detalle) && <p className="text-[11.5px] ad-muted truncate">{[r.cliente_nombre, r.detalle].filter(Boolean).join(' · ')}</p>}
              </div>
              {r.fecha && <span className={`text-[11.5px] shrink-0 ${atras ? 'text-red-300 font-semibold' : hoy ? 'text-amber-300 font-semibold' : 'ad-faint'}`}>{hoy ? 'hoy' : atras ? relFecha(r.fecha) : fmtFecha(r.fecha)}</span>}
              <button onClick={() => borrar(r)} className="ad-iconbtn ad-iconbtn-danger !w-7 !h-7 -mr-2" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          )
        })}
    </Card>
  )
}
