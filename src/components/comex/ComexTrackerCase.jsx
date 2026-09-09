import { useEffect, useState } from 'react'
import {
  ArrowLeft, ArrowRight, ImageOff,
  LayoutGrid, FileText, Ship, Users, Bell, BarChart3, Calendar,
} from 'lucide-react'
import Logo from '../Logo'
import { useDynamicFavicon } from '../../hooks/useDynamicFavicon'
import { hero, pastillas, resumen, bloques, columnas, cierre } from './contenido'

const iconos = {
  operaciones: LayoutGrid,
  documentos: FileText,
  despachos: Ship,
  clientes: Users,
  alertas: Bell,
  informes: BarChart3,
  calendario: Calendar,
}

/** Caso de estudio de ComexTracker */
export default function ComexTrackerCase() {
  useDynamicFavicon('/logo2.png')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="cx">
      <header className="cx-topbar">
        <div className="cx-container cx-topbar-inner">
          <a href="/" className="flex items-center">
            <Logo src="/logo.png" alt="MarGon Software" className="h-9 w-auto" />
          </a>
          <a href="/#proyectos" className="cx-volver">
            <ArrowLeft size={15} /> Proyectos
          </a>
        </div>
      </header>

      <main>
        <Hero />
        <Resumen />
        <Bloques />
        <Columnas />
        <Cierre />
      </main>
    </div>
  )
}

/* ---------- Marca ---------- */

function Marca() {
  return (
    <div className="cx-marca">
      <img src="/projects/comextracker/logo.png" alt="ComexTracker" />
    </div>
  )
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="cx-hero">
      <div className="cx-container cx-hero-grid">
        <div>
          <Marca />

          <p className="cx-eyebrow">{hero.eyebrow}</p>

          <h1 className="cx-h1">
            {hero.titulo}
            <span>{hero.destacado}</span>
          </h1>

          <p className="cx-hero-bajada">{hero.bajada}</p>

          <div className="cx-pastillas">
            {pastillas.map(({ titulo, icono }) => {
              const Icono = iconos[icono] ?? LayoutGrid
              return (
                <div key={titulo} className="cx-pastilla">
                  <Icono size={17} strokeWidth={1.7} aria-hidden="true" />
                  <span>{titulo}</span>
                </div>
              )
            })}
          </div>

          <a href="#resumen" className="cx-btn">
            Conocé el proyecto <ArrowRight size={15} />
          </a>
        </div>

        <div className="cx-hero-visual">
          <div className="cx-brillo" aria-hidden="true" />

          <p className="cx-suelto" aria-hidden="true">
            <i />
            <span>{hero.suelto[0]}<br />{hero.suelto[1]}</span>
          </p>

          <div className="cx-marco cx-marco-plano">
            <Captura src={hero.img} alt="Acceso a ComexTracker" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Pantallazo general ---------- */

function Resumen() {
  const modulo = ({ titulo, texto, icono }) => {
    const Icono = iconos[icono] ?? LayoutGrid
    return (
      <article key={titulo} className="cx-modulo">
        <span className="cx-modulo-icono"><Icono size={17} strokeWidth={1.7} /></span>
        <div>
          <h3>{titulo}</h3>
          <p>{texto}</p>
        </div>
      </article>
    )
  }

  return (
    <section className="cx-section" id="resumen">
      <div className="cx-container">
        <div className="cx-encabezado">
          <p className="cx-eyebrow">{resumen.eyebrow}</p>
          <h2>{resumen.titulo[0]}<br />{resumen.titulo[1]}</h2>
          <p className="cx-encabezado-bajada">{resumen.bajada}</p>
        </div>

        <div className="cx-resumen">
          <div className="cx-modulos">{resumen.izquierda.map(modulo)}</div>

          <div className="cx-resumen-pantalla">
            <Captura src={resumen.img} alt="Panel general de ComexTracker" />
          </div>

          <div className="cx-modulos">{resumen.derecha.map(modulo)}</div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Bloques grandes ---------- */

function Bloques() {
  return (
    <section className="cx-section">
      <div className="cx-container cx-bloques">
        {bloques.map((b) => (
          <article key={b.eyebrow} className="cx-bloque">
            <div className="cx-bloque-copy">
              <p className="cx-eyebrow">{b.eyebrow}</p>
              <h2>{b.titulo.map((l, i) => <span key={l}>{i > 0 && <br />}{l}</span>)}</h2>
              <p className="cx-bloque-texto">{b.texto}</p>

              {b.pasos && (
                <ol className="cx-pasos">
                  {b.pasos.map((paso, i) => (
                    <li key={paso} className={i === 0 ? 'cx-paso cx-paso-on' : 'cx-paso'}>
                      <span>{i + 1}</span>
                      <p>{paso}</p>
                    </li>
                  ))}
                </ol>
              )}

              {b.etapas && (
                <ol className="cx-linea">
                  {b.etapas.map((etapa) => <li key={etapa}>{etapa}</li>)}
                </ol>
              )}
            </div>

            <div className="cx-bloque-img">
              <Captura src={b.img} alt={b.titulo.join(' ')} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ---------- Tres columnas ---------- */

function Columnas() {
  return (
    <section className="cx-section">
      <div className="cx-container cx-columnas">
        {columnas.map((c) => (
          <article key={c.eyebrow} className="cx-columna">
            <p className="cx-eyebrow">{c.eyebrow}</p>
            <h2>{c.titulo.map((l, i) => <span key={l}>{i > 0 && <br />}{l}</span>)}</h2>
            <p className="cx-columna-texto">{c.texto}</p>

            <div className="cx-columna-img">
              <Captura src={c.img} alt={c.titulo.join(' ')} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ---------- Cierre ---------- */

function Cierre() {
  return (
    <section className="cx-cierre">
      <div className="cx-container cx-cierre-grid">
        <Marca />

        <p className="cx-cierre-copy">
          {cierre.copy[0]}<br />{cierre.copy[1]}
        </p>

        <a href={cierre.href} target="_blank" rel="noreferrer" className="cx-btn">
          {cierre.boton} <ArrowRight size={15} />
        </a>
      </div>
    </section>
  )
}

/**
 * Muestra la captura si está cargada. Si todavía no hay archivo, deja un
 * marcador en vez de una imagen rota.
 */
function Captura({ src, alt }) {
  const [falla, setFalla] = useState(false)

  if (!src || falla) {
    return (
      <div className="cx-sin-captura">
        <ImageOff size={20} strokeWidth={1.5} />
        <span>Captura pendiente</span>
      </div>
    )
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFalla(true)} />
}
