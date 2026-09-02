/** Barra de tecnologías que utilizamos */
const techs = [
  { name: 'React', color: '#61dafb', mark: '⚛' },
  { name: 'Next.js', color: '#ffffff', mark: 'N' },
  { name: 'Node.js', color: '#8cc84b', mark: '⬢' },
  { name: 'TypeScript', color: '#3178c6', mark: 'TS' },
  { name: 'Python', color: '#ffd43b', mark: 'Py' },
  { name: 'PostgreSQL', color: '#4fa3d9', mark: '🐘' },
  { name: 'AWS', color: '#ff9900', mark: 'aws' },
  { name: 'Docker', color: '#2496ed', mark: '🐳' },
]

export default function HeroTech() {
  return (
    <div className="hero-tech animate-fade-up" style={{ animationDelay: '0.4s' }}>
      <div className="text-[11px] font-extrabold leading-relaxed tracking-[1px] text-cyan-400 uppercase shrink-0">
        Tecnologías
        <br />
        que utilizamos
      </div>

      <ul className="m-0 p-0 list-none flex-1 flex flex-wrap items-center justify-start lg:justify-around gap-x-7 gap-y-3">
        {techs.map((t) => (
          <li key={t.name} className="flex items-center gap-2 text-[17px] text-white/75 transition-colors hover:text-white cursor-default">
            <span
              className="inline-grid place-items-center w-7 h-7 rounded-md text-[11px] font-bold border border-white/10 bg-white/[0.03]"
              style={{ color: t.color }}
              aria-hidden="true"
            >
              {t.mark}
            </span>
            {t.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
