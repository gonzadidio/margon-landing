import { ArrowRight } from 'lucide-react'
import { useI18n } from '../../i18n'

/** CTAs finales del hero */
export default function HeroActions() {
  const { t } = useI18n()

  return (
    <div className="hero-actions animate-fade-up mt-6 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: '0.5s' }}>
      <a
        href="#contacto"
        className="btn-outline-gradient group inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-lg px-7 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary-500/25"
      >
        {t('hero.acciones.primario')}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </a>
      <a
        href="#proyectos"
        className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-white/20 bg-white/[0.02] px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
      >
        {t('hero.acciones.secundario')}
      </a>
    </div>
  )
}
