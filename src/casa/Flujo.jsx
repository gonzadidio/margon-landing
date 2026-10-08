import { useState } from 'react'
import { BorrarBtn, Field, Kpi, NumInput, Pill, useToast } from './ui'
import { ambas, cuotaEnMes, esEnCuotas, etiquetaMesLarga, fechaCorta, finDeCuotas, mesesEntre, plata, sumar, usd } from './calculos'

const VACIO = { tipo: 'ingreso', quien: 'Gonza', concepto: '', monto: '', moneda: 'USD', enCuotas: false, cuotas_total: '', cuota_desde: '' }
const VACIO_COBRO = { origen: 'Margon', concepto: '', monto: '', moneda: 'USD', fecha: '' }

export default function Flujo({ cfg, calc: c, estado, cambiarCfg, accion, api }) {
  const [form, setForm] = useState(VACIO)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    const datos = {
      tipo: form.tipo, quien: form.quien, concepto: form.concepto, monto: Number(form.monto), moneda: form.moneda,
      ...(form.tipo === 'gasto' && form.enCuotas ? { cuotas_total: Number(form.cuotas_total), cuota_desde: form.cuota_desde } : {}),
    }
    const ok = await accion(() => api.crearFlujo(datos), form.tipo === 'ingreso' ? 'Ingreso agregado' : 'Gasto agregado')
    if (ok) setForm((f) => ({ ...VACIO, tipo: f.tipo, quien: f.quien }))
  }

  const porPersona = ['Gonza', 'Martina'].map((q) => ({
    quien: q,
    ingresos: sumar(estado.flujo, c.tc, (x) => x.quien === q && x.tipo === 'ingreso'),
  }))
  const ingresos = estado.flujo.filter((x) => x.tipo === 'ingreso')
  const fijos = estado.flujo.filter((x) => x.tipo === 'gasto' && !esEnCuotas(x))
  const cuotas = estado.flujo.filter(esEnCuotas)
  const cuotasHoy = sumar(cuotas, c.tc, (x) => cuotaEnMes(x, c.hoy) != null)

  return (
    <>
      <section className="lt-section">
        <div className="lt-head">
          <div>
            <span className="lt-eyebrow">Lo que entra y lo que sale cada mes</span>
            <h2 className="lt-h2" style={{ marginTop: 4 }}>Mes a mes</h2>
          </div>
        </div>

        <div className="lt-grid lt-g3">
          <Kpi label="Entra por mes" value={ambas(c.ingresos)} sub={c.tc && c.ingresos.ars ? `≈ ${usd(c.ingresos.total)}` : null} />
          <Kpi label="Sale por mes" value={ambas({ usd: c.gastos.usd + c.cuotaLoteMes, ars: c.gastos.ars })}
            sub={`incluye la cuota del lote (${usd(c.cuotaLoteMes)})${cuotasHoy.usd || cuotasHoy.ars ? ` y ${ambas(cuotasHoy)} en cuotas` : ''}`} />
          <Kpi label="Nos sobra para ahorrar" accent
            value={c.sobra != null ? usd(c.sobra) : ambas({ usd: c.sobraUsd, ars: c.sobraArs })}
            sub={c.sobra == null ? 'Cargá la cotización para sumarlo todo en dólares' : 'por mes, después de la cuota del lote'} />
        </div>

        <div className="lt-grid lt-g2">
          {porPersona.map((p) => (
            <div key={p.quien} className="lt-card lt-card-sand">
              <span className="lt-eyebrow">{p.quien === 'Martina' ? 'Martu' : p.quien}</span>
              <div className="lt-kpi-v" style={{ fontSize: 22, marginTop: 6 }}>{p.ingresos.usd || p.ingresos.ars ? ambas(p.ingresos) : '—'}</div>
              {!(p.ingresos.usd || p.ingresos.ars) && <div className="lt-note">Todavía no cargó ingresos.</div>}
            </div>
          ))}
        </div>

        <form className="lt-form" onSubmit={enviar}>
          <Field label="Tipo">
            <select id="f-tipo" className="lt-input" value={form.tipo} onChange={set('tipo')}><option value="ingreso">Ingreso</option><option value="gasto">Gasto</option></select>
          </Field>
          <Field label="De quién">
            <select id="f-quien" className="lt-input" value={form.quien} onChange={set('quien')}><option>Gonza</option><option value="Martina">Martu</option><option>Ambos</option></select>
          </Field>
          <Field label="Concepto" className="lt-span2"><input id="f-concepto" className="lt-input" required value={form.concepto} onChange={set('concepto')} placeholder={form.tipo === 'ingreso' ? 'Ej: Sueldo' : 'Ej: Alquiler, prepaga, heladera en cuotas'} /></Field>
          <Field label={form.tipo === 'gasto' && form.enCuotas ? 'Valor de cada cuota' : 'Por mes'}><input id="f-monto" className="lt-input lt-num" type="number" step="any" min="0" inputMode="decimal" required value={form.monto} onChange={set('monto')} /></Field>
          <Field label="Moneda">
            <select id="f-moneda" className="lt-input" value={form.moneda} onChange={set('moneda')}><option>USD</option><option>ARS</option></select>
          </Field>
          {form.tipo === 'gasto' && (
            <label className="lt-check lt-span2">
              <input id="f-encuotas" type="checkbox" checked={form.enCuotas} onChange={set('enCuotas')} />
              Es en cuotas (tarjeta, préstamo…)
            </label>
          )}
          {form.tipo === 'gasto' && form.enCuotas && (
            <>
              <Field label="Cantidad de cuotas"><input id="f-cuotas" className="lt-input lt-num" type="number" min="1" step="1" required value={form.cuotas_total} onChange={set('cuotas_total')} /></Field>
              <Field label="Mes de la cuota 1"><input id="f-desde" className="lt-input" type="month" required value={form.cuota_desde} onChange={set('cuota_desde')} /></Field>
            </>
          )}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}><button className="lt-btn" type="submit">Agregar</button></div>
        </form>

        <Tabla titulo="Ingresos" vacio="Cargá los sueldos de los dos." items={ingresos} accion={accion} api={api}
          render={(x) => <><td>{nombre(x.quien)}</td><td>{x.concepto}</td><td className="r lt-num">{plata(x.monto, x.moneda)}</td></>}
          cols={['De quién', 'Concepto', 'Por mes']} />
        <Tabla titulo="Gastos fijos" vacio="Alquiler, servicios, prepaga, colegio… lo que se paga todos los meses." items={fijos} accion={accion} api={api}
          render={(x) => <><td>{nombre(x.quien)}</td><td>{x.concepto}</td><td className="r lt-num">− {plata(x.monto, x.moneda)}</td></>}
          cols={['De quién', 'Concepto', 'Por mes']} />
        <Tabla titulo="Gastos en cuotas" vacio="Compras en cuotas o préstamos: cuando terminan, esa plata pasa al ahorro." items={cuotas} accion={accion} api={api}
          render={(x) => {
            const k = cuotaEnMes(x, c.hoy)
            const fin = finDeCuotas(x)
            const terminado = !k && mesesEntre(c.hoy, fin) < 0
            return (
              <>
                <td>{nombre(x.quien)}</td>
                <td>{x.concepto}<div className="lt-note">{terminado ? 'Terminado' : k ? `Cuota ${k} de ${x.cuotas_total} · termina en ${etiquetaMesLarga(fin)}` : `Arranca en ${etiquetaMesLarga(sumarDesde(x))}`}</div></td>
                <td className="r lt-num">− {plata(x.monto, x.moneda)}{k ? <div className="lt-note">quedan {plata(x.monto * (x.cuotas_total - k), x.moneda)}</div> : null}</td>
              </>
            )
          }}
          cols={['De quién', 'Concepto', 'Por cuota']} />

        <div className="lt-card lt-card-sand">
          <div className="lt-grid lt-g3" style={{ alignItems: 'end' }}>
            <Field label="Cotización (pesos por 1 dólar)">
              <NumInput id="lt-tc" value={cfg.tc} onChange={(v) => cambiarCfg({ tc: v })} placeholder="Ej: el MEP de hoy" />
            </Field>
            <p className="lt-small lt-muted" style={{ margin: 0, gridColumn: 'span 2' }}>
              Sin cotización, los pesos se muestran aparte y no se mezclan con los dólares. Actualizala cuando quieran: todas las cuentas se recalculan.
            </p>
          </div>
        </div>
      </section>

      <PorCobrar cfg={cfg} c={c} estado={estado} cambiarCfg={cambiarCfg} accion={accion} api={api} />
    </>
  )
}

