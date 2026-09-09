import ProcessCard from './ProcessCard'
import { useI18n } from '../../i18n'

/** Tarjeta 01 — Tu idea / desafío: lista de título + detalle con barra lateral */
export default function ProcessIdea() {
  const { t } = useI18n()
  const items = t('hero.idea.items')

  return (
    <ProcessCard tone="green" number="01" plainNumber title={t('hero.idea.titulo')}>
      <ul className="m-0 p-0 list-none flex flex-col gap-5">
        {items.map((it) => (
          <li key={it.title} className="hero-idea-item">
            <span className="hero-idea-title">{it.title}</span>
            <span className="hero-idea-sub">{it.sub}</span>
          </li>
        ))}
      </ul>
    </ProcessCard>
  )
}
