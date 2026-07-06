import { Star } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

const testimonials = [
  {
    name: 'Martín Ruiz',
    role: 'CEO',
    company: 'TechFlow',
    text: 'Margon entendió nuestro negocio desde el primer día. Entregaron un sistema que superó nuestras expectativas y nos permitió escalar operaciones un 300%.',
    stars: 5,
  },
  {
    name: 'Carolina Méndez',
    role: 'Directora de Producto',
    company: 'HealthSync',
    text: 'La velocidad y calidad del equipo de Margon son excepcionales. Nuestra plataforma de telemedicina está en producción y crece cada semana.',
    stars: 5,
  },
  {
    name: 'Diego Fernández',
    role: 'Fundador',
    company: 'LogiTrack',
    text: 'Probamos con 3 proveedores antes de Margon. Fueron los únicos que realmente entendieron la complejidad de la logística last-mile y la resolvieron.',
    stars: 5,
  },
]

export default function Testimonials() {
  return (
    <section id="clientes" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary-400 mb-4">
            Clientes
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Lo que dicen{' '}
            <span className="gradient-text">nuestros clientes</span>
          </h2>
          <p className="mt-5 text-lg text-surface-200/60 leading-relaxed">
            Relaciones de largo plazo construidas sobre resultados reales.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 0.12}>
              <figure className="relative h-full flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.04] hover:border-primary-500/20">
                {/* Estrellas */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Cita */}
                <blockquote className="relative text-surface-200/75 leading-relaxed mb-6 text-sm lg:text-base">
                  “{t.text}”
                </blockquote>

                {/* Autor */}
                <figcaption className="mt-auto flex items-center gap-3 pt-5 border-t border-white/5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white font-bold shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                    <p className="text-xs text-surface-200/45 truncate">
                      {t.role} · <span className="text-primary-400/70">{t.company}</span>
                    </p>
                  </div>
                </figcaption>
              </figure>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
