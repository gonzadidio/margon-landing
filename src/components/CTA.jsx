import { ArrowRight, Mail, Calendar } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

export default function CTA() {
  return (
    <section id="contacto" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <AnimatedSection>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-4 py-1.5 text-sm text-primary-300 mb-8">
            <Calendar size={14} />
            Agendá una reunión sin compromiso
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            ¿Listo para llevar tu negocio al{' '}
            <span className="gradient-text">siguiente nivel</span>?
          </h2>

          <p className="mt-6 text-lg md:text-xl text-surface-200/60 max-w-2xl mx-auto leading-relaxed">
            Contanos tu idea o tu desafío. En una llamada de 30 minutos te
            mostramos cómo podemos ayudarte a transformarlo en realidad.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:hola@margon.dev"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-primary-500/25 transition-all hover:shadow-primary-500/40 hover:brightness-110"
            >
              <Mail size={18} />
              Escribinos
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-200/10 bg-white/5 px-8 py-4 text-base font-semibold text-surface-200 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-surface-200/20"
            >
              WhatsApp directo
            </a>
          </div>

          <p className="mt-8 text-xs text-surface-200/30">
            Sin compromiso. Sin spam. Respuesta en menos de 24 horas.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
