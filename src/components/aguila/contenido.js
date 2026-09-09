/**
 * Contenido del caso AguilaSoft. El texto vive acá para poder editarlo sin
 * tocar el layout.
 *
 * Sólo se usan tres imágenes: el logo, el dashboard del portal y la captura
 * de WhatsApp. Si falta alguna, el bloque muestra un marcador en vez de
 * romperse.
 */

export const marca = {
  logo: '/projects/aguilasoft/logo.png',
  frase: 'Soluciones digitales para empresas que quieren crecer.',
}

export const hero = {
  eyebrow: 'Portal B2B para distribuidoras',
  titulo: ['El teléfono deja', 'de sonar.'],
  destacado: ['Tus clientes se', 'manejan solos.'],
  bajada:
    'Portal web y WhatsApp para que tus clientes consulten precios, stock, cuenta corriente y pedidos, a cualquier hora.',
  boton: 'Conocé el proyecto',
  mockup: '/projects/aguilasoft/mockup.png',
}

export const barra = {
  items: [
    { titulo: 'Portal web', icono: 'portal' },
    { titulo: 'WhatsApp API', icono: 'whatsapp' },
    { titulo: 'Multiempresa', icono: 'multiempresa' },
    { titulo: 'IA', icono: 'ia' },
  ],
  destacados: [
    { titulo: 'En producción', detalle: 'con varias distribuidoras', icono: 'rayo', tono: 'naranja' },
    { titulo: 'Menos llamados', detalle: 'autogestión disponible 24/7', icono: 'llamados' },
  ],
}

export const problema = {
  etiqueta: 'El problema',
  titulo: 'Siempre las mismas preguntas.',
  bajada: 'Tu equipo pierde tiempo en consultas que los clientes podrían resolver solos.',
  preguntas: [
    { texto: '¿Cuánto debo?', icono: 'cuenta' },
    { texto: '¿Me mandás la lista?', icono: 'lista' },
    { texto: '¿Tenés stock?', icono: 'stock' },
    { texto: '¿En qué anda mi pedido?', icono: 'pedido' },
  ],
  solucion: ['Autogestión 24/7', 'para tus clientes.'],
}

export const caracteristicas = {
  etiqueta: 'Todo lo que tu cliente necesita, en un solo lugar',
  items: [
    { titulo: 'Su precio', texto: 'Cada cliente ve su lista y descuentos ya aplicados.', icono: 'lista', tono: 'naranja' },
    { titulo: 'Cuenta corriente', texto: 'Saldo, vencimientos y comprobantes en un mismo lugar.', icono: 'cuenta' },
    { titulo: 'Pedidos', texto: 'Carga, seguimiento y repetición de pedidos.', icono: 'pedido' },
    { titulo: 'WhatsApp', texto: 'Las mismas funciones, por el canal que ya usan.', icono: 'whatsapp', tono: 'verde' },
  ],
}

export const resultado = {
  etiqueta: 'El resultado',
  titulo: ['Menos consultas.', 'Más tiempo para vender.'],
  items: [
    { valor: '24/7', detalle: 'Autogestión' },
    { valor: 'Web + WhatsApp', detalle: 'Un mismo ecosistema' },
    { valor: 'Multiempresa', detalle: 'Un portal por distribuidora' },
  ],
}

export const cierre = {
  etiqueta: 'Hablemos',
  titulo: ['¿Tenés un proyecto así', 'en mente?'],
  bajada: 'Contanos qué necesitás y lo hacemos realidad.',
  boton: 'Hablemos',
  href: 'https://wa.me/541131930330',
}
