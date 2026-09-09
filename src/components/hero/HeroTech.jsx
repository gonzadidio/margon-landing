import { useI18n } from '../../i18n'

/**
 * Barra de tecnologías. En español y escritorio se muestra la ilustración
 * /hero/tecnologias.png (trae la píldora, el texto y los logos).
 *
 * El PNG tiene el texto en español quemado, así que en inglés —y en pantallas
 * chicas, donde la imagen quedaría ilegible— se usa la versión en texto.
 */
const techs = ['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'AWS', 'Docker']

export default function HeroTech() {
  const { t, esIngles } = useI18n()

  return (
    <div className="hero-tech-wrap animate-fade-up mt-8" style={{ animationDelay: '0.4s' }}>
      {/* Escritorio en español: imagen (el PNG trae aire arriba y abajo; el wrap recorta a la píldora) */}
      {!esIngles && (
        <div className="hero-tech-img-wrap hidden lg:block">
          <img src="/hero/tecnologias.png" alt={t('hero.tech.alt')} className="hero-tech-img" />
        </div>
      )}

      {/* Mobile / tablet siempre, y escritorio en inglés: lista de texto */}
      <div className={esIngles ? 'hero-tech hero-tech-texto' : 'hero-tech lg:hidden'}>
        <div className="text-[11px] font-extrabold leading-relaxed tracking-[1px] text-cyan-400 uppercase shrink-0">
          {t('hero.tech.etiqueta1')}
          <br />
          {t('hero.tech.etiqueta2')}
        </div>
        <ul className="m-0 p-0 list-none flex flex-wrap items-center gap-x-6 gap-y-2">
          {techs.map((tech) => (
            <li key={tech} className="text-[15px] text-white/75">
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
