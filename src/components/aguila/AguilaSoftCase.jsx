import { useEffect } from 'react'
import {
  ArrowLeft, ArrowRight,
  MonitorSmartphone, MessageCircle, Layers, Sparkles, Zap, PhoneOff,
  Receipt, Tags, Package, ClipboardList,
} from 'lucide-react'
import Logo from '../Logo'
import { useDynamicFavicon } from '../../hooks/useDynamicFavicon'
import { marca, hero, barra, problema, caracteristicas, resultado, cierre } from './contenido'

const iconos = {
  portal: MonitorSmartphone,
  whatsapp: MessageCircle,
  multiempresa: Layers,
  ia: Sparkles,
  rayo: Zap,
  llamados: PhoneOff,
  cuenta: Receipt,
  lista: Tags,
  stock: Package,
  pedido: ClipboardList,
}

const Icono = ({ nombre, ...props }) => {
  const C = iconos[nombre] ?? Layers
  return <C {...props} />
}

/** Caso de estudio de AguilaSoft */
export default function AguilaSoftCase() {
  useDynamicFavicon('/logo2.png')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="ag">
      <Fondo />

      <header className="ag-topbar">
        <div className="ag-container ag-topbar-inner">
          <a href="/" className="flex items-center">
            <Logo src="/logo.png" alt="MarGon Software" className="h-9 w-auto" />
          </a>


          <a href="/#proyectos" className="ag-volver">
            <ArrowLeft size={15} /> Volver a proyectos
          </a>
        </div>
      </header>

      <main>
        <Hero />
        <Barra />
        <Problema />
        <Caracteristicas />
        <Resultado />
        <Cierre />
      </main>

      <footer className="ag-footer">
        <div className="ag-container ag-footer-inner">
          <img src={marca.logo} alt="AguilaSoft" className="ag-footer-logo" />
          <span>{marca.frase}</span>
        </div>
      </footer>
    </div>
  )
}

/* ---------- Fondo decorativo ---------- */

/**
 * Capa de ambiente: orbes con el borde encendido, en el naranja de la
 * marca, repartidos a distintas escalas.
 */
function Fondo() {
  return (
    <div className="ag-fondo" aria-hidden="true">
      <span className="ag-orbe" />
      <span className="ag-orbe ag-orbe-alto" />
      <span className="ag-orbe ag-orbe-medio" />
      <span className="ag-orbe ag-orbe-lejos" />
    </div>
  )
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="ag-hero">
      <div className="ag-container ag-hero-grid">
        <div className="ag-hero-copy">
          <span className="ag-eyebrow">{hero.eyebrow}</span>

          <h1 className="ag-h1">
            {hero.titulo[0]}<br />{hero.titulo[1]}
            <span>{hero.destacado[0]}<br />{hero.destacado[1]}</span>
          </h1>

          <p className="ag-hero-bajada">{hero.bajada}</p>

          <a href="#caracteristicas" className="ag-btn ag-btn-primario">
            {hero.boton} <ArrowRight size={15} />
          </a>
        </div>

        <div className="ag-hero-visual">
          <span className="ag-brillo ag-brillo-cyan" aria-hidden="true" />
          <span className="ag-brillo ag-brillo-naranja" aria-hidden="true" />

          <img src={hero.mockup} alt="Portal B2B y bot de WhatsApp de AguilaSoft" className="ag-mockup" />

        </div>
      </div>
    </section>
  )
}

/* ---------- Barra de tecnologías ---------- */

