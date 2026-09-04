import ProcessCard from './ProcessCard'

const items = [
  { title: 'Objetivos del negocio', sub: 'Qué querés lograr y hacia dónde crecer.' },
  { title: 'Necesidades de usuarios', sub: 'Qué necesitan y cómo interactúan.' },
  { title: 'Procesos a mejorar', sub: 'Qué podemos simplificar u optimizar.' },
  { title: 'Problemas actuales', sub: 'Qué está frenando hoy tu operación.' },
]

/** Tarjeta 01 — Tu idea / desafío: lista de título + detalle con barra lateral */
export default function ProcessIdea() {
  return (
    <ProcessCard tone="green" number="01" plainNumber title="Tu idea / desafío">
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
