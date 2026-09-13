// Ventas: solicitudes que llegan del configurador web y oportunidades
// (posibles clientes y proyectos propios) con su próxima acción.
import { useState } from 'react'
import { Plus, Pencil, Trash2, MessageCircle, Mail, UserPlus, Inbox, Target, Lightbulb, Building2, ChevronDown, ChevronUp, ArrowRightCircle } from 'lucide-react'
import { apiGet, apiPost, apiPut, apiDelete } from './api'
import { Card, Btn, Pill, Field, Modal, Empty, IconBtn, ErrorMsg, Cargando, Segment, useCarga, useToast } from './ui'
import { fmtMoney, relFecha, diasHasta, telefonoWa, MONEDAS } from './format'
import { irCliente } from './nav'

const ETAPAS = {
  lead: [
    { v: 'nuevo', label: 'A contactar', tone: 'blue' }, { v: 'contactado', label: 'En conversación', tone: 'violet' },
    { v: 'propuesta', label: 'Propuesta enviada', tone: 'amber' }, { v: 'negociacion', label: 'Negociando', tone: 'green' },
    { v: 'ganado', label: 'Ganado', tone: 'green' }, { v: 'perdido', label: 'Descartado', tone: 'gray' },
  ],
  propio: [
    { v: 'idea', label: 'Idea', tone: 'blue' }, { v: 'en_progreso', label: 'En progreso', tone: 'green' },
    { v: 'pausado', label: 'Pausado', tone: 'amber' }, { v: 'terminado', label: 'Terminado', tone: 'gray' },
  ],
}
const CERRADOS = ['ganado', 'perdido', 'terminado']

const SOL_ESTADOS = [{ v: 'nuevo', label: 'Nueva', tone: 'blue' }, { v: 'contactado', label: 'Contactada', tone: 'green' }, { v: 'descartado', label: 'Descartada', tone: 'gray' }]

