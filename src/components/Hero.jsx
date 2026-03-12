import { ArrowRight, Code2, Sparkles } from 'lucide-react'
import HeroVisual from './HeroVisual'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 hero-glow" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary-500/10 blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-500/8 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-4 py-1.5 text-sm text-primary-300 mb-8 backdrop-blur-sm">
              <Sparkles size={14} className="text-primary-400" />
              <span>Software House de Alto Nivel</span>
            </div>

            {/* Main headline */}
            <h1 className="animate-fade-up text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]" style={{ animationDelay: '0.1s' }}>
              Ideas en{' '}
              <span className="gradient-text">soluciones digitales</span>{' '}
              reales
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-up mt-5 text-base md:text-lg text-surface-200/70 max-w-md leading-relaxed lg:mx-0 mx-auto" style={{ animationDelay: '0.2s' }}>
              Software a medida que impulsa negocios. Web, mobile y sistemas empresariales con calidad premium.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up mt-10 flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4" style={{ animationDelay: '0.3s' }}>
              <a
                href="#contacto"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-primary-500/25 transition-all hover:shadow-primary-500/40 hover:brightness-110"
              >
                Iniciá tu proyecto
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#servicios"
                className="inline-flex items-center gap-2 rounded-xl border border-surface-200/10 bg-white/5 px-8 py-4 text-base font-semibold text-surface-200 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-surface-200/20"
              >
                <Code2 size={18} />
                Ver servicios
              </a>
            </div>

            {/* Tech stack */}
            <div className="animate-fade-up mt-12 flex flex-col items-center lg:items-start gap-3" style={{ animationDelay: '0.5s' }}>
              <span className="text-xs font-medium uppercase tracking-widest text-surface-200/40">
                Tecnologías que dominamos
              </span>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-surface-200/30">
                {['React', 'Next.js', 'Node.js', '.NET', 'Java', 'Python', 'SQL', 'AWS', 'PostgreSQL', 'TypeScript'].map((tech) => (
                  <span
                    key={tech}
                    className="text-sm font-mono font-medium transition-colors hover:text-primary-400 cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Animated Visual */}
          <div className="animate-fade-up hidden lg:block" style={{ animationDelay: '0.4s' }}>
            <HeroVisual />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0f0d] to-transparent" />
    </section>
  )
}
