import { MessageSquare, Lightbulb, Code2, Rocket } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

const steps = [
  {
    icon: MessageSquare,
    step: '01',
    title: 'Descubrimiento',
    description: 'Analizamos tu negocio, tus objetivos y tus usuarios. Entendemos el problema antes de pensar en la solución.',
  },
  {
    icon: Lightbulb,
    step: '02',
    title: 'Estrategia & Diseño',
    description: 'Definimos la arquitectura técnica, diseñamos la experiencia de usuario y planificamos cada sprint del desarrollo.',
  },
  {
    icon: Code2,
    step: '03',
    title: 'Desarrollo Ágil',
    description: 'Construimos iterativamente con entregas semanales. Revisás avances reales, no presentaciones de PowerPoint.',
  },
  {
    icon: Rocket,
    step: '04',
    title: 'Lanzamiento & Evolución',
    description: 'Desplegamos, monitoreamos y optimizamos. Tu software sigue evolucionando después del go-live.',
  },
]

export default function Process() {
  return (
    <section id="proceso" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary-400 mb-4">
            Proceso
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            De la idea al{' '}
            <span className="gradient-text">producto real</span>
          </h2>
          <p className="mt-5 text-lg text-surface-200/60 leading-relaxed">
            Un proceso claro, transparente y orientado a resultados.
            Siempre sabés en qué etapa está tu proyecto.
          </p>
        </AnimatedSection>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

          {steps.map((step, i) => (
            <AnimatedSection key={step.step} delay={i * 0.15}>
              <div className="relative text-center">
                {/* Step number circle */}
                <div className="relative z-10 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a0f0d] border border-primary-500/30 text-primary-400 font-mono font-bold text-sm shadow-lg shadow-primary-500/10">
                  {step.step}
                </div>
                <div className="mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500/10 text-primary-400">
                  <step.icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-surface-200/50 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