function Barra() {
  return (
    <section className="ag-barra" id="tecnologias">
      <div className="ag-container ag-barra-grid">
        {barra.items.map(({ titulo, icono }) => (
          <div key={titulo} className="ag-barra-item">
            <Icono nombre={icono} size={26} strokeWidth={1.4} aria-hidden="true" />
            <span>{titulo}</span>
          </div>
        ))}

        {barra.destacados.map(({ titulo, detalle, icono, tono }) => (
          <div key={titulo} className="ag-barra-destacado">
            <span className={tono === 'naranja' ? 'ag-barra-icono ag-naranja' : 'ag-barra-icono'}>
              <Icono nombre={icono} size={26} strokeWidth={1.4} aria-hidden="true" />
            </span>
            <div>
              <strong>{titulo}</strong>
              <p>{detalle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- El problema ---------- */

function Problema() {
  return (
    <section className="ag-section">
      <div className="ag-container">
        <div className="ag-problema">
          <div className="ag-problema-copy">
            <Etiqueta texto={problema.etiqueta} />

            <h2>{problema.titulo}</h2>
            <p className="ag-problema-bajada">{problema.bajada}</p>

            <div className="ag-preguntas-fila">
              <div className="ag-preguntas">
                {problema.preguntas.map(({ texto, icono }) => (
                  <div key={texto} className="ag-pregunta">
                    <Icono nombre={icono} size={19} strokeWidth={1.5} aria-hidden="true" />
                    {texto}
                  </div>
                ))}
              </div>

              <Llave />
              <Flecha />
            </div>
          </div>

          <div className="ag-solucion">
            <span className="ag-solucion-brillo" aria-hidden="true" />

            <img src={marca.logo} alt="AguilaSoft" className="ag-solucion-logo" />


            <h3>
              {problema.solucion[0]}
              <span>{problema.solucion[1]}</span>
            </h3>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Llave que agrupa las cuatro preguntas. */
function Llave() {
  return (
    <svg className="ag-llave" viewBox="0 0 40 280" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <path d="M10 3 C18 3, 22 8, 22 20 L22 122 C22 132, 26 140, 34 140 C26 140, 22 148, 22 158 L22 260 C22 272, 18 277, 10 277" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** Flecha de las preguntas hacia la solución. */
function Flecha() {
  return (
    <svg className="ag-flecha" viewBox="0 0 90 46" fill="none" aria-hidden="true">
      <g className="ag-flecha-halo">
        <path d="M6 23 H74" />
        <path d="M56 6 L76 23 L56 40" />
      </g>
      <g className="ag-flecha-nucleo">
        <path d="M6 23 H74" />
        <path d="M56 6 L76 23 L56 40" />
      </g>
    </svg>
  )
}

/* ---------- Características ---------- */

function Caracteristicas() {
  return (
    <section className="ag-section ag-section-caracteristicas" id="caracteristicas">
      <div className="ag-container">
        <Etiqueta texto={caracteristicas.etiqueta} />

        <div className="ag-cards">
          {caracteristicas.items.map(({ titulo, texto, icono, tono }) => (
            <article key={titulo} className="ag-card">
              <span className={`ag-card-icono${tono ? ` ag-${tono}` : ''}`}>
                <Icono nombre={icono} size={24} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- El resultado ---------- */

function Resultado() {
  return (
    <section className="ag-section ag-section-resultado" id="resultados">
      <div className="ag-container ag-resultado">
        <div>
          <Etiqueta texto={resultado.etiqueta} />
          <h2>{resultado.titulo[0]}<br />{resultado.titulo[1]}</h2>
        </div>

        <div className="ag-resultado-items">
          {resultado.items.map(({ valor, detalle }) => (
            <div key={valor} className="ag-resultado-item">
              <strong>{valor}</strong>
              <span>{detalle}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Cierre ---------- */

function Cierre() {
  return (
    <section className="ag-cierre">
      <div className="ag-container ag-cierre-grid">
        <div>
          <Etiqueta texto={cierre.etiqueta} />
          <h2>{cierre.titulo[0]}<br />{cierre.titulo[1]}</h2>
          <p className="ag-cierre-bajada">{cierre.bajada}</p>
        </div>

        <div className="ag-cierre-botones">
          <a href={cierre.href} target="_blank" rel="noreferrer" className="ag-btn ag-btn-primario">
            {cierre.boton} <ArrowRight size={15} />
          </a>
          <a href="/#proyectos" className="ag-btn ag-btn-secundario">Ver más proyectos</a>
        </div>
      </div>
    </section>
  )
}

function Etiqueta({ texto }) {
  return (
    <div className="ag-etiqueta">
      <span aria-hidden="true" />
      {texto}
    </div>
  )
}