export default function Ventas() {
  const toast = useToast()
  const { data, error, loading, recargar } = useCarga(() => Promise.all([apiGet('/oportunidades'), apiGet('/solicitudes')]).then(([o, s]) => ({ opps: o, sols: s })))
  const [tipo, setTipo] = useState('lead')
  const [verCerradas, setVerCerradas] = useState(false)
  const [edit, setEdit] = useState(null)
  const [abierta, setAbierta] = useState(null)
  const [verSolsViejas, setVerSolsViejas] = useState(false)

  if (loading) return <Cargando />
  if (error) return <ErrorMsg>{error}</ErrorMsg>

  const opps = data.opps.filter((o) => o.tipo === tipo && (verCerradas || !CERRADOS.includes(o.etapa)))
  const sols = data.sols.filter((s) => verSolsViejas || s.estado === 'nuevo')

  async function cambiarEtapa(o, etapa) { try { await apiPut(`/oportunidades/${o.id}`, { etapa }); recargar() } catch (e) { toast(e.message, 'error') } }
  async function borrar(o) { if (confirm(`¿Eliminar "${o.nombre}"?`)) { try { await apiDelete(`/oportunidades/${o.id}`); recargar() } catch (e) { toast(e.message, 'error') } } }
  async function convertir(o) {
    if (!confirm(`¿Convertir "${o.nombre}" en cliente?`)) return
    try { const c = await apiPost(`/oportunidades/${o.id}/convertir`); toast('Cliente creado'); irCliente(c.id) } catch (e) { toast(e.message, 'error') }
  }
  async function estadoSol(s, estado) { try { await apiPut(`/solicitudes/${s.id}`, { estado }); recargar() } catch (e) { toast(e.message, 'error') } }
  async function borrarSol(s) { if (confirm('¿Eliminar esta solicitud?')) { try { await apiDelete(`/solicitudes/${s.id}`); recargar() } catch (e) { toast(e.message, 'error') } } }
  async function seguirSol(s) { try { await apiPost(`/solicitudes/${s.id}/convertir`); toast('Pasó a oportunidades'); setTipo('lead'); recargar() } catch (e) { toast(e.message, 'error') } }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold ad-ink tracking-tight">Ventas</h1>
        <p className="ad-muted text-sm mt-0.5">Lo que entra por la web y lo que estás persiguiendo.</p>
      </div>

      {/* ===== Solicitudes web ===== */}
      <Card flush title={<span className="flex items-center gap-1.5"><Inbox className="w-4 h-4 text-sky-300" /> Solicitudes del configurador web {data.sols.some((s) => s.estado === 'nuevo') && <Pill tone="blue">{data.sols.filter((s) => s.estado === 'nuevo').length} nuevas</Pill>}</span>}
        extra={<button onClick={() => setVerSolsViejas((v) => !v)} className="text-xs ad-muted hover:text-white">{verSolsViejas ? 'Solo nuevas' : 'Ver todas'}</button>}>
        {sols.length === 0 ? <p className="text-[13px] ad-muted text-center py-6">{verSolsViejas ? 'No hay solicitudes.' : 'No hay solicitudes nuevas.'}</p>
          : sols.map((s) => {
            const mods = Array.isArray(s.modulos) ? s.modulos : []
            const em = SOL_ESTADOS.find((e) => e.v === s.estado) || SOL_ESTADOS[0]
            const wa = telefonoWa(s.telefono)
            const open = abierta === s.id
            return (
              <div key={s.id} className="border-b ad-line last:border-0">
                <div className="ad-row">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] ad-ink font-semibold truncate flex items-center gap-2">{s.nombre || 'Sin nombre'} <Pill tone={em.tone}>{em.label}</Pill>{s.origen && <Pill tone="violet">{s.origen}</Pill>}</p>
                    <p className="text-[12px] ad-muted truncate">{[s.email, s.telefono].filter(Boolean).join(' · ') || 'Sin contacto'} · {relFecha(s.created_at)} · {mods.length} módulos</p>
                  </div>
                  <p className="text-[13.5px] font-bold ad-ink tabular-nums">{fmtMoney(s.total, s.moneda || 'USD')}</p>
                  <div className="flex items-center -mr-1 ml-auto">
                    {mods.length > 0 && <IconBtn icon={open ? ChevronUp : ChevronDown} title="Ver módulos" onClick={() => setAbierta(open ? null : s.id)} />}
                    {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="ad-iconbtn ad-iconbtn-wa" title="WhatsApp"><MessageCircle className="w-4 h-4" /></a>}
                    {s.email && <a href={`mailto:${s.email}`} className="ad-iconbtn ad-iconbtn-mail" title="Mail"><Mail className="w-4 h-4" /></a>}
                    {s.estado === 'nuevo' && <IconBtn icon={ArrowRightCircle} title="Seguir como oportunidad" className="text-primary-300" onClick={() => seguirSol(s)} />}
                    <select value={s.estado} onChange={(e) => estadoSol(s, e.target.value)} className="ad-input !w-auto !py-1 !px-2 text-[12px] ml-1">{SOL_ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}</select>
                    <IconBtn icon={Trash2} tone="danger" title="Eliminar" onClick={() => borrarSol(s)} />
                  </div>
                </div>
                {open && (
                  <div className="px-4 pb-3 pl-4 space-y-1">
                    {s.mensaje && <p className="text-[12.5px] ad-muted italic mb-2">“{s.mensaje}”</p>}
                    {mods.map((m, i) => <div key={m.id || i} className="flex justify-between text-[12.5px]"><span className="ad-ink">{m.name}</span><span className="ad-muted tabular-nums">{fmtMoney(m.price, s.moneda || 'USD')}</span></div>)}
                  </div>
                )}
              </div>
            )
          })}
      </Card>

      {/* ===== Oportunidades ===== */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Segment value={tipo} onChange={setTipo} options={[{ v: 'lead', label: 'Posibles clientes', icon: Building2 }, { v: 'propio', label: 'Proyectos propios', icon: Lightbulb }]} />
        <div className="flex items-center gap-3">
          <label className="text-xs ad-muted flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={verCerradas} onChange={(e) => setVerCerradas(e.target.checked)} /> Ver cerradas</label>
          <Btn variant="primary" size="sm" icon={Plus} onClick={() => setEdit({ tipo })}>Nueva</Btn>
        </div>
      </div>
      <Card flush>
        {opps.length === 0 ? <Empty icon={Target} title={tipo === 'lead' ? 'Sin posibles clientes' : 'Sin proyectos propios'} text="Anotá acá a quién tenés que perseguir y cuándo." />
          : opps.map((o) => {

            const dd = o.proxima_fecha ? diasHasta(o.proxima_fecha) : null
            const atras = dd != null && dd < 0 && !CERRADOS.includes(o.etapa)
            return (
              <div key={o.id} className="ad-row">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] ad-ink font-semibold truncate">{o.nombre}{o.cliente_id && <button onClick={() => irCliente(o.cliente_id)} className="ml-2 text-[11px] text-primary-300 font-normal">ver cliente</button>}</p>
                  <p className="text-[12px] ad-muted truncate">{[o.contacto, o.canal].filter(Boolean).join(' · ')}{o.notas ? ` · ${o.notas}` : ''}</p>
                  {o.proxima_accion && <p className={`text-[12px] mt-0.5 ${atras ? 'text-red-300' : 'text-amber-300/90'}`}>→ {o.proxima_accion}{o.proxima_fecha ? ` · ${relFecha(o.proxima_fecha)}` : ''}</p>}
                </div>
                {Number(o.valor) > 0 && <p className="text-[13px] ad-ink tabular-nums font-semibold hidden sm:block">{fmtMoney(o.valor, o.moneda)}</p>}
                <select value={o.etapa} onChange={(e) => cambiarEtapa(o, e.target.value)} className={`ad-input !w-auto !py-1 !px-2 text-[12px]`}>{ETAPAS[o.tipo].map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}</select>
                <div className="flex items-center -mr-1 ml-auto">
                  {o.tipo === 'lead' && !o.cliente_id && <IconBtn icon={UserPlus} title="Convertir en cliente" className="text-primary-300" onClick={() => convertir(o)} />}
                  <IconBtn icon={Pencil} title="Editar" onClick={() => setEdit(o)} />
                  <IconBtn icon={Trash2} tone="danger" title="Eliminar" onClick={() => borrar(o)} />
                </div>
              </div>
            )
          })}
      </Card>
      {edit && <OppForm opp={edit.id ? edit : null} tipo={edit.tipo} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); recargar() }} />}
    </div>
  )
}

