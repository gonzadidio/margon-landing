import { useMemo, useState } from 'react'
import { Pencil } from 'lucide-react'
import { BorrarBtn, Field } from './ui'
import { ambas, fechaCorta, plata, sumar, usd } from './calculos'

const CATEGORIAS = ['Terreno', 'Impuestos', 'Escribanía', 'Obra', 'Proyecto', 'Otro']
const VACIO = { concepto: '', monto: '', moneda: 'USD', categoria: 'Terreno', fecha: '', quien: 'Ambos', nota: '' }

export default function Gastos({ calc: c, estado, accion, api }) {
  const [form, setForm] = useState(VACIO)
  const [editando, setEditando] = useState(null)
  const [filtro, setFiltro] = useState('Todas')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const lista = useMemo(() => estado.movimientos.filter((m) => filtro === 'Todas' || m.categoria === filtro), [estado.movimientos, filtro])
  const total = sumar(lista, c.tc)
  const categorias = ['Todas', ...new Set(estado.movimientos.map((m) => m.categoria))]

  async function enviar(e) {
    e.preventDefault()
    const datos = { ...form, monto: Number(form.monto), fecha: form.fecha || null }
    const ok = editando
      ? await accion(() => api.editarMovimiento(editando, datos), 'Gasto actualizado')
      : await accion(() => api.crearMovimiento(datos), 'Gasto agregado')
    if (ok) { setForm(VACIO); setEditando(null) }
  }

  function editar(m) {
    setEditando(m.id)
    setForm({ concepto: m.concepto, monto: String(m.monto), moneda: m.moneda, categoria: m.categoria, fecha: m.fecha || '', quien: m.quien, nota: m.nota || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="lt-section">
      <div className="lt-head">
        <div>
          <span className="lt-eyebrow">Todo lo que pagamos</span>
          <h2 className="lt-h2" style={{ marginTop: 4 }}>{ambas(c.pagado)}</h2>
        </div>
        {c.pagado.ars > 0 && c.tc && <span className="lt-muted lt-small">≈ {usd(c.pagado.total)} en total</span>}
      </div>

      <form className="lt-form" onSubmit={enviar}>
        <Field label="Concepto" className="lt-span2"><input id="g-concepto" className="lt-input" required value={form.concepto} onChange={set('concepto')} placeholder="Ej: Honorarios del arquitecto" /></Field>
        <Field label="Monto"><input id="g-monto" className="lt-input lt-num" type="number" step="any" min="0" inputMode="decimal" required value={form.monto} onChange={set('monto')} /></Field>
        <Field label="Moneda">
          <select id="g-moneda" className="lt-input" value={form.moneda} onChange={set('moneda')}><option>USD</option><option>ARS</option></select>
        </Field>
        <Field label="Categoría">
          <select id="g-categoria" className="lt-input" value={form.categoria} onChange={set('categoria')}>{CATEGORIAS.map((x) => <option key={x}>{x}</option>)}</select>
        </Field>
        <Field label="Fecha"><input id="g-fecha" className="lt-input" type="date" value={form.fecha} onChange={set('fecha')} /></Field>
        <Field label="Pagó">
          <select id="g-quien" className="lt-input" value={form.quien} onChange={set('quien')}><option>Ambos</option><option>Gonza</option><option>Martina</option></select>
        </Field>
        <Field label="Nota" className="lt-span3"><input id="g-nota" className="lt-input" value={form.nota} onChange={set('nota')} placeholder="Opcional" /></Field>
        <div style={{ display: 'flex', gap: 8, gridColumn: 'span 2', justifyContent: 'flex-end' }}>
          {editando && <button type="button" className="lt-btn lt-btn-ghost" onClick={() => { setEditando(null); setForm(VACIO) }}>Cancelar</button>}
          <button className="lt-btn" type="submit">{editando ? 'Guardar cambios' : 'Agregar gasto'}</button>
        </div>
      </form>

      <div className="lt-seg" role="group" aria-label="Filtrar por categoría">
        {categorias.map((x) => <button key={x} type="button" aria-pressed={filtro === x} onClick={() => setFiltro(x)}>{x}</button>)}
      </div>

      <div className="lt-tablewrap">
        <table className="lt-table">
          <thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Pagó</th><th className="r">Monto</th><th aria-label="Acciones" /></tr></thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={6} className="lt-empty">No hay gastos en esta categoría. Cargá el primero con el formulario de arriba.</td></tr>}
            {lista.map((m) => (
              <tr key={m.id}>
                <td className="lt-num" style={{ whiteSpace: 'nowrap' }}>{fechaCorta(m.fecha) || <span className="lt-muted">sin fecha</span>}</td>
                <td>{m.concepto}{m.nota && <div className="lt-note">{m.nota}</div>}</td>
                <td><span className="lt-tag">{m.categoria}</span></td>
                <td>{m.quien}</td>
                <td className="r lt-num">{plata(m.monto, m.moneda)}</td>
                <td className="r" style={{ whiteSpace: 'nowrap' }}>
                  {!m.cuota_n && <button type="button" className="lt-icon" aria-label="Editar" title="Editar" onClick={() => editar(m)}><Pencil size={16} /></button>}
                  <BorrarBtn onConfirm={() => (m.cuota_n ? accion(() => api.desmarcarCuota(m.cuota_n), 'Cuota desmarcada') : accion(() => api.borrarMovimiento(m.id), 'Gasto borrado'))} />
                </td>
              </tr>
            ))}
          </tbody>
          {lista.length > 0 && (
            <tfoot><tr><td colSpan={4}>Total {filtro !== 'Todas' ? filtro.toLowerCase() : ''}</td><td className="r lt-num">{ambas(total)}</td><td /></tr></tfoot>
          )}
        </table>
      </div>
    </section>
  )
}
