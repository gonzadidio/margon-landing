import AnimatedSection from './AnimatedSection'
import {
  VisualProduct, VisualPhone, VisualCode, VisualChart, VisualAutomation, VisualCloud,
} from './services/ServiceVisuals'

/**
 * Servicios: 6 tarjetas con título, texto y un visual a la derecha.
 * Para reemplazar un visual por imagen, agregar `img: '/ruta.png'` al servicio.
 */
const services = [
  {
    title: 'Producto & Diseño',
    text: 'Investigación, UX/UI, design systems y prototipos que conectan con usuarios y objetivos de negocio.',
    Visual: VisualProduct,
    img: '/services/producto.png',
  },
  {
    title: 'Desarrollo Web & Mobile',
    text: 'Aplicaciones rápidas, escalables y responsivas para web y dispositivos móviles.',
    Visual: VisualPhone,
    img: '/services/web-mobile.png',
  },
  {
    title: 'Backend & APIs',
    text: 'Desarrollamos la lógica, APIs e integraciones que hacen funcionar todo tu producto.',
    Visual: VisualCode,
  },
  {
    title: 'Datos & Analytics',
    text: 'Bases de datos, reportes y dashboards para tomar decisiones basadas en información real.',
    Visual: VisualChart,
  },
  {
    title: 'Automatizaciones',
    text: 'Conectamos herramientas y automatizamos procesos para que tu equipo enfoque lo que importa.',
    Visual: VisualAutomation,
  },
  {
    title: 'Integraciones & Cloud',
    text: 'Conectamos sistemas terceros y desplegamos en la nube con seguridad y escalabilidad.',
    Visual: VisualCloud,
    img: '/services/cloud.png',
  },
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
  return (
    <section id="servicios" className="relative py-20 lg:py-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <AnimatedSection className="mb-10">
          <h2 className="m-0 max-w-3xl text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.08] text-white">
            Diseño, desarrollo y datos.
            <br />
            Todo en <span className="gradient-text">un solo lugar.</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <AnimatedSection key={s.title} delay={i * 0.08}>
              <ServiceCard {...s} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
