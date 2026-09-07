import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ImageOff } from 'lucide-react'
import Logo from '../Logo'
import { useDynamicFavicon } from '../../hooks/useDynamicFavicon'
import { hero, casos, cierre } from './contenido'

/** Caso de estudio de Punto Bella Vista */
export default function PuntoBellaVistaCase() {
  useDynamicFavicon('/logo2.png')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="pbv">
      <header className="pbv-topbar">
        <div className="pbv-container pbv-topbar-inner">
          <a href="/" className="flex items-center">
            <Logo src="/logo.png" alt="MarGon Software" className="h-9 w-auto" />
          </a>
          <a href="/#proyectos" className="pbv-volver">
            <ArrowLeft size={15} /> Proyectos
          </a>
        </div>
      </header>

      <main>
        <Hero />
        <Casos />
        <Cierre />
      </main>
    </div>
  )
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="pbv-hero">
      <div className="pbv-container pbv-hero-grid">
        <div className="pbv-hero-copy">
          <span className="pbv-eyebrow">{hero.eyebrow}</span>
          <h1>{hero.titulo}</h1>
          <p>{hero.bajada}</p>
        </div>

        <div className="pbv-hero-visual">
          <img
            className="pbv-mockup"
            src={hero.mockup}
            alt="Punto Bella Vista en escritorio y mobile"
          />
        </div>
      </div>
    </section>
  )
}

/* ---------- Casos ---------- */

function Casos() {
  return (
    <>
      {casos.map((caso, i) => (
        <section key={caso.n} className="pbv-caso">
          <div className={`pbv-container pbv-caso-fila ${i % 2 === 1 ? 'pbv-caso-fila-inv' : ''}`}>
            <div className="pbv-caso-copy">
              <span className="pbv-caso-num">{caso.n}</span>
              <h2>{caso.titulo}</h2>
              <span className="pbv-caso-linea" />
              <p>{caso.texto}</p>
            </div>

            <div className={`pbv-caso-media ${caso.fondo === 'oscuro' ? 'pbv-caso-media-oscura' : ''}`}>
              <Captura src={caso.img} alt={caso.titulo} />
            </div>
          </div>
        </section>
      ))}
    </>
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
      <div className="pbv-sin-captura">
        <ImageOff size={20} strokeWidth={1.5} />
        <span>Captura pendiente</span>
      </div>
    )
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFalla(true)} />
}

/* ---------- Cierre e identidad Margon ---------- */

function Cierre() {
  return (
    <section className="pbv-cierre">

      <div className="pbv-container pbv-cierre-content">
        <h2>{cierre.titulo}</h2>
        <p>{cierre.bajada}</p>

        <a
          href={cierre.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="pbv-btn pbv-btn-primario"
        >
          Contactanos <ArrowRight size={15} />
        </a>
      </div>
    </section>
  )
}
