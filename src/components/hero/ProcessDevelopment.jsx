import { Code2, Database, LayoutTemplate, Blocks, Lock } from 'lucide-react'
import ProcessCard from './ProcessCard'

const layers = [
  { icon: Code2, cls: 'hero-layer-1' },
  { icon: Database, cls: 'hero-layer-2' },
  { icon: LayoutTemplate, cls: 'hero-layer-3' },
  { icon: Blocks, cls: 'hero-layer-4' },
  { icon: Lock, cls: 'hero-layer-5' },
]

const steps = [
  { n: '01', color: 'text-accent-300', title: 'Estrategia', text: 'Analizamos, definimos y planificamos.' },
  { n: '02', color: 'text-primary-400', title: 'Arquitectura', text: 'Estructura sólida, escalable y segura.' },
  { n: '03', color: 'text-cyan-400', title: 'Diseño UX / UI', text: 'Experiencias intuitivas que generan valor.' },
  { n: '04', color: 'text-fuchsia-400', title: 'Desarrollo', text: 'Código limpio, eficiente y de calidad.' },
  { n: '05', color: 'text-amber-400', title: 'Testeo & QA', text: 'Validamos, optimizamos y aseguramos resultados.' },
]

/** Tarjeta 02 — Nuestro desarrollo (stack 3D + pasos) */
export default function ProcessDevelopment() {
  return (
    <ProcessCard
      tone="yellow"
      number="02"
      title="Nuestro desarrollo"
      description="Diseñamos y desarrollamos la solución digital ideal, pensada a medida para tu operación."
      className="hero-card-dev"
    >
      <div className="grid md:grid-cols-[1.3fr_0.9fr] gap-6 items-center">
        {/* Stack visual */}
        <div className="hero-stack" aria-hidden="true">
          {layers.map(({ icon: Icon, cls }) => (
            <div key={cls} className={`hero-layer ${cls}`}>
              <span><Icon size={26} strokeWidth={2} /></span>
            </div>
          ))}
          <div className="hero-stack-ring" />
          <div className="hero-stack-ring hero-stack-ring-2" />
        </div>

        {/* Pasos */}
        <ol className="m-0 p-0 list-none flex flex-col gap-4 hero-steps">
          {steps.map((s) => (
            <li key={s.n} className="grid grid-cols-[36px_1fr] gap-2.5 items-start">
              <strong className={`text-lg font-bold leading-none ${s.color}`}>{s.n}</strong>
              <div>
                <h3 className="m-0 mb-1 text-[11px] font-bold uppercase tracking-wide text-white">{s.title}</h3>
                <p className="m-0 text-[11px] leading-snug text-surface-200/70">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </ProcessCard>
  )
}
