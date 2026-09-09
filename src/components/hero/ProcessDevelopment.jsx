import ProcessCard from './ProcessCard'
import { useI18n } from '../../i18n'

/**
 * Etapas del desarrollo. `top` es la posición vertical (en % del alto de la
 * ilustración /hero/stack.png, que trae solo las cinco capas) del centro de
 * cada capa, para que cada texto quede alineado con la suya. Es geometría de
 * la imagen, así que vive acá y no en el diccionario.
 */
const posiciones = ['11.9%', '30.9%', '50%', '69%', '88.2%']

/** Tarjeta 02 — Nuestro desarrollo (capas ilustradas + etapas en texto) */
export default function ProcessDevelopment() {
  const { t } = useI18n()
  const steps = t('hero.desarrollo.steps')

  return (
    <ProcessCard tone="green" number="02" plainNumber title={t('hero.desarrollo.titulo')} className="hero-card-dev">
      <div className="hero-stack">
        <img src="/hero/stack.png" alt="" aria-hidden="true" className="hero-stack-img" />

        <ol className="hero-stack-labels m-0 p-0 list-none">
          {steps.map((s, i) => (
            <li key={s.title} style={{ top: posiciones[i] }} className="hero-stack-label">
              <span className="hero-stack-title">{s.title}</span>
              <span className="hero-stack-sub">{s.sub}</span>
            </li>
          ))}
        </ol>
      </div>
    </ProcessCard>
  )
}
