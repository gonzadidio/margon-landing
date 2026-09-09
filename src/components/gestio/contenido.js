/**
 * Contenido del caso Gestio. El texto vive acá para poder editarlo sin tocar
 * el layout.
 *
 * Sólo se usan dos capturas reales: dashboard.png y seguimiento.png. Si
 * alguna todavía no está, el bloque muestra un marcador en vez de romperse.
 *
 * El español es la fuente de verdad y trae también las imágenes, íconos y
 * tonos; `en` solo lleva texto y se fusiona sobre el español por índice.
 */

import { contenidoPorIdioma } from '../../i18n/fusionar'

const es = {
  marca: {
    logo: '/projects/gestio/logo.png',
    nombre: 'Gestio',
  },

  hero: {
    eyebrow: 'Panel de gestión',
    titulo: 'Todo tu negocio,',
    destacado: 'en una sola vista.',
    bajada:
      'Gestioná pedidos, clientes, mercadería, proveedores, gastos y seguimiento comercial desde un único panel.',
    modulos: [
      { titulo: 'Pedidos', icono: 'pedidos' },
      { titulo: 'Clientes', icono: 'clientes' },
      { titulo: 'Mercadería', icono: 'mercaderia' },
      { titulo: 'Proveedores', icono: 'proveedores' },
      { titulo: 'Gastos', icono: 'gastos' },
      { titulo: 'Seguimiento', icono: 'seguimiento' },
    ],
    boton: 'Conocé el proyecto',
    microcopy: ['Más control.', 'Mejores decisiones.'],
    img: '/projects/gestio/dashboard.png',
    alt: 'Dashboard del panel de gestión',
  },

  dia: {
    etiqueta: 'Visión completa',
    titulo: 'El día empieza',
    destacado: 'acá.',
    bajada: 'Un resumen claro de lo más importante para tomar decisiones rápido.',
    nota: ['Toda la información', 'en un solo lugar'],
    tarjetas: [
      { titulo: 'Entregas', detalle: 'pendientes', icono: 'pedidos', tono: 'rojo' },
      { titulo: 'Clientes', detalle: 'atrasados', icono: 'clientes', tono: 'rojo' },
      { titulo: 'Stock', detalle: 'crítico', icono: 'mercaderia', tono: 'naranja' },
      { titulo: 'Cuentas', detalle: 'por cobrar', icono: 'proveedores' },
    ],
    img: '/projects/gestio/dia.png',
    alt: 'Resumen del día',
  },

  modulos: {
    etiqueta: 'Módulos principales',
    titulo: 'Todo lo que necesitás,',
    destacado: 'conectado.',
    bajada: 'Una herramienta simple, pensada para la gestión real de tu negocio.',
    items: [
      { titulo: 'Pedidos', texto: 'Qué entregar y cuándo.', icono: 'pedidos', tono: 'azul' },
      { titulo: 'Clientes', texto: 'Ventas, pagos y deuda.', icono: 'clientes', tono: 'verde' },
      { titulo: 'Mercadería', texto: 'Stock, precio y margen.', icono: 'mercaderia', tono: 'naranja' },
      { titulo: 'Proveedores', texto: 'Compras y cuentas pendientes.', icono: 'proveedores', tono: 'violeta' },
      { titulo: 'Gastos', texto: 'Control de gastos y resultado del mes.', icono: 'gastos', tono: 'rojo' },
      { titulo: 'El día', texto: 'Qué está pasando hoy.', icono: 'dia', tono: 'cyan' },
      { titulo: 'Seguimiento', texto: 'Quién compra más, menos o dejó de comprar.', icono: 'seguimiento', tono: 'azul' },
    ],
  },

  seguimiento: {
    etiqueta: 'Crecé con información',
    titulo: 'Entendé tu negocio',
    destacado: 'en profundidad.',
    bajada: 'Analizá ventas, clientes y productos para tomar mejores decisiones.',
    beneficios: [
      'Compará períodos',
      'Detectá oportunidades',
      'Planificá compras',
      'Aumentá la rentabilidad',
    ],
    img: '/projects/gestio/seguimiento.png',
    alt: 'Seguimiento de clientes y productos',
  },

  cierre: {
    eyebrow: 'Tu próximo paso',
    titulo: ['¿Querés un panel así', 'en tu negocio?'],
    bajada: 'Contanos qué necesitás y lo hacemos realidad.',
    boton: 'Hablemos',
    href: 'https://wa.me/541131930330',
    detalle: ['Sistemas que', 'impulsan negocios', 'reales.'],
    verMas: 'Ver más proyectos',
  },
}

const en = {
  hero: {
    eyebrow: 'Management panel',
    titulo: 'Your whole business,',
    destacado: 'in a single view.',
    bajada:
      'Manage orders, customers, goods, suppliers, expenses and sales tracking from one panel.',
    modulos: [
      { titulo: 'Orders' },
      { titulo: 'Customers' },
      { titulo: 'Goods' },
      { titulo: 'Suppliers' },
      { titulo: 'Expenses' },
      { titulo: 'Tracking' },
    ],
    boton: 'Explore the project',
    microcopy: ['More control.', 'Better decisions.'],
    alt: 'Dashboard of the management panel',
  },

  dia: {
    etiqueta: 'The full picture',
    titulo: 'The day starts',
    destacado: 'here.',
    bajada: 'A clear summary of what matters most, so decisions happen fast.',
    nota: ['All the information', 'in a single place'],
    tarjetas: [
      { titulo: 'Deliveries', detalle: 'pending' },
      { titulo: 'Customers', detalle: 'overdue' },
      { titulo: 'Stock', detalle: 'critical' },
      { titulo: 'Accounts', detalle: 'receivable' },
    ],
    alt: "The day's summary",
  },

  modulos: {
    etiqueta: 'Core modules',
    titulo: 'Everything you need,',
    destacado: 'connected.',
    bajada: 'A simple tool, built for running a real business.',
    items: [
      { titulo: 'Orders', texto: 'What to deliver and when.' },
      { titulo: 'Customers', texto: 'Sales, payments and debt.' },
      { titulo: 'Goods', texto: 'Stock, price and margin.' },
      { titulo: 'Suppliers', texto: 'Purchases and open accounts.' },
      { titulo: 'Expenses', texto: "Expense control and the month's result." },
      { titulo: 'The day', texto: "What's happening today." },
      { titulo: 'Tracking', texto: 'Who buys more, less or stopped buying.' },
    ],
  },

  seguimiento: {
    etiqueta: 'Grow on information',
    titulo: 'Understand your business',
    destacado: 'in depth.',
    bajada: 'Analyse sales, customers and products to make better decisions.',
    beneficios: [
      'Compare periods',
      'Spot opportunities',
      'Plan your purchasing',
      'Increase profitability',
    ],
    alt: 'Customer and product tracking',
  },

  cierre: {
    eyebrow: 'Your next step',
    titulo: ['Want a panel like this', 'in your business?'],
    bajada: 'Tell us what you need and we make it happen.',
    boton: "Let's talk",
    detalle: ['Systems that', 'drive real', 'businesses.'],
    verMas: 'See more projects',
  },
}

export const getContenido = contenidoPorIdioma(es, { en })
