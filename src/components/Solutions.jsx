import {
  Building2, Stethoscope, GraduationCap, Truck,
  Utensils, Scale, Factory, ShoppingBag
} from 'lucide-react'
import AnimatedSection from './AnimatedSection'

const solutions = [
  { icon: Building2, name: 'Fintech & Banca', color: 'from-blue-500/20 to-cyan-500/20' },
  { icon: Stethoscope, name: 'Salud', color: 'from-emerald-500/20 to-green-500/20' },
  { icon: GraduationCap, name: 'Educación', color: 'from-amber-500/20 to-yellow-500/20' },
  { icon: Truck, name: 'Logística', color: 'from-orange-500/20 to-red-500/20' },
  { icon: Utensils, name: 'Gastronomía', color: 'from-rose-500/20 to-pink-500/20' },
  { icon: Scale, name: 'Legal', color: 'from-violet-500/20 to-purple-500/20' },
  { icon: Factory, name: 'Industria', color: 'from-slate-500/20 to-gray-500/20' },
  { icon: ShoppingBag, name: 'Retail', color: 'from-fuchsia-500/20 to-pink-500/20' },
]

export default function Solutions() {
  return (
    <section id="soluciones" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/[0.02] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <AnimatedSection>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary-400 mb-4">
              Soluciones por Industria
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Software que entiende{' '}
              <span className="gradient-text">tu industria</span>
            </h2>
            <p className="mt-5 text-lg text-surface-200/60 leading-relaxed">
              Trabajamos con empresas de múltiples sectores. Entendemos las
              particularidades de cada negocio y desarrollamos soluciones que
              resuelven problemas reales, no genéricos.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                <p className="text-surface-200/70 text-sm">
                  <strong className="text-white">+50 proyectos</strong> entregados exitosamente en diversos rubros
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-accent-500 shrink-0" />
                <p className="text-surface-200/70 text-sm">
                  <strong className="text-white">Equipos especializados</strong> por vertical para cada tipo de proyecto
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary-400 shrink-0" />
                <p className="text-surface-200/70 text-sm">
                  <strong className="text-white">Compliance & regulaciones</strong> integradas en cada solución del sector
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Right grid */}
          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {solutions.map((sol) => (
                <div
                  key={sol.name}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:bg-white/[0.05] hover:border-primary-500/20"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${sol.color} text-white/70 transition-colors group-hover:text-white`}>
                    <sol.icon size={22} />
                  </div>
                  <span className="text-xs font-medium text-surface-200/60 text-center group-hover:text-white transition-colors">
                    {sol.name}
                  </span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
