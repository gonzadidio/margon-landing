// Presupuestos de un cliente: se arman con ítems (base + opcionales), se
// suben al portal y el cliente los aprueba desde ahí.
import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, Send, FileSignature, ArrowUp, ArrowDown, Eye } from 'lucide-react'
import { apiGet, apiPost, apiPut, apiDelete } from './api'
import { Card, Btn, Pill, Field, Modal, Empty, IconBtn, ErrorMsg, Cargando, useToast } from './ui'
import { fmtMoney, fmtFecha, fmtFechaHora, MONEDAS } from './format'

const ESTADO = {
  borrador: { label: 'Borrador', tone: 'gray' }, enviado: { label: 'En el portal', tone: 'amber' },
  aprobado: { label: 'Firmado', tone: 'green' }, rechazado: { label: 'Rechazado', tone: 'red' },
}

export function TabPresupuestos({ cliente, presupuestos, onChange, onAvisar }) {
  const toast = useToast()
  const [editor, setEditor] = useState(null)   // {} nuevo | presupuesto completo
  const [ver, setVer] = useState(null)         // id

  async function abrirEditor(p) { setEditor(p ? await apiGet(`/presupuestos/${p.id}`) : {}) }
  async function enviar(p) {
    if (!confirm(`¿Subir "${p.titulo}" al portal del cliente?`)) return
    try { await apiPost(`/presupuestos/${p.id}/enviar`); toast('Presupuesto publicado en el portal'); onChange(); onAvisar?.(p) } catch (e) { toast(e.message, 'error') }
  }
  async function borrar(p) {
    if (!confirm(`¿Eliminar el presupuesto "${p.titulo}"?`)) return
    try { await apiDelete(`/presupuestos/${p.id}`); onChange() } catch (e) { toast(e.message, 'error') }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Btn size="sm" variant="soft" icon={Plus} onClick={() => abrirEditor(null)}>Nuevo presupuesto</Btn></div>
      <Card flush>
        {presupuestos.length === 0 ? <Empty icon={FileSignature} title="Sin presupuestos" text="Armá uno con ítems base y opcionales; el cliente lo revisa y lo firma desde el portal." />
          : presupuestos.map((p) => {
            const m = ESTADO[p.estado] || ESTADO.borrador
            return (
              <div key={p.id} className="ad-row">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] ad-ink font-semibold truncate flex items-center gap-2">{p.titulo} <Pill tone={m.tone}>{m.label}</Pill></p>
                  <p className="text-[12px] ad-muted">{p.items_count} ítems · {fmtFecha(p.created_at)}{p.sent_at ? ` · publicado ${fmtFecha(p.sent_at)}` : ''}{p.firma_fecha ? ` · firmado ${fmtFecha(p.firma_fecha)} por ${p.firma_nombre}` : ''}</p>
                </div>
                <p className="text-[13.5px] font-bold ad-ink tabular-nums">{fmtMoney(p.estado === 'aprobado' ? p.firma_total : p.total_elegido, p.moneda)}</p>
                <div className="flex items-center -mr-1 ml-auto">
                  <IconBtn icon={Eye} title="Ver" onClick={() => setVer(p.id)} />
                  {p.estado !== 'aprobado' && <IconBtn icon={Pencil} title="Editar" onClick={() => abrirEditor(p)} />}
                  {p.estado === 'borrador' && <IconBtn icon={Send} title="Subir al portal" className="text-primary-300" onClick={() => enviar(p)} />}
                  {p.estado === 'enviado' && <IconBtn icon={Send} title="Avisar al cliente" onClick={() => onAvisar?.(p)} />}
                  <IconBtn icon={Trash2} tone="danger" title="Eliminar" onClick={() => borrar(p)} />
                </div>
              </div>
            )
          })}
      </Card>
      {editor && <PresupuestoEditor cliente={cliente} presupuesto={editor.id ? editor : null} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); toast('Presupuesto guardado'); onChange() }} />}
      {ver && <PresupuestoVista id={ver} onClose={() => setVer(null)} />}
    </div>
  )
}

