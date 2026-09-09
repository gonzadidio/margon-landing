import { useEffect, useState } from 'react'
import {
  ArrowLeft, ArrowRight, ArrowDownRight, Check, ImageOff,
  ClipboardList, Users, Package, Truck, Wallet, LineChart, LayoutGrid,
} from 'lucide-react'
import Logo from '../Logo'
import { useDynamicFavicon } from '../../hooks/useDynamicFavicon'
import LanguageToggle from '../LanguageToggle'
import { useI18n, useContenidoDe } from '../../i18n'
import { getContenido } from './contenido'

/** Atajo: el contenido de esta pagina en el idioma activo. */
const useContenido = () => useContenidoDe(getContenido)

const iconos = {
  pedidos: ClipboardList,
  clientes: Users,
  mercaderia: Package,
  proveedores: Truck,
  gastos: Wallet,
  seguimiento: LineChart,
  dia: LayoutGrid,
}

const Icono = ({ nombre, ...props }) => {
  const C = iconos[nombre] ?? LayoutGrid
  return <C {...props} />
}

/** Caso de estudio de Gestio */
export default function GestioCase() {
  const { t } = useI18n()

  useDynamicFavicon('/logo2.png')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="ge">
      <header className="ge-topbar">
        <div className="ge-container ge-topbar-inner">
          <a href="/" className="flex items-center">
            {/* El isotipo, que es el que se lee sobre el fondo claro */}
            <Logo src="/logo2.png" alt="MarGon Software" className="h-10 w-auto" />
          </a>


          <div className="flex items-center gap-4">
            <LanguageToggle size="sm" />
            <a href="/#proyectos" className="ge-volver">
              <ArrowLeft size={15} /> {t('caso.volverProyectos')}
            </a>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <Dia />
        <Modulos />
        <Seguimiento />
        <Cierre />
      </main>
    </div>
  )
}

/* ---------- Marca ---------- */

function Marca({ marca }) {
  return (
    <div className="ge-marca">
      <img src={marca.logo} alt={marca.nombre} />
    </div>
  )
}

/* ---------- Hero ---------- */

function Hero() {
  const { hero, marca } = useContenido()

  return (
    <section className="ge-hero">
      <div className="ge-container ge-hero-copy">
        <Marca marca={marca} />

        <span className="ge-eyebrow">{hero.eyebrow}</span>

        <h1 className="ge-h1">
          {hero.titulo}
          <span>{hero.destacado}</span>
        </h1>

        <p className="ge-hero-bajada">{hero.bajada}</p>

        <div className="ge-hero-modulos">
          {hero.modulos.map(({ titulo, icono }) => (
            <div key={titulo} className="ge-hero-modulo">
              <Icono nombre={icono} size={22} strokeWidth={1.5} aria-hidden="true" />
              {titulo}
            </div>
          ))}
        </div>

        <div className="ge-hero-acciones">
          <a href="#modulos" className="ge-btn ge-btn-primario">
            {hero.boton} <ArrowRight size={15} />
          </a>

          <span className="ge-microcopy">
            {hero.microcopy[0]}<br />{hero.microcopy[1]}
          </span>
        </div>
      </div>

      <div className="ge-hero-visual">
        <span className="ge-brillo" aria-hidden="true" />

        <div className="ge-notebook">
          <Captura src={hero.img} alt={hero.alt} />
        </div>
      </div>
    </section>
  )
}

/* ---------- El día ---------- */

