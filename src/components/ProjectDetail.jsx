import { useEffect } from 'react'
import { ArrowLeft, ArrowRight, ExternalLink, Wrench, Clock, TrendingUp } from 'lucide-react'
import { getProject } from '../projectsData'
import Logo from './Logo'

export default function ProjectDetail({ slug }) {
  const p = getProject(slug)

  useEffect(() => { window.scrollTo(0, 0) }, [slug])

  if (!p) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] text-surface-200 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg text-white">Proyecto no encontrado.</p>
        <a href="/#proyectos" className="text-primary-400 hover:underline">← Volver a proyectos</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-surface-200 font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-20 border-b border-white/5 bg-[#0a0f0d]/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <a href="/" className="hover:opacity-80 transition"><Logo src="/logo.png" alt="Margon" className="h-9 w-auto" /></a>
          <a href="/#proyectos" className="flex items-center gap-1.5 text-sm text-surface-200/60 hover:text-white transition">
            <ArrowLeft size={15} /> Proyectos
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <header className="pt-14 pb-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-400">{p.category}</span>
          {/* Si el proyecto trae logo, va en lugar del titular escrito */}
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            {p.logo
              ? <img src={p.logo} alt={p.title} className="mx-auto h-14 sm:h-20 w-auto max-w-full" />
              : p.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-surface-200/70">{p.lede}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {p.url && (
              <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:brightness-110 transition">
                Ver sitio <ExternalLink size={15} />
              </a>
            )}
            <a href="/#proyectos" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-surface-200 hover:bg-white/10 transition">
              <ArrowLeft size={15} /> Volver
            </a>
          </div>
        </header>

        {/* Meta */}
        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          <MetaCard icon={Wrench} title="Tecnologías">
            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span key={t} className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-mono text-surface-200/60">{t}</span>
              ))}
            </div>
          </MetaCard>
          {p.duration && <MetaCard icon={Clock} title="Duración"><p className="text-sm text-surface-200/70 leading-relaxed">{p.duration}</p></MetaCard>}
          {p.results && <MetaCard icon={TrendingUp} title="Resultados"><p className="text-sm text-surface-200/70 leading-relaxed">{p.results}</p></MetaCard>}
        </section>

        {/* Qué hace la app — sin capturas, solo el listado */}
        {p.cases.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-white">Qué hace</h2>

            <ul className="mt-8">
              {p.cases.map((c, i) => (
                <li key={c.title} className="flex gap-5 border-t border-white/5 py-7">
                  <span className="mt-1 font-mono text-sm text-primary-400">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{c.title}</h3>
                    <p className="mt-2 leading-relaxed text-surface-200/60">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* CTA final */}
      <section className="mt-16 border-t border-white/5 py-16 text-center">
        <div className="mx-auto max-w-5xl px-6">
          <h3 className="text-3xl font-extrabold tracking-tight text-white">¿Tenés un proyecto así en mente?</h3>
          <p className="mt-3 text-surface-200/60">Contanos qué necesitás y lo hacemos realidad.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="/#contacto" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:brightness-110 transition">
              Hablemos <ArrowRight size={15} />
            </a>
            <a href="/#proyectos" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-surface-200 hover:bg-white/10 transition">
              Ver más proyectos
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function MetaCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 text-surface-200/50">
        <Icon size={15} className="text-primary-400" />
        <span className="text-xs font-mono uppercase tracking-wider">{title}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}
