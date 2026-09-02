import { Target, Users, BarChart3, AlertTriangle, ArrowRight } from 'lucide-react'
import ProcessCard from './ProcessCard'

const items = [
  { icon: Target, label: 'Objetivos del negocio' },
  { icon: Users, label: 'Necesidades de usuarios' },
  { icon: BarChart3, label: 'Procesos a mejorar' },
  { icon: AlertTriangle, label: 'Dolores actuales' },
]

/** Tarjeta 01 — Tu idea / desafío */
export default function ProcessIdea() {
  return (
    <ProcessCard
      tone="red"
      number="01"
      title="Tu idea / desafío"
      description="Escuchamos tu idea y entendemos los desafíos que tu negocio necesita resolver para crecer."
    >
      <div className="grid gap-2.5">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="hero-list-item">
            <span className="hero-list-icon">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <span className="text-[13px] text-white">{label}</span>
          </div>
        ))}
      </div>

      <div className="hero-list-item mt-6 !py-2.5 text-xs text-surface-200">
        <ArrowRight size={16} className="text-current shrink-0" style={{ color: 'var(--hero-tone)' }} />
        Convertimos tu idea en una oportunidad real.
      </div>
    </ProcessCard>
  )
}
