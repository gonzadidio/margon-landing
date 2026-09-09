import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { es } from './es'
import { en } from './en'

/**
 * i18n propio, sin dependencias. El diccionario de cada idioma vive en
 * ./es.js y ./en.js con la misma forma; `t('ruta.a.la.clave')` lo recorre.
 * Si falta una clave en inglés, cae al español en vez de romper la vista.
 */

const diccionarios = { es, en }

export const IDIOMAS = [
  { code: 'es', label: 'ES', nombre: 'Español' },
  { code: 'en', label: 'EN', nombre: 'English' },
]

const CODIGOS = IDIOMAS.map((i) => i.code)
const STORAGE_KEY = 'margon-lang'

/** Idioma guardado > idioma del navegador > español */
function detectarIdioma() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY)
    if (guardado && CODIGOS.includes(guardado)) return guardado
  } catch {
    // localStorage bloqueado (modo privado): seguimos con la detección
  }

  const navegador = typeof navigator !== 'undefined' ? navigator.language || '' : ''
  return navegador.toLowerCase().startsWith('en') ? 'en' : 'es'
}

function leer(diccionario, ruta) {
  return ruta.split('.').reduce((valor, clave) => (valor == null ? undefined : valor[clave]), diccionario)
}

const I18nContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectarIdioma)

  useEffect(() => {
    document.documentElement.lang = lang

    const meta = diccionarios[lang]?.meta
    if (meta) {
      document.title = meta.title
      const etiqueta = document.querySelector('meta[name="description"]')
      if (etiqueta) etiqueta.setAttribute('content', meta.description)
    }

    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // sin persistencia: el idioma vale para esta visita
    }
  }, [lang])

  const valor = useMemo(() => {
    const t = (ruta) => {
      const propio = leer(diccionarios[lang], ruta)
      if (propio !== undefined) return propio

      const fallback = leer(es, ruta)
      if (fallback !== undefined) {
        if (import.meta.env.DEV) console.warn(`[i18n] falta "${ruta}" en ${lang}`)
        return fallback
      }

      if (import.meta.env.DEV) console.warn(`[i18n] clave inexistente: "${ruta}"`)
      return ruta
    }

    return {
      lang,
      esIngles: lang === 'en',
      setLang: (code) => CODIGOS.includes(code) && setLangState(code),
      t,
      dict: diccionarios[lang],
    }
  }, [lang])

  return <I18nContext.Provider value={valor}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n() tiene que usarse dentro de <LanguageProvider>')
  return ctx
}

/**
 * Contenido de una pagina de caso en el idioma activo. Cada bloque de la
 * pagina lo llama por su cuenta, asi no hay que ir pasando el contenido por
 * props desde el componente raiz.
 *
 *   const { hero, cierre } = useContenidoDe(getContenido)
 */
export function useContenidoDe(getContenido) {
  const { lang } = useI18n()
  return getContenido(lang)
}
