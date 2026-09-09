/**
 * Combina el contenido base (español, con imágenes y datos de layout) con un
 * objeto de traducción que trae solo texto. Los arrays se emparejan por
 * índice, así que la traducción de una lista puede traer únicamente los
 * campos de texto de cada ítem.
 *
 * Se usa en el contenido de las páginas de caso: así las rutas de imagen y la
 * geometría viven en un solo lugar y no hay que mantenerlas por idioma.
 */
export function fusionar(base, traduccion) {
  if (traduccion === undefined || traduccion === null) return base

  if (Array.isArray(base)) {
    if (!Array.isArray(traduccion)) return traduccion
    return base.map((item, i) => fusionar(item, traduccion[i]))
  }

  if (base && typeof base === 'object') {
    if (typeof traduccion !== 'object' || Array.isArray(traduccion)) return traduccion
    const salida = { ...base }
    for (const clave of Object.keys(traduccion)) {
      salida[clave] = fusionar(base[clave], traduccion[clave])
    }
    return salida
  }

  return traduccion
}

/**
 * Devuelve el contenido de una página de caso en el idioma pedido, calculando
 * la fusión una sola vez por idioma.
 */
export function contenidoPorIdioma(es, traducciones) {
  const cache = {}

  return (lang = 'es') => {
    if (lang === 'es' || !traducciones[lang]) return es
    cache[lang] ??= fusionar(es, traducciones[lang])
    return cache[lang]
  }
}
