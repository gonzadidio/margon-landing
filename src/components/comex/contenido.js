/**
 * Contenido del caso ComexTracker. Todo el texto vive acá para poder editarlo
 * sin tocar el layout.
 *
 * Cada bloque acepta `img` (ruta en /public/projects/comextracker/). Si el
 * archivo todavía no está, el bloque muestra un marcador en vez de romperse.
 *
 * El español es la fuente de verdad y trae también las imágenes y los íconos;
 * `en` solo lleva texto y se fusiona sobre el español por índice.
 */

import { contenidoPorIdioma } from '../../i18n/fusionar'

const es = {
  hero: {
    eyebrow: 'Gestión integral de operaciones',
    titulo: 'Toda la operación,',
    destacado: 'en un solo lugar.',
    bajada:
      'ComexTracker centraliza el seguimiento de operaciones de comercio exterior, desde la apertura hasta la liberación y entrega.',
    suelto: ['Operaciones más simples.', 'Negocios que avanzan.'],
    img: '/projects/comextracker/hero.png',
    alt: 'Acceso a ComexTracker',
  },

  /** Píldoras del hero: los módulos, de un vistazo */
  pastillas: [
    { titulo: 'Operaciones', icono: 'operaciones' },
    { titulo: 'Documentación', icono: 'documentos' },
    { titulo: 'Despachos', icono: 'despachos' },
    { titulo: 'Clientes', icono: 'clientes' },
    { titulo: 'Alertas', icono: 'alertas' },
    { titulo: 'Informes', icono: 'informes' },
  ],

  resumen: {
    eyebrow: 'Pantallazo general',
    titulo: ['Una plataforma.', 'Todo el proceso.'],
    bajada: 'Módulos integrados para tener el control total de cada operación, en tiempo real.',
    img: '/projects/comextracker/dashboard.png',
    alt: 'Panel general de ComexTracker',
    izquierda: [
      { titulo: 'Clientes', texto: 'Información y operaciones de cada cliente.', icono: 'clientes' },
      { titulo: 'Operaciones', texto: 'Seguimiento completo de principio a fin.', icono: 'operaciones' },
      { titulo: 'Documentación', texto: 'Archivos asociados a cada operación.', icono: 'documentos' },
    ],
    derecha: [
      { titulo: 'Calendario', texto: 'Fechas clave, ETA, entregas y liberaciones.', icono: 'calendario' },
      { titulo: 'Notificaciones', texto: 'Alertas automáticas según eventos.', icono: 'alertas' },
      { titulo: 'Informes', texto: 'Consolidación y exportación de datos.', icono: 'informes' },
    ],
  },

  bloques: [
    {
      eyebrow: 'Gestión de operaciones',
      titulo: ['Nueva operación'],
      texto:
        'Desde un único flujo se cargan todos los datos: comerciales, documentación, embarque, presupuesto y despacho.',
      pasos: ['Generales', 'Embarque', 'Presupuesto', 'Formularios', 'Despacho'],
      img: '/projects/comextracker/nueva-operacion.png',
    },
    {
      eyebrow: 'Seguimiento para el cliente',
      titulo: ['El cliente también sabe', 'dónde está su carga.'],
      texto:
        'Cada cliente puede visualizar sus operaciones y conocer exactamente en qué etapa se encuentra, sin consultas manuales.',
      etapas: ['Apertura', 'Embarque', 'Presupuesto', 'Despacho', 'Liberado'],
      img: '/projects/comextracker/seguimiento-cliente.png',
    },
  ],

  columnas: [
    {
      eyebrow: 'Calendario operativo',
      titulo: ['Las fechas importantes,', 'siempre a la vista.'],
      texto: 'Centraliza ETA de embarques, entregas estimadas y liberaciones para anticipar cada etapa.',
      img: '/projects/comextracker/calendario.png',
    },
    {
      eyebrow: 'Notificaciones automáticas',
      titulo: ['El sistema avisa', 'antes de que haya que buscar.'],
      texto: 'Genera alertas según las reglas activas y puede enviar notificaciones al dispositivo.',
      img: '/projects/comextracker/notificaciones.png',
    },
    {
      eyebrow: 'Informes y reportes',
      titulo: ['De los datos', 'al informe.'],
      texto: 'Consolida la información de despachos y genera reportes listos para descargar.',
      img: '/projects/comextracker/informes.png',
    },
  ],

  cierre: {
    copy: ['Procesos más simples.', 'Operaciones que llegan más lejos.'],
    boton: 'Hablemos de tu proyecto',
    href: 'https://wa.me/541131930330',
  },
}

const en = {
  hero: {
    eyebrow: 'End-to-end operations management',
    titulo: 'Every operation,',
    destacado: 'in a single place.',
    bajada:
      'ComexTracker centralises the tracking of international trade operations, from opening through to release and delivery.',
    suelto: ['Simpler operations.', 'Business that keeps moving.'],
    alt: 'Signing in to ComexTracker',
  },

  pastillas: [
    { titulo: 'Operations' },
    { titulo: 'Paperwork' },
    { titulo: 'Customs' },
    { titulo: 'Customers' },
    { titulo: 'Alerts' },
    { titulo: 'Reports' },
  ],

  resumen: {
    eyebrow: 'The big picture',
    titulo: ['One platform.', 'The whole process.'],
    bajada: 'Integrated modules to keep full control of every operation, in real time.',
    alt: 'ComexTracker overview panel',
    izquierda: [
      { titulo: 'Customers', texto: "Each customer's details and operations." },
      { titulo: 'Operations', texto: 'Full tracking from start to finish.' },
      { titulo: 'Paperwork', texto: 'Files attached to each operation.' },
    ],
    derecha: [
      { titulo: 'Calendar', texto: 'Key dates, ETA, deliveries and releases.' },
      { titulo: 'Notifications', texto: 'Automatic alerts driven by events.' },
      { titulo: 'Reports', texto: 'Data consolidation and export.' },
    ],
  },

  bloques: [
    {
      eyebrow: 'Operations management',
      titulo: ['New operation'],
      texto:
        'A single flow captures every detail: commercial data, paperwork, shipment, budget and customs clearance.',
      pasos: ['General', 'Shipment', 'Budget', 'Forms', 'Clearance'],
    },
    {
      eyebrow: 'Customer-facing tracking',
      titulo: ['Your customer also knows', 'where their cargo is.'],
      texto:
        'Every customer can see their operations and know exactly which stage each one is at, with no manual enquiries.',
      etapas: ['Opening', 'Shipment', 'Budget', 'Clearance', 'Released'],
    },
  ],

  columnas: [
    {
      eyebrow: 'Operations calendar',
      titulo: ['The dates that matter,', 'always in sight.'],
      texto: 'It centralises shipment ETAs, estimated deliveries and releases so every stage can be anticipated.',
    },
    {
      eyebrow: 'Automatic notifications',
      titulo: ['The system tells you', 'before you have to go looking.'],
      texto: 'It raises alerts based on the active rules and can push notifications to the device.',
    },
    {
      eyebrow: 'Reports and analytics',
      titulo: ['From the data', 'to the report.'],
      texto: 'It consolidates customs clearance information and generates reports ready to download.',
    },
  ],

  cierre: {
    copy: ['Simpler processes.', 'Operations that go further.'],
    boton: "Let's talk about your project",
  },
}

export const getContenido = contenidoPorIdioma(es, { en })
