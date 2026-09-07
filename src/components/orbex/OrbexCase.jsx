import { Fragment, useEffect, useState } from 'react'
import {
  ArrowLeft, ArrowRight, ArrowDown, Check,
  Users, DollarSign, Megaphone, Share2,
} from 'lucide-react'
import Logo from '../Logo'
import { useDynamicFavicon } from '../../hooks/useDynamicFavicon'
import {
  hero, desafio, funcionalidades, sistema, mock,
} from './contenido'

const iconosFlujo = [Megaphone, Share2, Users, DollarSign]

/** Caso de estudio de ORBEX Desarrollos */
export default function OrbexCase() {
  useDynamicFavicon('/logo2.png')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="cs">
      <header className="cs-header">
        <div className="cs-container cs-header-inner">
          <a href="/" className="flex items-center">
            <Logo src="/logo.png" alt="MarGon Software" className="h-9 w-auto" />
          </a>
          <a href="/#proyectos" className="cs-back">
            <ArrowLeft size={15} /> Volver a proyectos
          </a>
        </div>
      </header>

      <main>
        <Hero />
        <Desafio />
        <Funcionalidades />
        <Sistema />
        <Cierre />
      </main>
    </div>
  )
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="cs-hero">
      <span className="cs-ghost" aria-hidden="true">{hero.titulo}</span>

      <div className="cs-container cs-hero-grid">
        <div>
          <span className="cs-eyebrow">{hero.eyebrow}</span>
          <h1 className="cs-h1">
            {hero.titulo}
            <span>{hero.subtitulo}</span>
          </h1>
          <p className="cs-hero-bajada">{hero.bajada}</p>

          <div className="cs-stack">
            {hero.stack.map((t) => <span key={t}>{t}</span>)}
          </div>

          <a href="#funcionalidades" className="cs-text-cta">
            Ver funcionalidades
            <i><ArrowDown size={13} /></i>
          </a>
        </div>

        <div className="cs-hero-visual">
          {hero.img
            ? <img src={hero.img} alt="Panel del sistema ORBEX" className="cs-hero-img" />
            : <PanelMock />}
        </div>
      </div>
    </section>
  )
}

/* ---------- Desafío ---------- */

