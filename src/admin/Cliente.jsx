// Ficha del cliente: contacto y acciones rápidas arriba; abajo cobros,
// proyectos, presupuestos, archivos, notas y acceso al portal.
import { useState } from 'react'
import {
  ArrowLeft, Mail, Phone, Globe, Calendar, Pencil, Plus, Trash2, MessageCircle, ExternalLink, Github,
  Upload, Download, Paperclip, StickyNote, Check, KeyRound, Copy, FolderKanban, Bell, Wallet, Send,
} from 'lucide-react'
import { apiGet, apiPost, apiPut, apiDelete, apiUpload, abrirEnPestana } from './api'
import { Card, Btn, Pill, Avatar, Tabs, Field, Modal, Cargando, ErrorMsg, Empty, IconBtn, useCarga, useToast } from './ui'
import CobroRow, { useAccionesCobro } from './CobroRow'
import CobroForm from './CobroForm'
import ClienteForm from './ClienteForm'
import EnviarMensaje from './EnviarMensaje'
import { TabPresupuestos } from './Presupuestos'
import { fmtMoney, fmtMoneyMap, fmtFecha, fmtFechaHora, fmtBytes, relFecha, hoyISO, saldoCobro, estadoPago, MONEDAS } from './format'
import { ir } from './nav'

const TABS = ['cobros', 'proyectos', 'presupuestos', 'archivos', 'notas', 'portal']
const TAB_LABEL = { cobros: 'Cobros', proyectos: 'Proyectos', presupuestos: 'Presupuestos', archivos: 'Archivos', notas: 'Notas', portal: 'Portal' }

