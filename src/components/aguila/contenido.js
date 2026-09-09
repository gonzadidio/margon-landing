/**
 * Contenido del caso AguilaSoft. El texto vive acá para poder editarlo sin
 * tocar el layout.
 *
 * Sólo se usan tres imágenes: el logo, el dashboard del portal y la captura
 * de WhatsApp. Si falta alguna, el bloque muestra un marcador en vez de
 * romperse.
 *
 * El español es la fuente de verdad y trae también las imágenes, íconos y
 * tonos; `en` solo lleva texto y se fusiona sobre el español por índice.
 */

import { contenidoPorIdioma } from '../../i18n/fusionar'

const es = {
  marca: {
    logo: '/projects/aguilasoft/logo.png',
    frase: 'Soluciones digitales para empresas que quieren crecer.',
  },

  hero: {
    eyebrow: 'Portal B2B para distribuidoras',
    titulo: ['El teléfono deja', 'de sonar.'],
    destacado: ['Tus clientes se', 'manejan solos.'],
    bajada:
      'Portal web y WhatsApp para que tus clientes consulten precios, stock, cuenta corriente y pedidos, a cualquier hora.',
    boton: 'Conocé el proyecto',
    mockup: '/projects/aguilasoft/mockup.png',
    alt: 'Portal B2B y bot de WhatsApp de AguilaSoft',
  },

  barra: {
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
  },

  problema: {
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
  },

  caracteristicas: {
    etiqueta: 'Todo lo que tu cliente necesita, en un solo lugar',
    items: [
      { titulo: 'Su precio', texto: 'Cada cliente ve su lista y descuentos ya aplicados.', icono: 'lista', tono: 'naranja' },
      { titulo: 'Cuenta corriente', texto: 'Saldo, vencimientos y comprobantes en un mismo lugar.', icono: 'cuenta' },
      { titulo: 'Pedidos', texto: 'Carga, seguimiento y repetición de pedidos.', icono: 'pedido' },
      { titulo: 'WhatsApp', texto: 'Las mismas funciones, por el canal que ya usan.', icono: 'whatsapp', tono: 'verde' },
    ],
  },

  resultado: {
    etiqueta: 'El resultado',
    titulo: ['Menos consultas.', 'Más tiempo para vender.'],
    items: [
      { valor: '24/7', detalle: 'Autogestión' },
      { valor: 'Web + WhatsApp', detalle: 'Un mismo ecosistema' },
      { valor: 'Multiempresa', detalle: 'Un portal por distribuidora' },
    ],
  },

  cierre: {
    etiqueta: 'Hablemos',
    titulo: ['¿Tenés un proyecto así', 'en mente?'],
    bajada: 'Contanos qué necesitás y lo hacemos realidad.',
    boton: 'Hablemos',
    href: 'https://wa.me/541131930330',
    verMas: 'Ver más proyectos',
  },
}

const en = {
  marca: {
    frase: 'Digital solutions for companies that want to grow.',
  },

  hero: {
    eyebrow: 'B2B portal for wholesalers',
    titulo: ['The phone stops', 'ringing.'],
    destacado: ['Your customers', 'serve themselves.'],
    bajada:
      'A web portal and WhatsApp so your customers can check prices, stock, their account balance and orders, at any hour.',
    boton: 'Explore the project',
    alt: "AguilaSoft's B2B portal and WhatsApp bot",
  },

  barra: {
    items: [
      { titulo: 'Web portal' },
      { titulo: 'WhatsApp API' },
      { titulo: 'Multi-company' },
      { titulo: 'AI' },
    ],
    destacados: [
      { titulo: 'In production', detalle: 'with several wholesalers' },
      { titulo: 'Fewer calls', detalle: 'self-service available 24/7' },
    ],
  },

  problema: {
    etiqueta: 'The problem',
    titulo: 'Always the same questions.',
    bajada: 'Your team loses time on enquiries customers could answer themselves.',
    preguntas: [
      { texto: 'What do I owe?' },
      { texto: 'Can you send me the price list?' },
      { texto: 'Do you have stock?' },
      { texto: 'Where is my order?' },
    ],
    solucion: ['24/7 self-service', 'for your customers.'],
  },

  caracteristicas: {
    etiqueta: 'Everything your customer needs, in a single place',
    items: [
      { titulo: 'Their price', texto: 'Every customer sees their list and discounts already applied.' },
      { titulo: 'Current account', texto: 'Balance, due dates and documents all in one place.' },
      { titulo: 'Orders', texto: 'Placing, tracking and repeating orders.' },
      { titulo: 'WhatsApp', texto: 'The same features, on the channel they already use.' },
    ],
  },

  resultado: {
    etiqueta: 'The outcome',
    titulo: ['Fewer enquiries.', 'More time to sell.'],
    items: [
      { valor: '24/7', detalle: 'Self-service' },
      { valor: 'Web + WhatsApp', detalle: 'One ecosystem' },
      { valor: 'Multi-company', detalle: 'One portal per wholesaler' },
    ],
  },

  cierre: {
    etiqueta: "Let's talk",
    titulo: ['Got a project like this', 'in mind?'],
    bajada: 'Tell us what you need and we make it happen.',
    boton: "Let's talk",
    verMas: 'See more projects',
  },
}

export const getContenido = contenidoPorIdioma(es, { en })