const nombre = (q) => (q === 'Martina' ? 'Martu' : q)
const sumarDesde = (x) => { const [y, m] = x.cuota_desde.split('-').map(Number); return { y, m } }

function Tabla({ titulo, vacio, items, cols, render, accion, api }) {
  return (
    <div className="lt-section" style={{ gap: 10 }}>
      <h3 className="lt-h3">{titulo}</h3>
      <div className="lt-tablewrap">
        <table className="lt-table">
          <thead><tr>{cols.map((h, i) => <th key={h} className={i === cols.length - 1 ? 'r' : undefined}>{h}</th>)}<th aria-label="Acciones" /></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={cols.length + 1} className="lt-empty">{vacio}</td></tr>}
            {items.map((x) => (
              <tr key={x.id}>{render(x)}<td className="r"><BorrarBtn onConfirm={() => accion(() => api.borrarFlujo(x.id), 'Borrado')} /></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Lo que va a entrar de Margon (cuotas de desarrollos). Al marcarlo cobrado, pasa al ahorro.
function PorCobrar({ cfg, c, estado, cambiarCfg, accion, api }) {
  const toast = useToast()
  const [form, setForm] = useState(VACIO_COBRO)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const lista = estado.porCobrar || []

  async function enviar(e) {
    e.preventDefault()
    const ok = await accion(() => api.crearPorCobrar({ ...form, monto: Number(form.monto), fecha: form.fecha || null }), 'Cobro agregado')
    if (ok) setForm(VACIO_COBRO)
  }

  async function toggle(p) {
    const cobrado = !p.cobrado
    if (p.moneda === 'ARS' && !c.tc) { toast('Cargá la cotización para pasar pesos al ahorro', true); return }
    let cambio = false
    const ok = await accion(async () => { cambio = (await api.marcarCobrado(p.id, cobrado)).cambio }, cobrado ? `¡Entró ${plata(p.monto, p.moneda)}! Va al ahorro` : 'Desmarcado')
    if (ok && cambio) {
      const enUsd = p.moneda === 'ARS' ? p.monto / c.tc : p.monto
      cambiarCfg({ ahorroActual: Math.max(0, Math.round((Number(cfg.ahorroActual) || 0) + (cobrado ? enUsd : -enUsd))) })
    }
  }

  return (
    <section className="lt-section">
      <div className="lt-head">
        <div>
          <span className="lt-eyebrow">Lo que va a entrar de Margon</span>
          <h2 className="lt-h2" style={{ marginTop: 4 }}>{ambas(c.porCobrarTotal)} por cobrar</h2>
        </div>
        <span className="lt-small lt-muted">De eso, {ambas(c.cobrosEntrega)} entra antes de la entrega</span>
      </div>
      <p className="lt-muted lt-small" style={{ margin: 0, maxWidth: '70ch' }}>
        Cuotas de desarrollos que nos deben. Cada una suma al ahorro el mes en que vence. Cuando la cobren, márquenla: pasa sola a “Ahorrado hoy”.
        {c.porCobrarSinFecha.usd || c.porCobrarSinFecha.ars ? ` Hay ${ambas(c.porCobrarSinFecha)} sin fecha que todavía no cuentan en la proyección.` : ''}
      </p>
      <div className="lt-tablewrap">
        <table className="lt-table">
          <thead><tr><th>Cobrado</th><th>Vence</th><th>De</th><th>Concepto</th><th className="r">Monto</th><th aria-label="Acciones" /></tr></thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={6} className="lt-empty">No hay nada por cobrar cargado.</td></tr>}
            {lista.map((p) => (
              <tr key={p.id} style={p.cobrado ? { opacity: .55 } : undefined}>
                <td><input type="checkbox" className="lt-checkbox" checked={p.cobrado} onChange={() => toggle(p)} aria-label={`Marcar ${p.concepto} como cobrado`} /></td>
                <td className="lt-num" style={{ whiteSpace: 'nowrap' }}>{fechaCorta(p.fecha) || <Pill tone="warn">a coordinar</Pill>}</td>
                <td>{p.origen}</td>
                <td>{p.concepto}</td>
                <td className="r lt-num">{plata(p.monto, p.moneda)}</td>
                <td className="r"><BorrarBtn onConfirm={() => accion(() => api.borrarPorCobrar(p.id), 'Borrado')} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="lt-form" onSubmit={enviar}>
        <Field label="De">
          <input id="pc-origen" className="lt-input" value={form.origen} onChange={set('origen')} />
        </Field>
        <Field label="Concepto" className="lt-span2"><input id="pc-concepto" className="lt-input" required value={form.concepto} onChange={set('concepto')} placeholder="Ej: Orbex · cuota 3/3" /></Field>
        <Field label="Monto"><input id="pc-monto" className="lt-input lt-num" type="number" step="any" min="0" inputMode="decimal" required value={form.monto} onChange={set('monto')} /></Field>
        <Field label="Moneda">
          <select id="pc-moneda" className="lt-input" value={form.moneda} onChange={set('moneda')}><option>USD</option><option>ARS</option></select>
        </Field>
        <Field label="Vence"><input id="pc-fecha" className="lt-input" type="date" value={form.fecha} onChange={set('fecha')} /></Field>
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}><button className="lt-btn" type="submit">Agregar cobro</button></div>
      </form>
    </section>
  )
}
