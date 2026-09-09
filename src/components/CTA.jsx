import { ArrowRight, Mail, Calendar } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import { useI18n } from '../i18n'

export default function CTA() {
  const { t } = useI18n()

  return (
    <section id="contacto" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <AnimatedSection>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-4 py-1.5 text-sm text-primary-300 mb-8">
            <Calendar size={14} />
            {t('cta.badge')}
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            {t('cta.tituloAntes')}{' '}
            <span className="gradient-text">{t('cta.tituloResaltado')}</span>
            {t('cta.tituloDespues')}
          </h2>

          <p className="mt-6 text-lg md:text-xl text-surface-200/60 max-w-2xl mx-auto leading-relaxed">
            {t('cta.texto')}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/541131930330"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-primary-500/25 transition-all hover:shadow-primary-500/40 hover:brightness-110"
            >
              <Mail size={18} />
              {t('cta.boton')}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <p className="mt-8 text-xs text-surface-200/30">
            {t('cta.nota')}
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
