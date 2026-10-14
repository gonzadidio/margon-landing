import { useState } from 'react'
import { ArrowUpRight, Footprints, X } from 'lucide-react'
import { Field, Kpi, NumInput, Pill } from './ui'
import { escenarios, etiquetaMesLarga, pct, usd } from './calculos'

const FUENTES = [
  ['iProfesional: sube el costo de construcción en dólares', 'https://www.iprofesional.com/realestate/448329-sube-fuerte-el-costo-de-construccion-en-dolares-cuanto-hay-que-invertir-por-m2'],
  ['iProfesional: construir en dólares (ago-2026)', 'https://www.iprofesional.com/finanzas/461604-construir-o-remodelar-en-dolares-por-que-el-metro-cuadrado-marca-maximos-y-que-conviene'],
]

// El diseñador 3D vive en Velada (otra app, con su propia contraseña): acá solo va el link.
const CASA_3D_URL = import.meta.env.VITE_CASA_3D_URL || 'https://web-production-56e395.up.railway.app/casa'

export default function Obra({ cfg, calc: c, cambiarCfg }) {
  const lista = escenarios(cfg, c)
  const n = (key, props = {}) => <NumInput id={`lt-${key}`} value={cfg[key]} onChange={(v) => cambiarCfg({ [key]: v })} {...props} />
  const sobra = c.sobra

  return (
    <>
      <Diseno3D />

      <Deseos deseos={cfg.deseos || []} cambiar={(deseos) => cambiarCfg({ deseos })} />

      <section className="lt-section">
        <div className="lt-head">
          <div>
            <span className="lt-eyebrow">Cuánto cuesta la casa</span>
            <h2 className="lt-h2" style={{ marginTop: 4 }}>{usd(c.costoCasa)}</h2>
          </div>
          <Pill tone="warn">Valores de referencia: editalos con presupuestos reales</Pill>
        </div>
        <div className="lt-card lt-card-sand">
          <div className="lt-grid lt-g4">
            <Field label="Metros cuadrados">{n('m2')}</Field>
            <Field label="Obra USD por m²">{n('usdM2')}</Field>
            <Field label="Adicionales %">{n('adicionalesPct')}</Field>
            <Field label="Entrega del terreno">
              <input id="lt-entrega" className="lt-input" type="month" value={cfg.entrega || ''} onChange={(e) => cambiarCfg({ entrega: e.target.value })} />
            </Field>
          </div>
          <p className="lt-small lt-muted" style={{ margin: '12px 0 0' }}>
            Adicionales: honorarios de proyecto y dirección, permisos, IVA, conexiones e imprevistos. Referencia: APYMECO ubicaba la obra estándar en provincia de Buenos Aires en unos USD 1.433/m² sin IVA, honorarios ni terreno; la obra tradicional media/buena ronda USD 1.000–1.500/m².{' '}
            {FUENTES.map(([t, u], i) => <span key={u}>{i ? ' · ' : ''}<a href={u} target="_blank" rel="noopener noreferrer" style={{ color: '#2b7a83' }}>{t}</a></span>)}
          </p>
        </div>
        <div className="lt-grid lt-g3">
          <Kpi label="Obra" value={usd(c.obraPura)} sub={`${cfg.m2} m² × ${usd(cfg.usdM2)}`} />
          <Kpi label="Adicionales" value={usd(c.costoCasa - c.obraPura)} sub={`${cfg.adicionalesPct}% sobre la obra`} />
          <Kpi label="Total estimado" value={usd(c.costoCasa)} accent sub="sin el terreno" />
        </div>
      </section>

      <section className="lt-section">
        <div className="lt-head">
          <div>
            <span className="lt-eyebrow">El ahorro</span>
            <h2 className="lt-h2" style={{ marginTop: 4 }}>Cuánto juntamos para la entrega</h2>
          </div>
        </div>
        <div className="lt-card lt-card-sand">
          <div className="lt-grid lt-g4" style={{ alignItems: 'end' }}>
            <Field label="Ahorrado hoy para la obra (USD)">{n('ahorroActual')}</Field>
            <Field label="Ahorro por mes (USD)">{n('ahorroMensual')}</Field>
            <Field label="Prórroga posible (meses)">{n('prorrogaMeses', { step: '1' })}</Field>
            <button type="button" className="lt-btn lt-btn-ghost" disabled={sobra == null}
              title={sobra == null ? 'Cargá la cotización en “Mes a mes”' : undefined}
              onClick={() => cambiarCfg({ ahorroMensual: Math.max(0, Math.round(sobra)) })}>
              Usar lo que sobra ({sobra == null ? '—' : usd(sobra)})
            </button>
          </div>
        </div>
        <div className="lt-grid lt-g3">
          <Kpi label={`Juntado a ${etiquetaMesLarga(c.entrega)}`} value={usd(c.juntadoEntrega)} sub={`${pct(c.juntadoEntrega, c.costoCasa)} de la casa · ${c.mesesEntrega} meses${c.cobrosEntrega.usd ? ` · con ${usd(c.cobrosEntrega.usd)} de Margon` : ''}`} />
          <Kpi label="Juntado con la prórroga" value={usd(c.juntadoProrroga)} sub={`${pct(c.juntadoProrroga, c.costoCasa)} de la casa · ${c.mesesProrroga} meses`} />
          <Kpi label="Falta para el 100%" value={usd(Math.max(0, c.costoCasa - c.juntadoEntrega))} accent sub="a la fecha de entrega" />
        </div>
      </section>

      <section className="lt-section">
        <div className="lt-head">
          <div>
            <span className="lt-eyebrow">Arrancando en la entrega</span>
            <h2 className="lt-h2" style={{ marginTop: 4 }}>Construir sin tener el 100%</h2>
          </div>
        </div>
        <p className="lt-muted" style={{ margin: 0, maxWidth: '70ch' }}>
          Cada opción muestra cuánta plata hace falta para arrancar y cuánto hay que poner por mes durante la obra, comparado con su ahorro mensual. La cuota del lote ({usd(c.valorCuota)}) sigue corriendo mientras construyen y ya está descontada.
        </p>
        <div className="lt-grid lt-g2">
          {lista.map((e) => (
            <article key={e.id} className={`lt-scen${e.cierra ? ' is-fit' : ''}`}>
              <div className="lt-head" style={{ alignItems: 'center' }}>
                <h3 className="lt-h3">{e.titulo}</h3>
                {!c.ahorroMes ? <Pill tone="warn">Cargá el ahorro</Pill> : e.cierra ? <Pill tone="ok">Les cierra</Pill> : <Pill tone="no">No cierra todavía</Pill>}
              </div>
              <p className="lt-small lt-muted" style={{ margin: 0 }}>{e.detalle}</p>
              <div className="lt-row"><span>Para arrancar</span><span>{usd(e.inicial)}</span></div>
              <div className="lt-row"><span>Tienen a la entrega</span><span>{usd(c.juntadoEntrega)}</span></div>
              {e.mensual > 0 && <div className="lt-row"><span>Por mes durante la obra <span className="lt-muted">({e.nota})</span></span><span>{usd(e.mensual)}</span></div>}
              {c.ahorroMes > 0 && (
                <div className="lt-row">
                  <span>{e.alcanzaInicio ? 'Les sobra al arrancar' : 'Les falta al arrancar'}</span>
                  <span style={{ color: e.alcanzaInicio ? '#2b7a83' : '#c71d2a' }}>{usd(e.alcanzaInicio ? e.sobraInicio : e.faltaInicio)}</span>
                </div>
              )}
              {c.ahorroMes > 0 && e.mensual > 0 && !e.alcanzaMes && (
                <div className="lt-row"><span>La cuota supera su ahorro por</span><span style={{ color: '#c71d2a' }}>{usd(e.excesoMes)} / mes</span></div>
              )}
              {e.params.length > 0 && (
                <div className="lt-params">
                  {e.params.map((p) => <Field key={p.key} label={p.label}>{n(p.key)}</Field>)}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

// Tarjeta que abre el diseñador 3D del lote en otra pestaña.
function Diseno3D() {
  return (
    <section className="lt-3d" aria-labelledby="lt-3d-t">
      <div className="lt-hero-ripple" aria-hidden="true" />
      <div className="lt-3d-txt">
        <span className="lt-eyebrow">Lote 137 en 3D</span>
        <h2 id="lt-3d-t" className="lt-3d-h">Diseñala en 3D y recorrela</h2>
        <p>Dibujamos las paredes sobre el terreno real, con sus retiros, sumamos la planta alta y después la caminamos por adentro como si ya estuviera hecha. Funciona también en el celu.</p>
        <a className="lt-btn lt-3d-btn" href={CASA_3D_URL} target="_blank" rel="noopener noreferrer">
          Abrir el diseño 3D <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <span className="lt-small lt-3d-nota"><Footprints size={14} aria-hidden="true" /> Se abre en otra pestaña y pide su propia contraseña.</span>
      </div>
      <svg className="lt-3d-art" viewBox="0 0 260 190" role="img" aria-label="Dibujo de una casa sobre el terreno">
        <path d="M18 128 L130 72 L242 128 L130 184 Z" fill="#eef3e2" stroke="#c9d9a8" />
        <path d="M58 128 L130 92 L202 128 L130 164 Z" fill="none" stroke="#3fa1ac" strokeDasharray="4 4" opacity=".55" />
        <path d="M84 120 L84 86 L130 63 L130 97 Z" fill="#ffffff" stroke="#2b7a83" />
        <path d="M130 97 L130 63 L176 86 L176 120 Z" fill="#e3f3f4" stroke="#2b7a83" />
        <path d="M84 120 L130 97 L176 120 L130 143 Z" fill="#f6f1e7" stroke="#2b7a83" />
        <path d="M78 89 L130 36 L182 89 L130 66 Z" fill="#3fa1ac" stroke="#2b7a83" />
        <path d="M100 104 L100 91 L112 85 L112 98 Z" fill="#e3f3f4" stroke="#2b7a83" />
        <path d="M146 104 L146 84 L158 90 L158 110 Z" fill="#ffffff" stroke="#2b7a83" />
        <circle cx="212" cy="40" r="13" fill="#f3d9a0" className="lt-sol" />
        <circle cx="46" cy="140" r="9" fill="#c9d9a8" /><circle cx="214" cy="146" r="11" fill="#c9d9a8" />
      </svg>
    </section>
  )
}

const IDEAS = ['Galería con parrilla', 'Pileta', 'Cocina abierta', 'Escritorio para trabajar', 'Cuarto de invitados', 'Huerta', 'Hogar a leña', 'Jardín con árboles']

// Cómo la imaginamos: la lista de lo que queremos que tenga la casa.
function Deseos({ deseos, cambiar }) {
  const [nuevo, setNuevo] = useState('')
  const igual = (a, b) => a.toLowerCase() === b.toLowerCase()
  const agregar = (t) => {
    const v = t.trim()
    if (!v || deseos.some((d) => igual(d, v))) return
    cambiar([...deseos, v])
    setNuevo('')
  }
  const sugeridas = IDEAS.filter((i) => !deseos.some((d) => igual(d, i)))
  return (
    <section className="lt-section lt-deseos">
      <div className="lt-head">
        <div>
          <span className="lt-eyebrow">Lo que soñamos</span>
          <h2 className="lt-h2" style={{ marginTop: 4 }}>Cómo la imaginamos</h2>
        </div>
      </div>
      <div className="lt-chips">
        {deseos.length === 0 && <span className="lt-muted lt-small">Todavía no anotamos nada. Empiecen por lo que no puede faltar.</span>}
        {deseos.map((d) => (
          <span key={d} className="lt-chip">{d}
            <button type="button" aria-label={`Sacar ${d}`} onClick={() => cambiar(deseos.filter((x) => x !== d))}><X size={13} /></button>
          </span>
        ))}
      </div>
      <form className="lt-deseos-form" onSubmit={(e) => { e.preventDefault(); agregar(nuevo) }}>
        <input id="lt-deseo" className="lt-input" value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder="Ej: tres dormitorios, mucha luz, un deck mirando al verde" />
        <button className="lt-btn" type="submit">Sumar</button>
      </form>
      {sugeridas.length > 0 && (
        <div className="lt-chips">
          <span className="lt-small lt-muted">Ideas:</span>
          {sugeridas.slice(0, 6).map((i) => <button key={i} type="button" className="lt-chip lt-chip-idea" onClick={() => agregar(i)}>+ {i}</button>)}
        </div>
      )}
    </section>
  )
}
