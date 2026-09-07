/**
 * Barra de tecnologías. En escritorio se muestra la ilustración
 * /hero/tecnologias.png (trae la píldora, el texto y los logos);
 * en pantallas chicas, donde la imagen quedaría ilegible, se muestra la lista.
 */
const techs = ['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'AWS', 'Docker']

export default function HeroTech() {
  return (
    <div className="hero-tech-wrap animate-fade-up mt-8" style={{ animationDelay: '0.4s' }}>
      {/* Escritorio: imagen (el PNG trae aire arriba y abajo; el wrap recorta a la píldora) */}
      <div className="hero-tech-img-wrap hidden lg:block">
        <img
          src="/hero/tecnologias.png"
          alt="Tecnologías que utilizamos: React, Next.js, Node.js, TypeScript, Python, PostgreSQL, AWS y Docker"
          className="hero-tech-img"
        />
      </div>

      {/* Mobile / tablet: lista de texto */}
      <div className="hero-tech lg:hidden">
        <div className="text-[11px] font-extrabold leading-relaxed tracking-[1px] text-cyan-400 uppercase shrink-0">
          Tecnologías
          <br />
          que utilizamos
        </div>
        <ul className="m-0 p-0 list-none flex flex-wrap items-center gap-x-6 gap-y-2">
          {techs.map((t) => (
            <li key={t} className="text-[15px] text-white/75">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