const itemVacio = () => ({ grupo: '', concepto: '', descripcion: '', costo: '', obligatorio: true })

function PresupuestoEditor({ cliente, presupuesto, onClose, onSaved }) {
  const [f, setF] = useState(() => ({
    titulo: presupuesto?.titulo || '', descripcion: presupuesto?.descripcion || '', moneda: presupuesto?.moneda || cliente.moneda || 'ARS',
    notas: presupuesto?.notas || '',
    items: presupuesto?.items?.length ? presupuesto.items.map((i) => ({ ...i, costo: String(i.costo) })) : [itemVacio()],
  }))
  const [error, setError] = useState(''); const [guardando, setGuardando] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const setItem = (i, k, v) => setF((x) => ({ ...x, items: x.items.map((it, j) => j === i ? { ...it, [k]: v } : it) }))
  const mover = (i, d) => setF((x) => { const items = [...x.items]; const j = i + d; if (j < 0 || j >= items.length) return x; [items[i], items[j]] = [items[j], items[i]]; return { ...x, items } })
  const quitar = (i) => setF((x) => ({ ...x, items: x.items.filter((_, j) => j !== i) }))

  const base = f.items.filter((i) => i.obligatorio).reduce((a, i) => a + (Number(i.costo) || 0), 0)
  const opc = f.items.filter((i) => !i.obligatorio).reduce((a, i) => a + (Number(i.costo) || 0), 0)

  async function guardar(e) {
    e?.preventDefault(); setGuardando(true); setError('')
    try {
      const body = { ...f, cliente_id: cliente.id, items: f.items.filter((i) => i.concepto.trim()).map((i) => ({ ...i, costo: Number(i.costo) || 0 })) }
      if (!body.titulo.trim()) throw new Error('Falta el título')
      if (presupuesto) await apiPut(`/presupuestos/${presupuesto.id}`, body); else await apiPost('/presupuestos', body)
      onSaved()
    } catch (err) { setError(err.message) } finally { setGuardando(false) }
  }

  return (
    <Modal title={presupuesto ? 'Editar presupuesto' : 'Nuevo presupuesto'} subtitle={cliente.nombre} onClose={onClose} width="max-w-3xl"
      footer={<><span className="text-[12.5px] ad-muted mr-auto">Base <b className="ad-ink tabular-nums">{fmtMoney(base, f.moneda)}</b>{opc > 0 && <> · opcionales hasta <b className="ad-ink tabular-nums">{fmtMoney(opc, f.moneda)}</b></>}</span><Btn onClick={onClose}>Cancelar</Btn><Btn variant="primary" loading={guardando} onClick={guardar}>Guardar</Btn></>}>
      <form onSubmit={guardar} className="space-y-4">
        <div className="grid sm:grid-cols-[1fr_120px] gap-3">
          <Field label="Título"><input required autoFocus value={f.titulo} onChange={set('titulo')} placeholder="Ej: Sitio institucional + panel" className="ad-input" /></Field>
          <Field label="Moneda"><select value={f.moneda} onChange={set('moneda')} className="ad-input">{MONEDAS.map((m) => <option key={m}>{m}</option>)}</select></Field>
        </div>
        <Field label="Descripción (la ve el cliente)"><textarea rows={2} value={f.descripcion} onChange={set('descripcion')} className="ad-input" /></Field>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide ad-muted">Ítems</span>
            <Btn size="sm" icon={Plus} onClick={() => setF((x) => ({ ...x, items: [...x.items, itemVacio()] }))}>Agregar ítem</Btn>
          </div>
          <div className="space-y-2">
            {f.items.map((it, i) => (
              <div key={i} className="ad-card p-3 grid sm:grid-cols-[110px_1fr_120px_auto] gap-2 items-start">
                <input value={it.grupo || ''} onChange={(e) => setItem(i, 'grupo', e.target.value)} placeholder="Grupo" className="ad-input !py-1.5 text-[13px]" />
                <div className="space-y-1.5">
                  <input value={it.concepto} onChange={(e) => setItem(i, 'concepto', e.target.value)} placeholder="Concepto" className="ad-input !py-1.5 text-[13px]" />
                  <input value={it.descripcion || ''} onChange={(e) => setItem(i, 'descripcion', e.target.value)} placeholder="Descripción (opcional)" className="ad-input !py-1.5 text-[12.5px]" />
                  <label className="flex items-center gap-2 text-[12px] ad-muted cursor-pointer"><input type="checkbox" checked={!it.obligatorio} onChange={(e) => setItem(i, 'obligatorio', !e.target.checked)} /> Opcional (el cliente elige si lo incluye)</label>
                </div>
                <input type="number" min="0" step="0.01" value={it.costo} onChange={(e) => setItem(i, 'costo', e.target.value)} placeholder="Costo" className="ad-input !py-1.5 text-[13px] text-right" />
                <div className="flex sm:flex-col">
                  <IconBtn icon={ArrowUp} title="Subir" onClick={() => mover(i, -1)} disabled={i === 0} />
                  <IconBtn icon={ArrowDown} title="Bajar" onClick={() => mover(i, 1)} disabled={i === f.items.length - 1} />
                  <IconBtn icon={Trash2} tone="danger" title="Quitar" onClick={() => quitar(i)} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Field label="Notas (las ve el cliente)"><textarea rows={2} value={f.notas} onChange={set('notas')} placeholder="Condiciones, plazos, forma de pago…" className="ad-input" /></Field>
        <ErrorMsg>{error}</ErrorMsg>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

function PresupuestoVista({ id, onClose }) {
  const [p, setP] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { apiGet(`/presupuestos/${id}`).then(setP).catch((e) => setError(e.message)) }, [id])
  const m = p ? (ESTADO[p.estado] || ESTADO.borrador) : null
  const total = p ? p.items.filter((i) => i.seleccionado).reduce((a, i) => a + Number(i.costo), 0) : 0
  return (
    <Modal title={p?.titulo || 'Presupuesto'} subtitle={p && `${m.label} · versión ${p.version}`} onClose={onClose} width="max-w-2xl" footer={<Btn onClick={onClose}>Cerrar</Btn>}>
      {!p && !error && <Cargando />}
      <ErrorMsg>{error}</ErrorMsg>
      {p && (
        <div className="space-y-4">
          {p.descripcion && <p className="text-[13px] ad-muted whitespace-pre-wrap">{p.descripcion}</p>}
          <div className="ad-card divide-y divide-white/5">
            {p.items.map((i) => (
              <div key={i.id} className={`flex items-start gap-3 px-3 py-2.5 ${i.seleccionado ? '' : 'opacity-50'}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] ad-ink">{i.grupo && <span className="ad-faint text-[11px] uppercase tracking-wide mr-2">{i.grupo}</span>}{i.concepto} {!i.obligatorio && <Pill tone="gray" className="ml-1">opcional{i.seleccionado ? ' · incluido' : ' · no'}</Pill>}</p>
                  {i.descripcion && <p className="text-[12px] ad-muted">{i.descripcion}</p>}
                </div>
                <span className="text-[13px] ad-ink tabular-nums font-semibold">{fmtMoney(i.costo, p.moneda)}</span>
              </div>
            ))}
            <div className="flex justify-between px-3 py-2.5 font-bold ad-ink"><span>{p.estado === 'aprobado' ? 'Total firmado' : 'Total con la selección actual'}</span><span className="tabular-nums">{fmtMoney(p.estado === 'aprobado' ? p.firma_total : total, p.moneda)}</span></div>
          </div>
          {p.notas && <p className="text-[12.5px] ad-muted whitespace-pre-wrap">{p.notas}</p>}
          {p.firma_fecha && <p className="text-[12.5px] text-primary-300">Firmado por {p.firma_nombre} el {fmtFechaHora(p.firma_fecha)}.</p>}
        </div>
      )}
    </Modal>
  )
}
