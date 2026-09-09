import { Languages } from 'lucide-react'
import { IDIOMAS, useI18n } from '../i18n'

/**
 * Switch de idioma ES / EN. Es un grupo de radios accesible: se navega con
 * tab + flechas y anuncia cuál está activo.
 *
 * `size="sm"` es el de la navbar; `size="md"` el del menú mobile.
 */
export default function LanguageToggle({ size = 'sm', className = '' }) {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      role="radiogroup"
      aria-label={t('nav.cambiarIdioma')}
      className={`lang-switch lang-switch-${size} ${className}`}
    >
      <Languages size={size === 'sm' ? 13 : 15} className="lang-switch-icon" aria-hidden="true" />

      {IDIOMAS.map((idioma) => {
        const activo = idioma.code === lang
        return (
          <button
            key={idioma.code}
            type="button"
            role="radio"
            aria-checked={activo}
            aria-label={idioma.nombre}
            lang={idioma.code}
            onClick={() => setLang(idioma.code)}
            className={activo ? 'lang-switch-opt lang-switch-opt-on' : 'lang-switch-opt'}
          >
            {idioma.label}
          </button>
        )
      })}
    </div>
  )
}
