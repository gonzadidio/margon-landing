import {
  Globe, Smartphone, ShoppingCart, Server,
  Workflow, Database, BarChart3, Shield
} from 'lucide-react'
import AnimatedSection from './AnimatedSection'

const services = [
  {
    icon: Globe,
    title: 'Aplicaciones Web',
    description: 'Plataformas web robustas, rápidas y escalables. Desde dashboards corporativos hasta SaaS complejos.',
  },
  {
    icon: Smartphone,
    title: 'Apps Mobile',
    description: 'Aplicaciones nativas y multiplataforma para iOS y Android con experiencias de usuario excepcionales.',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce',
    description: 'Tiendas online optimizadas para conversión, con pasarelas de pago, inventario y logística integrados.',
  },
  {
    icon: Server,
    title: 'Sistemas a Medida',
    description: 'Software empresarial diseñado para tus procesos. ERPs, CRMs y herramientas internas a tu medida.',
  },
  {
    icon: Workflow,
    title: 'Automatizaciones',
    description: 'Automatizá procesos repetitivos, integrá sistemas y optimizá flujos de trabajo con soluciones inteligentes.',
  },
  {
    icon: Database,
    title: 'Integraciones & APIs',
    description: 'Conectamos tus sistemas entre sí y con servicios de terceros mediante APIs robustas y bien documentadas.',
  },
  {
    icon: BarChart3,
    title: 'Consultoría Técnica',
    description: 'Auditorías de código, arquitectura de soluciones y estrategia tecnológica para escalar tu negocio.',
  },
  {
    icon: Shield,
    title: 'Mantenimiento & Soporte',
    description: 'Soporte continuo, actualizaciones de seguridad y mejoras evolutivas para mantener tu software en su mejor versión.',
  },
]

export default function Services() {
  return (
    <section id="servicios" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary-400 mb-4">
            Servicios
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Todo lo que necesitás para{' '}
            <span className="gradient-text">digitalizar tu negocio</span>
          </h2>
          <p className="mt-5 text-lg text-surface-200/60 leading-relaxed">
            Ofrecemos un ecosistema completo de servicios de desarrollo.
            Cada solución está diseñada para generar resultados medibles.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, i) => (
            <AnimatedSection key={service.title} delay={i * 0.08}>
              <div className="group relative h-full rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-primary-500/20 hover:glow-sm">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 transition-colors group-hover:bg-primary-500/20">
                  <service.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-surface-200/50 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
