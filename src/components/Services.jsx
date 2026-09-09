import AnimatedSection from './AnimatedSection'
import {
  VisualProduct, VisualPhone, VisualCode, VisualChart, VisualAutomation, VisualCloud,
} from './services/ServiceVisuals'
import { useI18n } from '../i18n'

/**
 * Servicios: 6 tarjetas con título, texto y un visual a la derecha.
 * El texto sale del diccionario (services.items); acá queda solo el visual de
 * cada tarjeta, en el mismo orden. Para reemplazar un visual por imagen,
 * agregar `img: '/ruta.png'`.
 */
const visuales = [
  { Visual: VisualProduct, img: '/services/producto.png' },
  { Visual: VisualPhone, img: '/services/web-mobile.png' },
  { Visual: VisualCode },
  { Visual: VisualChart },
  { Visual: VisualAutomation },
  { Visual: VisualCloud, img: '/services/cloud.png' },
]

function ServiceCard({ title, text, Visual, img }) {
  return (
    <article className="svc-card">
      <div className="svc-card-content">
        <div className="min-w-0">
          <h3 className="m-0 mb-5 text-lg font-semibold tracking-tight text-white leading-tight">{title}</h3>
          <p className="m-0 text-[15px] leading-relaxed text-surface-100/75">{text}</p>
        </div>

        <div className="svc-visual">
          <Visual img={img} />
        </div>
      </div>

      <div className="svc-dots" aria-hidden="true">
        <span className="svc-dot svc-dot-active" />
        <span className="svc-dot" />
        <span className="svc-dot" />
      </div>
    </article>
  )
}

export default function Services() {
  const { t } = useI18n()
  const items = t('services.items')

  return (
    <section id="servicios" className="relative py-20 lg:py-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <AnimatedSection className="mb-10">
          <h2 className="m-0 max-w-3xl text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.08] text-white">
            {t('services.tituloLinea1')}
            <br />
            {t('services.tituloLinea2Antes')}{' '}
            <span className="gradient-text">{t('services.tituloLinea2Resaltado')}</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 0.08}>
              <ServiceCard {...item} {...visuales[i]} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