function Desafio() {
  return (
    <section className="cs-section">
      <div className="cs-container">
        <div className="cs-desafio">
          <div>
            <span className="cs-section-num">El</span>
            <h2 className="cs-display">Desafío</h2>
            <span className="cs-regla" />
          </div>

          <div>
            <p className="cs-parrafo">{desafio.texto}</p>
            <ul className="cs-checks">
              {desafio.puntos.map((p) => (
                <li key={p}><i><Check size={11} strokeWidth={3} /></i>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="cs-flujo">
          {desafio.flujo.map((paso, i) => {
            const Icono = iconosFlujo[i] ?? Users
            return (
              <Fragment key={paso.titulo}>
                {i > 0 && <div className="cs-flujo-conector"><span /></div>}
                <div className="cs-flujo-paso">
                  <div className="cs-flujo-top">
                    <span className="cs-flujo-num">{String(i + 1).padStart(2, '0')}</span>
                    <div className="cs-flujo-circulo">
                      <Icono size={38} strokeWidth={1.4} aria-hidden="true" />
                    </div>
                  </div>
                  <h3>{paso.titulo}</h3>
                  <p>{paso.detalle}</p>
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- Funcionalidades ---------- */

const visuales = {
  tabla: TablaLeads,
  reparto: RepartoMock,
  embudo: EmbudoMock,
  expediente: ExpedienteMock,
  firmas: FirmasMock,
  cuotas: CuotasMock,
}

function Funcionalidades() {
  return (
    <section id="funcionalidades" className="cs-section cs-section-funcionalidades">
      <div className="cs-container">
        {funcionalidades.map((f, i) => {
          const invertido = i % 2 === 1
          return (
            <article key={f.n} className={`cs-feature ${invertido ? 'cs-feature-inv' : ''}`}>
              <div className="cs-feature-copy">
                <span className="cs-feature-num">{f.n}</span>
                <h3>{f.titulo[0]}<br />{f.titulo[1]}</h3>
                <p>{f.texto}</p>
              </div>

              <div className="cs-feature-visual">
                <VisualFeature f={f} />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

/**
 * Muestra la captura real si está cargada; si falta el archivo (o falla la
 * carga) cae al mockup en CSS, para no dejar una imagen rota en la página.
 * El campo img acepta una ruta o un array: en ese caso las apila.
 */
function VisualFeature({ f }) {
  const Mock = visuales[f.visual]
  const [falla, setFalla] = useState(false)
  const capturas = f.img ? [f.img].flat() : []

  if (!capturas.length || falla) return <Mock />

  return (
    <div className={`cs-capturas ${capturas.length > 2 ? 'cs-capturas-cols' : ''}`}>
      {capturas.map((src) => (
        <img
          key={src}
          src={src}
          alt={f.titulo.join(' ')}
          loading="lazy"
          onError={() => setFalla(true)}
        />
      ))}
    </div>
  )
}

function TablaLeads() {
  return (
    <div className="cs-tabla">
      <div className="cs-tabla-head"><strong>Leads nuevos</strong></div>
      <div className="cs-fila cs-fila-head">
        <span>Nombre</span><span>Fuente</span><span>Campaña</span><span>Hora</span><span>Estado</span>
      </div>
      {mock.leads.map((l) => (
        <div key={l.nombre} className="cs-fila">
          <span>{l.nombre}</span>
          <span>{l.fuente}</span>
          <span>{l.campania}</span>
          <span>{l.hora}</span>
          <em>Nuevo</em>
        </div>
      ))}
    </div>
  )
}

function RepartoMock() {
  return (
    <div className="cs-reparto">
      <div className="cs-panel">
        <span className="cs-panel-titulo">Distribución de leads</span>
        {mock.equipos.map((e) => (
          <div key={e.nombre} className="cs-equipo">
            <b>{e.nombre}</b>
            <div><i style={{ width: `${e.pct}%` }} /></div>
            <small>{e.leads}</small>
          </div>
        ))}
      </div>

      <div className="cs-panel">
        <span className="cs-panel-titulo">Lead asignado</span>
        <div className="cs-lead">
          <div className="cs-avatar">MP</div>
          <div>
            <strong>Martina Pérez</strong>
            <span>Origen: campaña</span>
          </div>
        </div>
        <div className="cs-lead-meta">
          <div><small>Asignado a</small><b>Equipo Norte</b></div>
          <div><small>Asesor</small><b>Sofía Gómez</b></div>
        </div>
      </div>
    </div>
  )
}

function EmbudoMock() {
  return (
    <div className="cs-embudo">
      {mock.embudo.map((e) => (
        <div key={e.etapa} className="cs-embudo-card">
          <small>{e.etapa}</small>
          <strong>{e.valor}</strong>
        </div>
      ))}
    </div>
  )
}

function ExpedienteMock() {
  const { codigo, cliente, lote, docs, etapas } = mock.expediente
  return (
    <div className="cs-reparto">
      <div className="cs-panel">
        <span className="cs-panel-titulo">Documentación · {codigo}</span>
        <ul className="cs-docs">
          {docs.map((d) => (
            <li key={d.nombre} className={d.ok ? 'cs-doc-ok' : ''}>
              <i>{d.ok && <Check size={9} strokeWidth={3.5} />}</i>
              {d.nombre}
            </li>
          ))}
        </ul>
      </div>

      <div className="cs-panel">
        <span className="cs-panel-titulo">{cliente} · {lote}</span>
        <ol className="cs-etapas">
          {etapas.map((e) => (
            <li key={e.nombre} className={`cs-etapa cs-etapa-${e.estado}`}>
              <i />
              <span>{e.nombre}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function FirmasMock() {
  return (
    <div className="cs-tabla">
      <div className="cs-tabla-head"><strong>Firmas programadas</strong></div>
      <div className="cs-fila cs-fila-firmas cs-fila-head">
        <span>Cliente</span><span>Lote</span><span>Fecha</span><span>Estado</span>
      </div>
      {mock.firmas.map((f) => (
        <div key={f.cliente} className="cs-fila cs-fila-firmas">
          <span>{f.cliente}</span>
          <span>{f.lote}</span>
          <span>{f.fecha}</span>
          <em className={`cs-chip-${f.tono}`}>{f.estado}</em>
        </div>
      ))}
    </div>
  )
}

function CuotasMock() {
  const { cliente, plan, resumen, filas } = mock.cuotas
  return (
    <div className="cs-panel">
      <span className="cs-panel-titulo">{cliente} · {plan}</span>

      <div className="cs-cuotas-resumen">
        {resumen.map((r) => (
          <div key={r.label}>
            <strong>{r.valor}</strong>
            <small>{r.label}</small>
          </div>
        ))}
      </div>

      <div className="cs-cuotas-lista">
        {filas.map((f) => (
          <div key={f.numero} className="cs-cuota">
            <b>{f.numero}</b>
            <small>Vence {f.vence}</small>
            <em className={`cs-chip-${f.tono}`}>{f.estado}</em>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- El sistema ---------- */

function Sistema() {
  return (
    <section className="cs-section cs-sistema-seccion">
      <span className="cs-ghost" aria-hidden="true">{hero.titulo}</span>

      <div className="cs-container cs-sistema">
        <h2>
          <span>{sistema.titulo}</span>
          <b>{sistema.destacado}</b>
        </h2>
      </div>
    </section>
  )
}

/** Mockup del panel. Placeholder hasta tener las capturas reales. */
function PanelMock({ conGraficos = false }) {
  return (
    <div className={`cs-panel-mock ${conGraficos ? 'cs-panel-mock-full' : ''}`}>
      <aside className="cs-mock-side">
        <div className="cs-mock-logo">O</div>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={i === 0 ? 'cs-mock-item cs-mock-item-on' : 'cs-mock-item'} />
        ))}
      </aside>

      <div className="cs-mock-main">
        <div className="cs-mock-metricas">
          {mock.metricas.map((m) => (
            <div key={m.label} className="cs-mock-metrica">
              <small>{m.label}</small>
              <strong>{m.valor}</strong>
              <span>{m.delta}</span>
            </div>
          ))}
        </div>

        {conGraficos && (
          <div className="cs-mock-graficos">
            <div className="cs-mock-barras">
              {mock.barras.map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
            </div>
            <div className="cs-mock-conversion">
              <strong>{mock.conversion}</strong>
              <small>Conversión general</small>
              <svg viewBox="0 0 250 80" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="0,65 25,60 50,63 75,47 100,51 125,36 150,42 175,28 200,30 225,17 250,9" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Cierre ---------- */

function Cierre() {
  return (
    <section className="cs-cierre">
      <div className="cs-cierre-patron" aria-hidden="true" />
      <div className="cs-container cs-cierre-content">
        <h2>¿Tu <span className="gradient-text">negocio</span> necesita<br />algo parecido?</h2>
        <p>Diseñamos sistemas adaptados a cómo trabaja tu empresa.</p>
        <div className="cs-cierre-botones">
          <a href="/#contacto" className="cs-btn cs-btn-primario">
            Contanos tu proyecto <ArrowRight size={15} />
          </a>
          <a href="/#proyectos" className="cs-btn cs-btn-outline">Ver otros proyectos</a>
        </div>
      </div>
    </section>
  )
}
