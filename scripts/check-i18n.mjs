/**
 * Chequea que los diccionarios de idioma estén sincronizados.
 *
 *   npm run i18n:check
 *
 * Revisa dos cosas:
 *   1. src/i18n/en.js tiene las mismas claves que es.js (el de referencia).
 *   2. Cada proyecto de projectsData.js tiene su entrada en projects.en.js.
 *
 * Falta una clave no rompe el sitio —cae al español— pero sí deja media
 * página sin traducir, que es peor que un error visible.
 */

import { es } from '../src/i18n/es.js'
import { en } from '../src/i18n/en.js'
import { projectsEn } from '../src/i18n/projects.en.js'
import { projects } from '../src/projectsData.js'

/** Todas las rutas de hojas del objeto, en notación a.b.c (los arrays por índice). */
function rutas(valor, prefijo = '') {
  if (Array.isArray(valor)) {
    return valor.flatMap((item, i) => rutas(item, `${prefijo}[${i}]`))
  }
  if (valor && typeof valor === 'object') {
    return Object.entries(valor).flatMap(([clave, v]) =>
      rutas(v, prefijo ? `${prefijo}.${clave}` : clave)
    )
  }
  return [prefijo]
}

const enEs = new Set(rutas(es))
const enEn = new Set(rutas(en))

const faltan = [...enEs].filter((r) => !enEn.has(r))
const sobran = [...enEn].filter((r) => !enEs.has(r))

// projects.en.js: cada proyecto necesita al menos description y lede
const sinTraducir = projects
  .filter((p) => !projectsEn[p.slug])
  .map((p) => p.slug)

const huerfanos = Object.keys(projectsEn)
  .filter((slug) => !projects.some((p) => p.slug === slug))

let problemas = 0

const reportar = (titulo, lista) => {
  if (!lista.length) return
  problemas += lista.length
  console.error(`\n${titulo} (${lista.length}):`)
  for (const item of lista) console.error(`  - ${item}`)
}

reportar('Claves que están en es.js y faltan en en.js', faltan)
reportar('Claves que están en en.js y no existen en es.js', sobran)
reportar('Proyectos sin traducción en projects.en.js', sinTraducir)
reportar('Slugs en projects.en.js que ya no existen', huerfanos)

if (problemas) {
  console.error(`\n${problemas} problema(s) de i18n.\n`)
  process.exit(1)
}

console.log(`i18n OK — ${enEs.size} claves sincronizadas y ${projects.length} proyectos traducidos.`)
