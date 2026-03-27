import { useState } from 'react'
import { ExternalLink, Monitor, Smartphone } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

const projects = [
  {
    title: 'Punto Bella Vista',
    category: 'Concesionaria',
    description: 'Plataforma web para concesionaria multimarca con catálogo de vehículos, sistema de turnos online y panel de administración.',
    image: '/projects/puntobellavista.png',
    tags: ['Next.js', 'React', 'PostgreSQL', 'Prisma'],
    type: 'web',
  },
  {
    title: 'Sinnergia',
    category: 'Marketing Digital',
    description: 'Landing page premium para agencia de marketing digital con animaciones, portfolio dinámico y formulario de contacto.',
    image: '/projects/sinnergia.png',
    tags: ['Next.js', 'React', 'Tailwind', 'Framer Motion'],
    type: 'web',
  },
  {
    title: 'Fleur & Co',
    category: 'E-Commerce',
    description: 'E-Commerce premium de flores artificiales con carrito, checkout, MercadoPago integrado y panel admin.',
    image: '/projects/flores.png',
    tags: ['Next.js', 'TypeScript', 'Prisma', 'MercadoPago'],
    type: 'web',
  },
  {
    title: 'HandProX',
    category: 'SaaS Deportivo',
    description: 'Plataforma SaaS de gestión y análisis de handball con estadísticas en vivo, gestión de equipos y ligas.',
    image: '/projects/handprox.png',
    tags: ['Next.js', 'Fastify', 'Prisma', 'Socket.io'],
    type: 'web',
  },
  {
    title: 'Celebria',
    category: 'Invitaciones Digitales',
    description: 'Plataforma de invitaciones digitales interactivas con templates premium, editor en tiempo real y gestión de RSVP.',
    image: '/projects/celebria.png',
    tags: ['Next.js', 'TypeScript', 'Prisma', 'Framer Motion'],
    type: 'web',
  },
  {
    title: 'Bar — App',
    category: 'Gastronomía',
    description: 'Aplicación mobile para clientes del bar con wallet digital, sistema VIP, pedidos desde la mesa y reservas con QR.',
    image: '/projects/rotta-app.png',
    tags: ['React', 'NestJS', 'PostgreSQL', 'Redis'],
    type: 'mobile',
  },
  {
    title: 'Bar — Admin',
    category: 'Gastronomía',
    description: 'Panel de administración con métricas en tiempo real, gestión de pedidos, reservas, eventos y gamificación.',
    image: '/projects/rotta-admin.png',
    tags: ['Next.js', 'NestJS', 'PostgreSQL', 'Redis'],
    type: 'web',
  },
  {
    title: 'Pinturería',
    category: 'E-Commerce',
    description: 'E-Commerce de pinturas con asistente IA que calcula materiales, catálogo de +500 productos y buscador de sucursales.',
    image: '/projects/pintureria.png',
    tags: ['Next.js', 'React', 'Tailwind', 'OpenAI'],
    type: 'web',
  },
  {
    title: 'PadelLeague',
    category: 'SaaS Deportivo',
    description: 'Plataforma SaaS para torneos de pádel con fixtures automáticos, rankings en tiempo real y gestión de pagos.',
    image: '/projects/padelleague.png',
    tags: ['Next.js', 'NestJS', 'PostgreSQL', 'Stripe'],
    type: 'web',
  },
]

export default function Projects() {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  return (
    <section id="proyectos" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary-400 mb-4">
            Proyectos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Lo que construimos{' '}
            <span className="gradient-text">habla por nosotros</span>
          </h2>
          <p className="mt-5 text-lg text-surface-200/60 leading-relaxed">
            Cada proyecto es una solución real para un negocio real.
            Diseño, desarrollo y resultados en cada entrega.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <AnimatedSection key={project.title} delay={i * 0.06}>
              <div
                className="group relative h-full rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-primary-500/20 hover:bg-white/[0.04]"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black/30">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent opacity-60" />

                  {/* Type badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-surface-200/80">
                    {project.type === 'mobile' ? <Smartphone size={12} /> : <Monitor size={12} />}
                    {project.type === 'mobile' ? 'Mobile' : 'Web'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-400">
                      {project.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {project.title}
                  </h3>

                  <p className="text-sm text-surface-200/50 leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-surface-200/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
