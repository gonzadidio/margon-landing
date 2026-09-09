import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Monitor, Smartphone, ArrowUpRight, ChevronLeft, ChevronRight, ImageOff, Plus } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import { getProjects, featuredSlugs } from '../projectsData'
import { useI18n } from '../i18n'

export default function Projects() {
  const { t, lang } = useI18n()

  // Los 4 destacados salen de featuredSlugs; el resto va al strip horizontal.
  // Un slug en null reserva el contenedor de un caso todavía por definir.
  const { destacados, resto } = useMemo(() => {
    const projects = getProjects(lang)
    return {
      destacados: featuredSlugs.map((slug) => (slug ? projects.find((p) => p.slug === slug) : null)),
      resto: projects.filter((p) => !featuredSlugs.includes(p.slug)),
    }
  }, [lang])

  return (
    <section id="proyectos" className="relative py-24 lg:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary-400 mb-4">
            {t('projects.eyebrow')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {t('projects.tituloAntes')}{' '}
            <span className="gradient-text">{t('projects.tituloResaltado')}</span>
          </h2>
        </AnimatedSection>

        {/* Destacados: cartas largas, la imagen alterna de lado */}
        <div className="flex flex-col gap-6">
          {destacados.map((project, i) =>
            project
              ? <FeaturedCard key={project.slug} project={project} index={i} />
              : <SlotLibre key={`slot-${i}`} index={i} />
          )}
        </div>

        {/* El resto: cartas chicas con scroll horizontal */}
        <StripProyectos items={resto} />
      </div>
    </section>
  )
}

/* ---------- Carta larga ---------- */

function FeaturedCard({ project, index }) {
  const { t } = useI18n()
  const imagenDerecha = index % 2 === 1
  const esMobile = project.type === 'mobile'

  return (
    <AnimatedSection delay={index * 0.06}>
      <a href={`/proyecto/${project.slug}`} className={`proj-feature proj-feature--${project.slug} group`}>
        <div className={`proj-feature-media ${imagenDerecha ? 'lg:order-2' : ''}`}>
          <Portada project={project} />
          <span className="proj-badge">
            {esMobile ? <Smartphone size={12} /> : <Monitor size={12} />}
            {esMobile ? t('projects.badgeMobile') : t('projects.badgeWeb')}
          </span>
        </div>

        <div className="proj-feature-body">
          <span className="proj-category">{project.category}</span>
          <h3 className="proj-feature-title">{project.title}</h3>
          <p className="proj-feature-text">{project.description}</p>

          <div className="proj-tags">
            {project.tags.map((tag) => (
              <span key={tag} className="proj-tag">{tag}</span>
            ))}
          </div>

          <span className="proj-cta">
            {t('projects.verCaso')}
            <ArrowUpRight size={16} />
          </span>
        </div>
      </a>
    </AnimatedSection>
  )
}

/** Contenedor reservado para un caso todavía sin definir */
function SlotLibre({ index }) {
  const { t } = useI18n()

  return (
    <AnimatedSection delay={index * 0.06}>
      <div className="proj-feature proj-slot">
        <div className={`proj-feature-media ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
          <div className="proj-slot-media">
            <Plus size={26} strokeWidth={1.5} />
          </div>
        </div>
        <div className="proj-feature-body">
          <span className="proj-category">{t('projects.slot.eyebrow')}</span>
          <h3 className="proj-feature-title">{t('projects.slot.titulo')}</h3>
          <p className="proj-feature-text">{t('projects.slot.texto')}</p>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ---------- Strip horizontal ---------- */

function StripProyectos({ items }) {
  const { t } = useI18n()
  const strip = useRef(null)
  const [puedeIzq, setPuedeIzq] = useState(false)
  const [puedeDer, setPuedeDer] = useState(false)

  const revisarBordes = useCallback(() => {
    const el = strip.current
    if (!el) return
    setPuedeIzq(el.scrollLeft > 4)
    setPuedeDer(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    revisarBordes()
    window.addEventListener('resize', revisarBordes)
    return () => window.removeEventListener('resize', revisarBordes)
  }, [revisarBordes])

  const desplazar = (dir) => {
    const el = strip.current
    if (!el) return
    const paso = (el.querySelector('.proj-mini')?.offsetWidth ?? 240) + 16
    el.scrollBy({ left: dir * paso, behavior: 'smooth' })
  }

  if (!items.length) return null

  return (
    <AnimatedSection className="mt-14">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">{t('projects.otros.titulo')}</h3>
          <p className="text-sm text-surface-200/50">{t('projects.otros.subtitulo')}</p>
        </div>

        <div className="hidden sm:flex gap-2">
          <button
            type="button"
            onClick={() => desplazar(-1)}
            disabled={!puedeIzq}
            aria-label={t('projects.otros.anteriores')}
            className="proj-nav"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => desplazar(1)}
            disabled={!puedeDer}
            aria-label={t('projects.otros.siguientes')}
            className="proj-nav"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div ref={strip} onScroll={revisarBordes} className="proj-strip">
        {items.map((project) => (
          <a key={project.slug} href={`/proyecto/${project.slug}`} className="proj-mini group">
            <div className="proj-mini-media">
              <Portada project={project} />
            </div>
            <div className="proj-mini-body">
              <span className="proj-category">{project.category}</span>
              <h4 className="proj-mini-title">
                {project.title}
                <ArrowUpRight size={14} className="proj-mini-arrow" />
              </h4>
            </div>
          </a>
        ))}
      </div>
    </AnimatedSection>
  )
}

/* ---------- Portada con fallback ---------- */

function Portada({ project }) {
  const { t } = useI18n()

  if (!project.image) {
    return (
      <div className="proj-sin-imagen">
        <ImageOff size={22} strokeWidth={1.5} />
        <span>{t('projects.sinImagen')}</span>
      </div>
    )
  }

  return (
    <img
      src={project.image}
      alt={project.title}
      className={`proj-img ${project.placeholder ? 'object-center' : 'object-top'}`}
      loading="lazy"
    />
  )
}