export default function Cliente({ id }) {
  const toast = useToast()
  const { data: c, error, loading, recargar } = useCarga(() => apiGet(`/clientes/${id}`), [id])
  const [tab, setTab] = useState('cobros')
  const [editar, setEditar] = useState(false)
  const [mensaje, setMensaje] = useState(null) // { tipo, extra }
  const acciones = useAccionesCobro(recargar)

  if (loading) return <Cargando texto="Cargando ficha…" />
  if (error) return <ErrorMsg>{error}</ErrorMsg>
  if (!c) return null

  const deuda = {}, cobrado = {}
  for (const co of c.cobros) {
    const m = co.moneda || 'ARS'
    cobrado[m] = (cobrado[m] || 0) + Number(co.pagado || 0)
    const s = saldoCobro(co); if (s > 0) deuda[m] = (deuda[m] || 0) + s
  }
  const pendientes = c.cobros.filter((co) => estadoPago(co) !== 'pagado').length

  async function borrarCliente() {
    if (!confirm(`¿Eliminar a ${c.nombre} con todos sus cobros, proyectos y archivos? No se puede deshacer.`)) return
    if (!confirm('¿Seguro? Esta acción es definitiva.')) return
    try { await apiDelete(`/clientes/${c.id}`); toast('Cliente eliminado'); ir('clientes') } catch (e) { toast(e.message, 'error') }
  }

  const counts = { cobros: pendientes, proyectos: c.proyectos.length, presupuestos: c.presupuestos.filter((p) => p.estado === 'enviado').length, archivos: c.archivos.length, notas: c.notas.filter((n) => !n.completado).length + c.recordatorios.length }

  return (
    <div className="space-y-5">
      <a href="#/clientes" className="inline-flex items-center gap-1.5 text-sm ad-muted hover:text-white transition"><ArrowLeft className="w-4 h-4" /> Clientes</a>

      {/* ===== Encabezado ===== */}
      <div className="flex items-start gap-4 flex-wrap">
        <Avatar nombre={c.nombre} size="lg" tone={c.estado === 'activo' ? 'green' : 'gray'} />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold ad-ink flex items-center gap-2 flex-wrap">
            {c.nombre}
            <Pill tone={c.estado === 'activo' ? 'green' : 'gray'}>{c.estado}</Pill>
            {c.portal_activo && <Pill tone="blue"><KeyRound className="w-3 h-3" /> portal</Pill>}
          </h1>
          {c.proyecto && <p className="text-[13.5px] ad-muted mt-0.5">{c.proyecto}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[13px] ad-muted">
            {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-primary-300"><Mail className="w-3.5 h-3.5 ad-faint" /> {c.email}</a>}
            {c.telefono && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 ad-faint" /> {c.telefono}</span>}
            {c.sitio_url && <a href={c.sitio_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary-300"><Globe className="w-3.5 h-3.5 ad-faint" /> {c.sitio_url.replace(/^https?:\/\//, '')}</a>}
            {c.fecha_alta && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 ad-faint" /> desde {fmtFecha(c.fecha_alta)}</span>}
            {c.canal && <span className="ad-faint">vía {c.canal}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Btn size="sm" variant="wa" icon={MessageCircle} disabled={!c.whatsapp} onClick={() => setMensaje({ tipo: 'libre', canal: 'whatsapp' })}>WhatsApp</Btn>
          <Btn size="sm" icon={Mail} disabled={!c.email} onClick={() => setMensaje({ tipo: 'libre', canal: 'email' })}>Mail</Btn>
          <Btn size="sm" icon={Pencil} onClick={() => setEditar(true)}>Editar</Btn>
        </div>
      </div>

      {/* ===== Números ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Abono mensual" value={Number(c.monto_mensual) > 0 ? fmtMoney(c.monto_mensual, c.moneda) : '—'} hint={c.dia_cobro ? `vence el día ${c.dia_cobro}` : ''} />
        <Stat label="Debe" value={fmtMoneyMap(deuda)} tone={Object.keys(deuda).length ? 'amber' : 'green'} hint={Object.keys(deuda).length ? `${pendientes} cobro${pendientes === 1 ? '' : 's'}` : 'al día'} />
        <Stat label="Cobrado total" value={fmtMoneyMap(cobrado)} />
        <Stat label="Último aviso" value={c.envios[0] ? relFecha(c.envios[0].created_at) : '—'} hint={c.envios[0] ? `${c.envios[0].tipo} por ${c.envios[0].canal === 'whatsapp' ? 'WhatsApp' : 'mail'}` : 'nunca'} />
      </div>

      {typeof c.notas === 'string' && c.notas && <p className="text-[13px] ad-muted whitespace-pre-wrap rounded-lg bg-white/4 ring-1 ad-line px-3 py-2"><StickyNote className="w-3.5 h-3.5 inline mr-1.5 ad-faint" />{c.notas}</p>}

      <Tabs value={tab} onChange={setTab} tabs={TABS.map((t) => ({ id: t, label: TAB_LABEL[t], count: counts[t] }))} />

      {tab === 'cobros' && <TabCobros c={c} acciones={acciones} onChange={recargar} />}
      {tab === 'proyectos' && <TabProyectos c={c} onChange={recargar} />}
      {tab === 'presupuestos' && <TabPresupuestos cliente={c} presupuestos={c.presupuestos} onChange={recargar} onAvisar={(p) => setMensaje({ tipo: 'presupuesto', extra: { titulo: p.titulo } })} />}
      {tab === 'archivos' && <TabArchivos c={c} onChange={recargar} />}
      {tab === 'notas' && <TabNotas c={c} onChange={recargar} />}
      {tab === 'portal' && <TabPortal c={c} onChange={recargar} onAvisar={(link) => setMensaje({ tipo: 'portal', extra: { link } })} />}

      <div className="pt-6 text-right">
        <button onClick={borrarCliente} className="text-[12px] ad-faint hover:text-red-400 transition">Eliminar cliente</button>
      </div>

      {editar && <ClienteForm cliente={c} onClose={() => setEditar(false)} onSaved={() => { setEditar(false); toast('Cliente guardado'); recargar() }} />}
      {mensaje && <EnviarMensaje tipo={mensaje.tipo} canal={mensaje.canal} clienteId={c.id} extra={mensaje.extra || {}} onClose={() => setMensaje(null)} onEnviado={() => { setMensaje(null); recargar() }} />}
      {acciones.modales}
    </div>
  )
}

const Stat = ({ label, value, tone = '', hint }) => (
  <div className="ad-card p-3.5 min-w-0">
    <p className="text-[11px] uppercase tracking-wide ad-muted font-semibold">{label}</p>
    <p className={`text-[17px] font-bold mt-1 tabular-nums truncate ${tone === 'amber' ? 'text-amber-300' : tone === 'green' ? 'text-primary-300' : 'ad-ink'}`}>{value}</p>
    {hint && <p className="text-[11px] ad-faint mt-0.5 truncate">{hint}</p>}
  </div>
)

// ================= Cobros =================
function TabCobros({ c, acciones, onChange }) {
  const toast = useToast()
  const [nuevo, setNuevo] = useState(false)
  const [verEnvios, setVerEnvios] = useState(false)
  return (
    <div className="space-y-4">
      <Card flush title="Cobros" extra={<Btn size="sm" variant="soft" icon={Plus} onClick={() => setNuevo(true)}>Nuevo cobro</Btn>}>
        {c.cobros.length === 0
          ? <Empty icon={Wallet} title="Sin cobros todavía" text="Los mensuales se generan desde Cobros; acá podés cargar un setup o un cobro puntual." />
          : c.cobros.map((co) => <CobroRow key={co.id} c={{ ...co, cliente_nombre: c.nombre, cliente_email: c.email, cliente_telefono: c.telefono }} acciones={acciones} mostrarCliente={false} />)}
      </Card>

      <Card flush title={<span className="flex items-center gap-1.5"><Send className="w-4 h-4 ad-faint" /> Mensajes enviados <span className="ad-faint font-normal">· {c.envios.length}</span></span>}
        extra={c.envios.length > 3 && <button onClick={() => setVerEnvios((v) => !v)} className="text-xs ad-muted hover:text-white">{verEnvios ? 'Ver menos' : 'Ver todos'}</button>}>
        {c.envios.length === 0
          ? <p className="text-[13px] ad-muted text-center py-5">Todavía no le mandaste nada desde el panel.</p>
          : (verEnvios ? c.envios : c.envios.slice(0, 3)).map((e) => (
            <details key={e.id} className="border-b ad-line last:border-0">
              <summary className="ad-row !py-2.5 cursor-pointer list-none">
                {e.canal === 'whatsapp' ? <MessageCircle className="w-4 h-4 text-primary-400 shrink-0" /> : <Mail className="w-4 h-4 text-sky-300 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] ad-ink truncate">{e.asunto || e.tipo}</p>
                  <p className="text-[11.5px] ad-muted">{e.tipo} · {e.canal === 'whatsapp' ? 'WhatsApp' : 'mail'} a {e.destino}</p>
                </div>
                <span className="text-[11.5px] ad-faint shrink-0">{fmtFechaHora(e.created_at)}</span>
              </summary>
              <pre className="text-[12.5px] ad-muted whitespace-pre-wrap font-sans px-4 pb-3 pl-11">{e.cuerpo}</pre>
            </details>
          ))}
      </Card>
      {nuevo && <CobroForm clienteId={c.id} clienteNombre={c.nombre} onClose={() => setNuevo(false)} onSaved={() => { setNuevo(false); toast('Cobro creado'); onChange() }} />}
    </div>
  )
}

// ================= Proyectos =================
const PROY_EST = [
  { v: 'propuesta', label: 'Propuesta', tone: 'amber' }, { v: 'desarrollo', label: 'En desarrollo', tone: 'blue' },
  { v: 'produccion', label: 'En producción', tone: 'green' }, { v: 'mantenimiento', label: 'Mantenimiento', tone: 'violet' },
  { v: 'pausado', label: 'Pausado', tone: 'gray' }, { v: 'finalizado', label: 'Finalizado', tone: 'green' },
]
const proyMeta = (v) => PROY_EST.find((e) => e.v === v) || PROY_EST[1]

function TabProyectos({ c, onChange }) {
  const toast = useToast()
  const [edit, setEdit] = useState(null)
  async function borrar(p) {
    if (!confirm(`¿Eliminar el proyecto "${p.nombre}"?`)) return
    try { await apiDelete(`/proyectos/${p.id}`); onChange() } catch (e) { toast(e.message, 'error') }
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Btn size="sm" variant="soft" icon={Plus} onClick={() => setEdit({})}>Nuevo proyecto</Btn></div>
      {c.proyectos.length === 0 ? <Card><Empty icon={FolderKanban} title="Sin proyectos" text="Cargá los sitios o sistemas que le hiciste, con su repo y su URL." /></Card>
        : <div className="grid sm:grid-cols-2 gap-3">
          {c.proyectos.map((p) => {
            const m = proyMeta(p.estado)
            return (
              <div key={p.id} className="ad-card p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold ad-ink text-[14px] truncate">{p.nombre}</p>
                    <Pill tone={m.tone} className="mt-1">{m.label}</Pill>
                  </div>
                  <IconBtn icon={Pencil} title="Editar" onClick={() => setEdit(p)} />
                  <IconBtn icon={Trash2} tone="danger" title="Eliminar" onClick={() => borrar(p)} />
                </div>
                {p.descripcion && <p className="text-[12.5px] ad-muted line-clamp-3">{p.descripcion}</p>}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] ad-muted">
                  {p.stack && <span>{p.stack}</span>}
                  {Number(p.monto) > 0 && <span className="ad-ink tabular-nums">{fmtMoney(p.monto, p.moneda)}</span>}
                  {p.fecha_inicio && <span>{fmtFecha(p.fecha_inicio)}{p.fecha_fin ? ` → ${fmtFecha(p.fecha_fin)}` : ''}</span>}
                </div>
                {(p.deploy_url || p.repo_url) && (
                  <div className="flex gap-3 text-[12px] pt-1">
                    {p.deploy_url && <a href={p.deploy_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-300 hover:underline"><ExternalLink className="w-3 h-3" /> Ver online</a>}
                    {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 ad-muted hover:text-white"><Github className="w-3 h-3" /> Repo</a>}
                  </div>
                )}
              </div>
            )
          })}
        </div>}
      {edit && <ProyectoForm clienteId={c.id} proyecto={edit.id ? edit : null} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); onChange() }} />}
    </div>
  )
}

function ProyectoForm({ clienteId, proyecto, onClose, onSaved }) {
  const [f, setF] = useState(() => ({ nombre: '', descripcion: '', estado: 'desarrollo', stack: '', repo_url: '', deploy_url: '', monto: '', moneda: 'ARS', fecha_inicio: '', fecha_fin: '', ...(proyecto || {}) }))
  const [error, setError] = useState(''); const [guardando, setGuardando] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  async function guardar(e) {
    e.preventDefault(); setGuardando(true); setError('')
    try {
      const body = { ...f, cliente_id: clienteId, monto: Number(f.monto) || 0, fecha_inicio: f.fecha_inicio ? String(f.fecha_inicio).slice(0, 10) : null, fecha_fin: f.fecha_fin ? String(f.fecha_fin).slice(0, 10) : null }
      if (proyecto) await apiPut(`/proyectos/${proyecto.id}`, body); else await apiPost('/proyectos', body)
      onSaved()
    } catch (err) { setError(err.message) } finally { setGuardando(false) }
  }
  return (
    <Modal title={proyecto ? 'Editar proyecto' : 'Nuevo proyecto'} onClose={onClose} width="max-w-2xl"
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" loading={guardando} onClick={guardar}>Guardar</Btn></>}>
      <form onSubmit={guardar} className="grid sm:grid-cols-2 gap-3">
        <Field label="Nombre" full><input required autoFocus value={f.nombre} onChange={set('nombre')} className="ad-input" /></Field>
        <Field label="Descripción" full><textarea rows={2} value={f.descripcion || ''} onChange={set('descripcion')} className="ad-input" /></Field>
        <Field label="Estado"><select value={f.estado} onChange={set('estado')} className="ad-input">{PROY_EST.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}</select></Field>
        <Field label="Stack"><input value={f.stack || ''} onChange={set('stack')} placeholder="React, Node, Postgres…" className="ad-input" /></Field>
        <Field label="URL online"><input value={f.deploy_url || ''} onChange={set('deploy_url')} placeholder="https://…" className="ad-input" /></Field>
        <Field label="Repo"><input value={f.repo_url || ''} onChange={set('repo_url')} placeholder="https://github.com/…" className="ad-input" /></Field>
        <Field label="Monto del proyecto"><input type="number" min="0" step="0.01" value={f.monto ?? ''} onChange={set('monto')} className="ad-input" /></Field>
        <Field label="Moneda"><select value={f.moneda} onChange={set('moneda')} className="ad-input">{MONEDAS.map((m) => <option key={m}>{m}</option>)}</select></Field>
        <Field label="Inicio"><input type="date" value={f.fecha_inicio ? String(f.fecha_inicio).slice(0, 10) : ''} onChange={set('fecha_inicio')} className="ad-input" /></Field>
        <Field label="Fin"><input type="date" value={f.fecha_fin ? String(f.fecha_fin).slice(0, 10) : ''} onChange={set('fecha_fin')} className="ad-input" /></Field>
        <ErrorMsg>{error}</ErrorMsg>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

// ================= Archivos =================
const CATEGORIAS = ['factura', 'informe', 'contrato', 'diseño', 'otro']
function TabArchivos({ c, onChange }) {
  const toast = useToast()
  const [subiendo, setSubiendo] = useState(false)
  const [categoria, setCategoria] = useState('otro')
  const [descripcion, setDescripcion] = useState('')

  async function subir(e) {
    const file = e.target.files?.[0]; if (!file) return
    setSubiendo(true)
    try {
      const fd = new FormData(); fd.append('archivo', file); fd.append('categoria', categoria); fd.append('descripcion', descripcion)
      await apiUpload(`/clientes/${c.id}/archivos`, fd); setDescripcion(''); toast('Archivo subido'); onChange()
    } catch (err) { toast(err.message, 'error') } finally { setSubiendo(false); e.target.value = '' }
  }
  async function borrar(a) {
    if (!confirm(`¿Eliminar "${a.nombre}"?`)) return
    try { await apiDelete(`/archivos/${a.id}`); onChange() } catch (err) { toast(err.message, 'error') }
  }
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Categoría"><select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="ad-input !w-auto">{CATEGORIAS.map((k) => <option key={k}>{k}</option>)}</select></Field>
          <Field label="Descripción" className="flex-1 min-w-[180px]"><input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Opcional" className="ad-input" /></Field>
          <label className={`ad-btn ad-btn-primary ${subiendo ? 'opacity-50 pointer-events-none' : ''}`}><Upload className="w-4 h-4" /> {subiendo ? 'Subiendo…' : 'Subir archivo'}<input type="file" hidden onChange={subir} /></label>
        </div>
        <p className="text-[11px] ad-faint mt-2">Hasta 15 MB. Los archivos se ven también en el portal del cliente.</p>
      </Card>
      <Card flush>
        {c.archivos.length === 0 ? <Empty icon={Paperclip} title="Sin archivos" text="Facturas, informes, contratos, diseños." />
          : c.archivos.map((a) => (
            <div key={a.id} className="ad-row">
              <Paperclip className="w-4 h-4 ad-faint shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] ad-ink truncate">{a.nombre} <Pill tone="gray" className="ml-1">{a.categoria}</Pill></p>
                <p className="text-[11.5px] ad-muted truncate">{[a.descripcion, fmtBytes(a.tamano), fmtFecha(a.created_at)].filter(Boolean).join(' · ')}</p>
              </div>
              <IconBtn icon={Download} title="Abrir" onClick={() => abrirEnPestana(`/archivos/${a.id}`).catch((e) => toast(e.message, 'error'))} />
              <IconBtn icon={Trash2} tone="danger" title="Eliminar" onClick={() => borrar(a)} />
            </div>
          ))}
      </Card>
    </div>
  )
}

// ================= Notas + recordatorios =================
const NOTA_TIPOS = ['nota', 'llamada', 'reunion', 'whatsapp', 'email', 'tarea']
function TabNotas({ c, onChange }) {
  const toast = useToast()
  const [nota, setNota] = useState(null)
  const [rec, setRec] = useState({ titulo: '', fecha: hoyISO() })
  async function marcar(n) { try { await apiPut(`/notas/${n.id}`, { completado: !n.completado }); onChange() } catch (e) { toast(e.message, 'error') } }
  async function borrarNota(n) { if (confirm('¿Eliminar esta nota?')) { try { await apiDelete(`/notas/${n.id}`); onChange() } catch (e) { toast(e.message, 'error') } } }
  async function crearRec(e) {
    e.preventDefault(); if (!rec.titulo.trim()) return
    try { await apiPost('/recordatorios', { ...rec, cliente_id: c.id }); setRec({ titulo: '', fecha: hoyISO() }); onChange() } catch (err) { toast(err.message, 'error') }
  }
  async function hechoRec(r) { try { await apiPut(`/recordatorios/${r.id}`, { hecho: true }); onChange() } catch (e) { toast(e.message, 'error') } }

  return (
    <div className="grid lg:grid-cols-5 gap-4 items-start">
      <div className="lg:col-span-3 space-y-3">
        <div className="flex justify-end"><Btn size="sm" variant="soft" icon={Plus} onClick={() => setNota({})}>Nueva nota</Btn></div>
        <Card flush>
          {c.notas.length === 0 ? <Empty icon={StickyNote} title="Sin notas" text="Llamadas, reuniones, acuerdos, próximas acciones." />
            : c.notas.map((n) => (
              <div key={n.id} className={`ad-row items-start ${n.completado ? 'opacity-50' : ''}`}>
                <button onClick={() => marcar(n)} title={n.completado ? 'Reabrir' : 'Marcar hecha'} className={`mt-0.5 w-5 h-5 rounded-md ring-1 grid place-items-center shrink-0 transition ${n.completado ? 'bg-primary-500 ring-primary-500 text-[#04120c]' : 'ring-white/20 hover:ring-primary-400'}`}>{n.completado && <Check className="w-3.5 h-3.5" />}</button>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] ad-ink"><span className="ad-faint text-[11px] uppercase tracking-wide mr-2">{n.tipo}</span>{n.titulo}</p>
                  {n.detalle && <p className="text-[12.5px] ad-muted whitespace-pre-wrap mt-0.5">{n.detalle}</p>}
                  <p className="text-[11.5px] ad-faint mt-1">{fmtFecha(n.fecha)}{n.proxima_accion && <span className={n.completado ? '' : 'text-amber-300'}> · próximo: {n.proxima_accion}{n.proxima_fecha ? ` (${relFecha(n.proxima_fecha)})` : ''}</span>}</p>
                </div>
                <IconBtn icon={Pencil} title="Editar" onClick={() => setNota(n)} />
                <IconBtn icon={Trash2} tone="danger" title="Eliminar" onClick={() => borrarNota(n)} />
              </div>
            ))}
        </Card>
      </div>
      <Card className="lg:col-span-2" flush title={<span className="flex items-center gap-1.5"><Bell className="w-4 h-4 text-primary-300" /> Recordatorios</span>}>
        <form onSubmit={crearRec} className="p-3 border-b ad-line space-y-2">
          <input value={rec.titulo} onChange={(e) => setRec((x) => ({ ...x, titulo: e.target.value }))} placeholder="Recordarme…" className="ad-input" />
          <div className="flex gap-2"><input type="date" value={rec.fecha} onChange={(e) => setRec((x) => ({ ...x, fecha: e.target.value }))} className="ad-input" /><Btn type="submit" variant="primary" size="sm" disabled={!rec.titulo.trim()}>Agregar</Btn></div>
        </form>
        {c.recordatorios.length === 0 ? <p className="text-[13px] ad-muted text-center py-5">Nada pendiente.</p>
          : c.recordatorios.map((r) => (
            <div key={r.id} className="ad-row !py-2.5">
              <button onClick={() => hechoRec(r)} className="w-5 h-5 rounded-md ring-1 ring-white/20 hover:ring-primary-400 shrink-0" title="Hecho" />
              <p className="text-[13px] ad-ink flex-1 min-w-0 truncate">{r.titulo}</p>
              {r.fecha && <span className="text-[11.5px] ad-faint">{relFecha(r.fecha)}</span>}
            </div>
          ))}
      </Card>
      {nota && <NotaForm clienteId={c.id} nota={nota.id ? nota : null} onClose={() => setNota(null)} onSaved={() => { setNota(null); onChange() }} />}
    </div>
  )
}

function NotaForm({ clienteId, nota, onClose, onSaved }) {
  const [f, setF] = useState(() => ({ tipo: 'nota', titulo: '', detalle: '', proxima_accion: '', ...(nota || {}), fecha: nota?.fecha ? String(nota.fecha).slice(0, 10) : hoyISO(), proxima_fecha: nota?.proxima_fecha ? String(nota.proxima_fecha).slice(0, 10) : '' }))
  const [error, setError] = useState(''); const [guardando, setGuardando] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  async function guardar(e) {
    e.preventDefault(); setGuardando(true); setError('')
    try {
      const body = { ...f, cliente_id: clienteId, proxima_fecha: f.proxima_fecha || null }
      if (nota) await apiPut(`/notas/${nota.id}`, body); else await apiPost('/notas', body)
      onSaved()
    } catch (err) { setError(err.message) } finally { setGuardando(false) }
  }
  return (
    <Modal title={nota ? 'Editar nota' : 'Nueva nota'} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" loading={guardando} onClick={guardar}>Guardar</Btn></>}>
      <form onSubmit={guardar} className="grid sm:grid-cols-2 gap-3">
        <Field label="Tipo"><select value={f.tipo} onChange={set('tipo')} className="ad-input">{NOTA_TIPOS.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Fecha"><input type="date" value={f.fecha} onChange={set('fecha')} className="ad-input" /></Field>
        <Field label="Título" full><input required autoFocus value={f.titulo} onChange={set('titulo')} className="ad-input" /></Field>
        <Field label="Detalle" full><textarea rows={3} value={f.detalle || ''} onChange={set('detalle')} className="ad-input" /></Field>
        <Field label="Próxima acción"><input value={f.proxima_accion || ''} onChange={set('proxima_accion')} placeholder="Ej: mandar propuesta" className="ad-input" /></Field>
        <Field label="Para cuándo"><input type="date" value={f.proxima_fecha} onChange={set('proxima_fecha')} className="ad-input" /></Field>
        <ErrorMsg>{error}</ErrorMsg>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

// ================= Portal =================
function TabPortal({ c, onChange, onAvisar }) {
  const toast = useToast()
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiado, setCopiado] = useState(false)
  async function generar() {
    setLoading(true)
    try { const r = await apiPost(`/clientes/${c.id}/portal-invite`); setLink(r.link); onChange() } catch (e) { toast(e.message, 'error') } finally { setLoading(false) }
  }
  async function copiar() { try { await navigator.clipboard.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 2000) } catch { /* noop */ } }
  return (
    <Card title={<span className="flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-primary-300" /> Portal del cliente</span>}
      extra={c.portal_activo && <Pill tone="green"><Check className="w-3 h-3" /> Activo{c.portal_last_login ? ` · entró ${relFecha(c.portal_last_login)}` : ''}</Pill>}>
      <p className="text-[13px] ad-muted">
        {c.portal_activo
          ? `${c.nombre} ya usa el portal (pagos, proyectos, archivos y presupuestos). Si necesita restablecer la contraseña, generá un link nuevo.`
          : 'Generá un link de invitación y mandáselo: con ese link crea su contraseña y entra a ver pagos, proyectos, archivos y presupuestos.'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <Btn variant={link ? 'ghost' : 'soft'} size="sm" icon={KeyRound} loading={loading} onClick={generar}>{c.portal_activo || link ? 'Generar link nuevo' : 'Generar link de acceso'}</Btn>
        {link && (
          <>
            <input readOnly value={link} onFocus={(e) => e.target.select()} className="ad-input flex-1 min-w-[240px] text-[12px]" />
            <Btn size="sm" icon={copiado ? Check : Copy} onClick={copiar}>{copiado ? 'Copiado' : 'Copiar'}</Btn>
            <Btn size="sm" variant="primary" icon={Send} onClick={() => onAvisar(link)}>Mandar por WhatsApp / mail</Btn>
          </>
        )}
      </div>
      {link && <p className="text-[11px] ad-faint mt-2">El link vale 14 días.</p>}
    </Card>
  )
}