function OppForm({ opp, tipo, onClose, onSaved }) {
  const [f, setF] = useState(() => ({ nombre: '', tipo, contacto: '', canal: '', etapa: ETAPAS[tipo][0].v, valor: '', moneda: 'ARS', notas: '', proxima_accion: '', ...(opp || {}), proxima_fecha: opp?.proxima_fecha ? String(opp.proxima_fecha).slice(0, 10) : '' }))
  const [error, setError] = useState(''); const [guardando, setGuardando] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  async function guardar(e) {
    e.preventDefault(); setGuardando(true); setError('')
    try {
      const body = { ...f, valor: Number(f.valor) || 0, proxima_fecha: f.proxima_fecha || null }
      if (opp) await apiPut(`/oportunidades/${opp.id}`, body); else await apiPost('/oportunidades', body)
      onSaved()
    } catch (err) { setError(err.message) } finally { setGuardando(false) }
  }
  const lead = f.tipo === 'lead'
  return (
    <Modal title={opp ? 'Editar' : lead ? 'Nuevo posible cliente' : 'Nuevo proyecto propio'} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" loading={guardando} onClick={guardar}>Guardar</Btn></>}>
      <form onSubmit={guardar} className="grid sm:grid-cols-2 gap-3">
        <Field label="Nombre" full><input required autoFocus value={f.nombre} onChange={set('nombre')} className="ad-input" /></Field>
        {lead && <Field label="Contacto"><input value={f.contacto || ''} onChange={set('contacto')} placeholder="Mail o teléfono" className="ad-input" /></Field>}
        {lead && <Field label="Cómo llegó"><input value={f.canal || ''} onChange={set('canal')} placeholder="Instagram, referido…" className="ad-input" /></Field>}
        <Field label="Etapa"><select value={f.etapa} onChange={set('etapa')} className="ad-input">{ETAPAS[f.tipo].map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}</select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor estimado"><input type="number" min="0" step="0.01" value={f.valor ?? ''} onChange={set('valor')} className="ad-input" /></Field>
          <Field label="Moneda"><select value={f.moneda} onChange={set('moneda')} className="ad-input">{MONEDAS.map((m) => <option key={m}>{m}</option>)}</select></Field>
        </div>
        <Field label="Próxima acción"><input value={f.proxima_accion || ''} onChange={set('proxima_accion')} placeholder="Ej: mandar propuesta" className="ad-input" /></Field>
        <Field label="Para cuándo"><input type="date" value={f.proxima_fecha} onChange={set('proxima_fecha')} className="ad-input" /></Field>
        <Field label="Notas" full><textarea rows={2} value={f.notas || ''} onChange={set('notas')} className="ad-input" /></Field>
        <ErrorMsg>{error}</ErrorMsg>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}
