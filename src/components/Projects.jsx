import { useState, useMemo } from 'react'
import { Monitor, Smartphone, ArrowUpRight } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import { projects } from '../projectsData'

// Filtros derivados de los datos, con su conteo real.
const GROUPS = ['Todos', 'Web', 'E-Commerce', 'SaaS', 'CRM', 'Mobile']

export default function Projects() {
  const [filter, setFilter] = useState('Todos')

  const counts = useMemo(() => {
    const c = { Todos: projects.length }
    for (const p of projects) c[p.group] = (c[p.group] || 0) + 1
    return c
  }, [])

  const visibles = filter === 'Todos' ? projects : projects.filter((p) => p.group === filter)

  return (
    <section id="proyectos" className="relative py-24 lg:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary-400 mb-4">
            Proyectos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Lo que construimos{' '}
            <span className="gradient-text">habla por nosotros</span>
          </h2>
          <p className="mt-5 text-lg text-surface-200/60 leading-relaxed">
            {projects.length} proyectos en producción para negocios reales.
            Diseño, desarrollo y resultados en cada entrega.
          </p>
        </AnimatedSection>

        {/* Filtros por categoría */}
        <AnimatedSection className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {GROUPS.map((g) => {
            const active = filter === g
            return (
              <button
                key={g}
                onClick={() => setFilter(g)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border ${
                  active
                    ? 'border-primary-500/40 bg-primary-500/10 text-primary-300 glow-sm'
                    : 'border-white/5 bg-white/[0.02] text-surface-200/50 hover:text-surface-200/80 hover:border-white/10'
                }`}
              >
                {g}
                <span className={`text-[11px] tabular-nums ${active ? 'text-primary-400/80' : 'text-surface-200/30'}`}>
                  {counts[g] || 0}
                </span>
              </button>
            )
          })}
        </AnimatedSection>

        {/* Grilla — los destacados ocupan más espacio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibles.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project, index }) {
  return (
    <AnimatedSection delay={index * 0.06}>
      <a
        href={`/proyecto/${project.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/25 hover:bg-white/[0.04]"
      >
        {/* Imagen */}
        <div className="relative aspect-[16/10] overflow-hidden bg-black/30">
          <img
            src={project.image}
            alt={project.title}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${project.placeholder ? 'object-center' : 'object-top'}`}
            loading="lazy"
          />
          {/* velo inferior para asentar los badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/10 to-transparent opacity-70" />

          {/* Badge de tipo */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-surface-200/90 ring-1 ring-white/10">
            {project.type === 'mobile' ? <Smartphone size={12} /> : <Monitor size={12} />}
            {project.type === 'mobile' ? 'Mobile' : 'Web'}
          </div>

          {/* Acción al pasar el mouse */}
          <div className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-primary-500 text-[#04120c] opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <ArrowUpRight size={16} />
          </div>
        </div>

        {/* Contenido */}
        <div className="flex flex-1 flex-col p-5">
          <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary-400">
            {project.category}
          </span>

          <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>

          <p className="text-sm text-surface-200/50 leading-relaxed mb-4">{project.description}</p>

          {/* Tags */}
          <div className="mt-auto flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-surface-200/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </a>
    </AnimatedSection>
  )
}