function Dia() {
  const { dia } = useContenido()

  return (
    <section className="ge-section ge-section-dia" id="pantallas">
      <div className="ge-container ge-dia">
        <div>
          <p className="ge-etiqueta">{dia.etiqueta}</p>

          <h2 className="ge-h2">
            {dia.titulo} <span>{dia.destacado}</span>
          </h2>

          <p className="ge-parrafo">{dia.bajada}</p>

          <div className="ge-dia-tarjetas">
            {dia.tarjetas.map(({ titulo, detalle, icono, tono }) => (
              <article key={titulo} className={`ge-mini${tono ? ` ge-${tono}` : ''}`}>
                <Icono nombre={icono} size={26} strokeWidth={1.5} aria-hidden="true" />
                <strong>{titulo}</strong>
                <span>{detalle}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="ge-dia-visual">
          <p className="ge-nota" aria-hidden="true">
            {dia.nota[0]}<br />{dia.nota[1]}
            <ArrowDownRight size={30} strokeWidth={1.6} />
          </p>

          <div className="ge-pantalla">
            <Captura src={dia.img} alt={dia.alt} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Módulos ---------- */

function Modulos() {
  const { modulos } = useContenido()

  return (
    <section className="ge-section ge-section-modulos" id="modulos">
      <div className="ge-container">
        <div className="ge-encabezado">
          <p className="ge-etiqueta">{modulos.etiqueta}</p>

          <h2 className="ge-h2">
            {modulos.titulo} <span>{modulos.destacado}</span>
          </h2>

          <p className="ge-parrafo">{modulos.bajada}</p>
        </div>

        <div className="ge-modulos">
          {modulos.items.map(({ titulo, texto, icono, tono }) => (
            <article key={titulo} className="ge-modulo">
              <span className={`ge-modulo-icono ge-${tono}`}>
                <Icono nombre={icono} size={25} strokeWidth={1.5} aria-hidden="true" />
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

/* ---------- Seguimiento ---------- */

function Seguimiento() {
  const { seguimiento } = useContenido()

  return (
    <section className="ge-section ge-section-seguimiento" id="beneficios">
      <div className="ge-container ge-seguimiento">
        <div className="ge-pantalla ge-pantalla-grande">
          <Captura src={seguimiento.img} alt={seguimiento.alt} />
        </div>

        <div>
          <p className="ge-etiqueta">{seguimiento.etiqueta}</p>

          <h2 className="ge-h2">
            {seguimiento.titulo} <span>{seguimiento.destacado}</span>
          </h2>

          <p className="ge-parrafo">{seguimiento.bajada}</p>

          <ul className="ge-beneficios">
            {seguimiento.beneficios.map((b) => (
              <li key={b}>
                <span><Check size={13} strokeWidth={3} /></span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------- Cierre ---------- */

function Cierre() {
  const { cierre } = useContenido()

  return (
    <section className="ge-cierre" id="contacto">
      <div className="ge-container ge-cierre-grid">
        <div>
          <span className="ge-eyebrow">{cierre.eyebrow}</span>

          <h2 className="ge-h2">
            {cierre.titulo[0]}<br />{cierre.titulo[1]}
          </h2>

          <p className="ge-parrafo">{cierre.bajada}</p>
        </div>

        <div className="ge-cierre-acciones">
          <a href={cierre.href} target="_blank" rel="noreferrer" className="ge-btn ge-btn-primario">
            {cierre.boton} <ArrowRight size={15} />
          </a>
          <a href="/#proyectos" className="ge-btn ge-btn-secundario">{cierre.verMas}</a>
        </div>

        <div className="ge-cierre-detalle">
          <span className="ge-barras" aria-hidden="true"><i /><i /><i /></span>
          <p>{cierre.detalle[0]}<br />{cierre.detalle[1]}<br />{cierre.detalle[2]}</p>
        </div>
      </div>
    </section>
  )
}

/**
 * Muestra la captura si está cargada. Si todavía no hay archivo, deja un
 * marcador en vez de una imagen rota.
 */
function Captura({ src, alt }) {
  const { t } = useI18n()
  const [falla, setFalla] = useState(false)

  if (!src || falla) {
    return (
      <div className="ge-sin-captura">
        <ImageOff size={20} strokeWidth={1.5} />
        <span>{t('caso.capturaPendiente')}</span>
      </div>
    )
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFalla(true)} />
}
