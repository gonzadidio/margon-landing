import ProcessCard from './ProcessCard'

/**
 * Etapas del desarrollo. `top` es la posición vertical (en % del alto de la
 * ilustración /hero/stack.png, que trae solo las cinco capas) del centro de
 * cada capa, para que cada texto quede alineado con la suya.
 */
const steps = [
  { title: 'Experiencia', sub: 'UX / UI / Branding', top: '11.9%' },
  { title: 'Interfaz', sub: 'Web / Mobile / Ecommerce', top: '30.9%' },
  { title: 'Lógica', sub: 'Backend / APIs / Integraciones', top: '50%' },
  { title: 'Datos', sub: 'Databases / Analytics / BI', top: '69%' },
  { title: 'Infraestructura', sub: 'Cloud / Seguridad / Escalabilidad', top: '88.2%' },
]

/** Tarjeta 02 — Nuestro desarrollo (capas ilustradas + etapas en texto) */
export default function ProcessDevelopment() {
  return (
    <ProcessCard tone="green" number="02" plainNumber title="Nuestro desarrollo" className="hero-card-dev">
      <div className="hero-stack">
        <img src="/hero/stack.png" alt="" aria-hidden="true" className="hero-stack-img" />

        <ol className="hero-stack-labels m-0 p-0 list-none">
          {steps.map((s) => (
            <li key={s.title} style={{ top: s.top }} className="hero-stack-label">
              <span className="hero-stack-title">{s.title}</span>
              <span className="hero-stack-sub">{s.sub}</span>
            </li>
          ))}
        </ol>
      </div>
    </ProcessCard>
  )
}
