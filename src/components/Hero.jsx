import HeroHeading from './hero/HeroHeading'
import ProcessIdea from './hero/ProcessIdea'
import ProcessDevelopment from './hero/ProcessDevelopment'
import ProcessSolution from './hero/ProcessSolution'
import HeroTech from './hero/HeroTech'
import HeroActions from './hero/HeroActions'

/**
 * Hero: titular + proceso en 3 tarjetas (idea → desarrollo → sistema)
 * + tecnologías + CTAs. Cada bloque es un componente propio en ./hero
 * para poder reemplazarlo de forma independiente.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden hero-grid-bg min-h-screen flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 hero-glow" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-primary-500/10 blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-500/8 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className="hero-inner relative z-10 mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12 pt-24 pb-10 w-full">
        <HeroHeading />

        {/* Proceso: 01 — 02 — 03 */}
        <div className="hero-process animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <ProcessIdea />
          <div className="hero-connector hero-connector-green" aria-hidden="true" />
          <ProcessDevelopment />
          <div className="hero-connector hero-connector-green" aria-hidden="true" />
          <ProcessSolution />
        </div>

        <HeroTech />
        <HeroActions />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0f0d] to-transparent pointer-events-none" />
    </section>
  )
}
