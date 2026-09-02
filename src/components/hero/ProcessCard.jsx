/**
 * Tarjeta base del proceso del hero (01 / 02 / 03).
 * tone: 'red' | 'yellow' | 'green' → define color de borde, glow y acentos.
 */
export default function ProcessCard({ tone = 'green', number, title, description, children, className = '' }) {
  return (
    <article className={`hero-card hero-card-${tone} ${className}`}>
      <div className="relative z-10 flex items-center gap-4">
        <span className="hero-step-number">{number}</span>
        <h2 className="m-0 text-sm sm:text-base font-bold tracking-wide uppercase text-current">{title}</h2>
      </div>

      <p className="relative z-10 mt-5 mb-6 text-[15px] leading-relaxed text-surface-100">{description}</p>

      <div className="relative z-10">{children}</div>
    </article>
  )
}
