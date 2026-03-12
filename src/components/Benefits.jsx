import { Zap, Users, Lock, TrendingUp, Headphones, Layers } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

const benefits = [
  {
    icon: Zap,
    title: 'Velocidad de ejecución',
    description: 'Sprints cortos, entregas continuas. Ves resultados desde la primera semana, no después de meses.',
  },
  {
    icon: Users,
    title: 'Equipo senior dedicado',
    description: 'Trabajás directamente con desarrolladores experimentados, sin intermediarios ni rotación de personal.',
  },
  {
    icon: Lock,
    title: 'Código de tu propiedad',
    description: 'Todo el código fuente es tuyo. Sin dependencias, sin lock-in. Libertad total sobre tu tecnología.',
  },
  {
    icon: TrendingUp,
    title: 'Escalabilidad garantizada',
    description: 'Arquitecturas preparadas para crecer. Tu software evoluciona con tu negocio sin reescrituras costosas.',
  },
  {
    icon: Headphones,
    title: 'Comunicación directa',
    description: 'Canal abierto con tu equipo técnico. Sin tickets que se pierden, sin esperas innecesarias.',
  },
  {
    icon: Layers,
    title: 'Stack moderno',
    description: 'Usamos las mejores tecnologías del mercado. Rendimiento, seguridad y mantenibilidad garantizados.',
  },
]

export default function Benefits() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/[0.03] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary-400 mb-4">
            Por qué elegirnos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Lo que nos hace{' '}
            <span className="gradient-text">diferentes</span>
          </h2>
          <p className="mt-5 text-lg text-surface-200/60 leading-relaxed">
            No somos una fábrica de software. Somos un equipo que entiende
            tu negocio y construye tecnología que realmente impacta.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <AnimatedSection key={b.title} delay={i * 0.1}>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 text-primary-400">
                  <b.icon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    {b.title}
                  </h3>
                  <p className="text-sm text-surface-200/50 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
