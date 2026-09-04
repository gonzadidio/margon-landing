import { ArrowRight } from 'lucide-react'

/** CTAs finales del hero */
export default function HeroActions() {
  return (
    <div className="hero-actions animate-fade-up mt-6 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: '0.5s' }}>
      <a
        href="#contacto"
        className="btn-outline-gradient group inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-lg px-7 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary-500/25"
      >
        Empezá tu proyecto
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </a>
      <a
        href="#proyectos"
        className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-white/20 bg-white/[0.02] px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
      >
        Ver proyectos
      </a>
    </div>
  )
}
