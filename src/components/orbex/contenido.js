/**
 * Contenido del caso ORBEX. Todo el texto de la página vive acá para poder
 * editarlo sin tocar el layout. A nivel producto: sin reglas internas de
 * negocio ni datos operativos del cliente.
 *
 * Cada bloque acepta `img` (ruta en /public/projects/orbex/): si está, se
 * muestra la captura real; si no, el mockup en CSS que hace de placeholder.
 *
 * El español es la fuente de verdad y trae también las imágenes y los datos
 * de layout; `en` solo lleva texto y se fusiona sobre el español por índice.
 */

import { contenidoPorIdioma } from '../../i18n/fusionar'

const es = {
  hero: {
    eyebrow: 'Desarrollos Inmobiliarios',
    titulo: 'ORBEX',
    subtitulo: 'DESARROLLOS',
    bajada:
      'Sistema comercial y administrativo propio: cada operación seguida desde el primer contacto hasta la última cuota.',
    stack: ['React', 'Node.js', 'PostgreSQL', 'Meta API'],
    img: '/projects/orbex-login.png',
    alt: 'Panel del sistema ORBEX',
    cta: 'Ver funcionalidades',
  },

  desafio: {
    numero: 'El',
    encabezado: 'Desafío',
    texto:
      'ORBEX no necesitaba solo ordenar los leads. Después de la venta arrancaba otro circuito —documentación, reserva, firma y cuotas— que vivía en planillas, carpetas y cadenas de mails, sin forma de saber en qué instancia estaba cada operación.',
    puntos: [
      'Leads dispersos y sin seguimiento',
      'Cruces entre equipos comerciales',
      'Documentación de cada venta en planillas',
      'Firmas y cobranzas',
    ],
    flujo: [
      { titulo: 'Campañas', detalle: 'Creamos campañas que atraen.' },
      { titulo: 'Leads', detalle: 'Los leads entran al sistema.' },
      { titulo: 'Equipos', detalle: 'Se asignan automáticamente al equipo adecuado.' },
      { titulo: 'Venta', detalle: 'Seguimiento hasta el cierre.' },
    ],
  },

  funcionalidades: [
    {
      n: '01',
      titulo: ['Captación', 'automática'],
      texto:
        'Las campañas de Facebook e Instagram vuelcan cada lead directamente al sistema. Nada se carga a mano ni se pierde en una planilla.',
      visual: 'tabla',
      img: '/projects/orbex/leads.png',
    },
    {
      n: '02',
      titulo: ['Reparto entre', 'equipos'],
      texto:
        'Cada lead se asigna al equipo comercial que corresponde, sin mezclarse ni superponerse, con reglas claras de distribución.',
      visual: 'reparto',
      img: ['/projects/orbex/reparto-1.png', '/projects/orbex/reparto-2.png'],
    },
    {
      n: '03',
      titulo: ['Seguimiento', 'de la venta'],
      texto:
        'Cada oportunidad se sigue de principio a fin en un embudo por etapas: quién la tiene, en qué estado está y qué falta para cerrarla.',
      visual: 'embudo',
      img: ['/projects/orbex/embudo-1.png', '/projects/orbex/embudo-2.png'],
    },
    {
      n: '04',
      titulo: ['Expediente de', 'la operación'],
      texto:
        'Al tomar la reserva se abre el expediente con su documentación. El estado avanza por el circuito administrativo y siempre se ve en qué instancia está cada venta.',
      visual: 'expediente',
      img: [
        '/projects/orbex/expediente-1.png',
        '/projects/orbex/expediente-2.png',
        '/projects/orbex/expediente-3.png',
      ],
    },
    {
      n: '05',
      titulo: ['Firma', 'digital'],
      texto:
        'La firma se pide desde la operación y se coordina con la escribanía. Queda registrada con su fecha, su estado y el documento firmado: se terminan las cadenas de mails.',
      visual: 'firmas',
      img: '/projects/orbex/firma-calendario.png',
    },
    {
      n: '06',
      titulo: ['Clientes', 'y cuotas'],
      texto:
        'Al firmar, la operación pasa a cliente con su plan de cuotas. Vencimientos, comprobantes y estado de cada uno en un panel: quién está al día y qué se cobra este mes.',
      visual: 'cuotas',
      img: '/projects/orbex/cobranzas.png',
    },
  ],

  sistema: {
    eyebrow: 'El sistema',
    titulo: 'Todo el proceso comercial y administrativo',
    destacado: 'en una sola plataforma.',
    img: '',
  },

  cierre: {
    tituloAntes: '¿Tu',
    tituloResaltado: 'negocio',
    tituloDespues: 'necesita',
    tituloLinea2: 'algo parecido?',
    bajada: 'Diseñamos sistemas adaptados a cómo trabaja tu empresa.',
    boton: 'Contanos tu proyecto',
    verOtros: 'Ver otros proyectos',
  },

  /** Etiquetas de los mockups en CSS (se ven cuando falta la captura real) */
  ui: {
    leadsNuevos: 'Leads nuevos',
    columnas: ['Nombre', 'Fuente', 'Campaña', 'Hora', 'Estado'],
    nuevo: 'Nuevo',
    distribucion: 'Distribución de leads',
    leadAsignado: 'Lead asignado',
    origen: 'Origen: campaña',
    asignadoA: 'Asignado a',
    asesor: 'Asesor',
    firmasProgramadas: 'Firmas programadas',
    columnasFirmas: ['Cliente', 'Lote', 'Fecha', 'Estado'],
    documentacion: 'Documentación',
    vence: 'Vence',
    conversion: 'Conversión general',
  },

  /** Datos de los mockups. Se reemplazan por capturas cuando estén. */
  mock: {
    leads: [
      { nombre: 'Martina Pérez', fuente: 'Campaña', campania: 'Desarrollos · Interés', hora: '14:32' },
      { nombre: 'Juan González', fuente: 'Instagram', campania: 'Historias · Sept', hora: '14:28' },
      { nombre: 'Lucía Martínez', fuente: 'Campaña', campania: 'Remarketing', hora: '14:21' },
      { nombre: 'Carlos Rodríguez', fuente: 'Instagram', campania: 'Historias', hora: '14:15' },
    ],
    asignacion: { equipo: 'Equipo Norte', asesor: 'Sofía Gómez' },
    equipos: [
      { nombre: 'Equipo Norte', pct: 75, leads: '3 leads' },
      { nombre: 'Equipo Centro', pct: 62, leads: '3 leads' },
      { nombre: 'Equipo Sur', pct: 45, leads: '2 leads' },
    ],
    embudo: [
      { etapa: 'Lead', valor: '1.250' },
      { etapa: 'Contactado', valor: '860' },
      { etapa: 'Reserva', valor: '142' },
      { etapa: 'Firma', valor: '96' },
      { etapa: 'Venta', valor: '62' },
    ],
    expediente: {
      codigo: 'OP-0154',
      cliente: 'Andrés Molina',
      lote: 'Mz 20 · Lote 1',
      docs: [
        { nombre: 'DNI (frente)', ok: true },
        { nombre: 'DNI (dorso)', ok: true },
        { nombre: 'Constancia de CUIL', ok: true },
        { nombre: 'Comprobante de seña', ok: true },
        { nombre: 'Recibo', ok: false },
      ],
      etapas: [
        { nombre: 'Reserva', estado: 'listo' },
        { nombre: 'Documentación', estado: 'listo' },
        { nombre: 'Revisión', estado: 'listo' },
        { nombre: 'Administración', estado: 'actual' },
        { nombre: 'Aprobada', estado: 'pendiente' },
        { nombre: 'Firma', estado: 'pendiente' },
      ],
    },
    firmas: [
      { cliente: 'Andrés Molina', lote: 'Mz 20 · Lote 1', fecha: '28/07 · 10:30', estado: 'Confirmada', tono: 'ok' },
      { cliente: 'Paula Cabrera', lote: 'Mz 3 · Lote 9', fecha: '30/07 · 12:00', estado: 'Solicitada', tono: 'espera' },
      { cliente: 'Diego Ramírez', lote: 'Mz 11 · Lote 4', fecha: '24/07 · 09:30', estado: 'Solicitada', tono: 'espera' },
      { cliente: 'Noelia Vega', lote: 'Mz 9 · Lote 7', fecha: '20/06 · 12:00', estado: 'Realizada', tono: 'ok' },
    ],
    cuotas: {
      cliente: 'Andrés Molina',
      plan: 'Plan 60 cuotas',
      resumen: [
        { label: 'Pagadas', valor: '18' },
        { label: 'Pendientes', valor: '41' },
        { label: 'Vencidas', valor: '1' },
      ],
      filas: [
        { numero: 'Cuota 17', vence: '10/06', estado: 'Pagada', tono: 'ok' },
        { numero: 'Cuota 18', vence: '10/07', estado: 'Pagada', tono: 'ok' },
        { numero: 'Cuota 19', vence: '10/08', estado: 'Vencida', tono: 'alerta' },
        { numero: 'Cuota 20', vence: '10/09', estado: 'Pendiente', tono: 'espera' },
      ],
    },
    metricas: [
      { label: 'Leads', valor: '1.250', delta: '+12%' },
      { label: 'Operaciones', valor: '142', delta: '+10%' },
      { label: 'Firmas', valor: '96', delta: '+9%' },
      { label: 'Cuotas al día', valor: '94%', delta: '+3%' },
    ],
    barras: [90, 72, 57, 42, 26],
    conversion: '24%',
  },
}

const en = {
  hero: {
    eyebrow: 'Real Estate Development',
    bajada:
      'A purpose-built sales and back-office system: every operation followed from first contact to the final instalment.',
    alt: 'The ORBEX system dashboard',
    cta: 'See the features',
  },

  desafio: {
    numero: 'The',
    encabezado: 'Challenge',
    texto:
      'ORBEX did not just need its leads in order. After the sale a second circuit began — paperwork, reservation, signing and instalments — living in spreadsheets, folders and email threads, with no way to tell which stage each operation was at.',
    puntos: [
      'Leads scattered and untracked',
      'Sales teams stepping on each other',
      'Every sale documented in spreadsheets',
      'Signings and collections',
    ],
    flujo: [
      { titulo: 'Campaigns', detalle: 'We build campaigns that attract.' },
      { titulo: 'Leads', detalle: 'Leads land straight in the system.' },
      { titulo: 'Teams', detalle: 'They are routed automatically to the right team.' },
      { titulo: 'Sale', detalle: 'Followed through to close.' },
    ],
  },

  funcionalidades: [
    {
      titulo: ['Automatic', 'lead capture'],
      texto:
        'Facebook and Instagram campaigns push every lead straight into the system. Nothing is typed by hand or lost in a spreadsheet.',
    },
    {
      titulo: ['Routing across', 'teams'],
      texto:
        'Each lead goes to the sales team it belongs to, with no overlap and no crossed wires, under clear distribution rules.',
    },
    {
      titulo: ['Tracking', 'the sale'],
      texto:
        'Every opportunity is followed start to finish in a staged funnel: who owns it, what state it is in and what is left to close it.',
    },
    {
      titulo: ['The operation', 'file'],
      texto:
        'Taking the reservation opens the file with its paperwork. Its status moves through the back-office circuit, so which stage each sale is at is always visible.',
    },
    {
      titulo: ['Digital', 'signing'],
      texto:
        'The signature is requested from the operation itself and coordinated with the notary. It is recorded with its date, its status and the signed document: no more email threads.',
    },
    {
      titulo: ['Customers', 'and instalments'],
      texto:
        'On signing, the operation becomes a customer with their instalment plan. Due dates, receipts and the status of each one in one panel: who is up to date and what is billed this month.',
    },
  ],

  sistema: {
    eyebrow: 'The system',
    titulo: 'The whole sales and back-office process',
    destacado: 'on a single platform.',
  },

  cierre: {
    tituloAntes: 'Does your',
    tituloResaltado: 'business',
    tituloDespues: 'need',
    tituloLinea2: 'something like this?',
    bajada: 'We design systems that fit the way your company actually works.',
    boton: 'Tell us about your project',
    verOtros: 'See other projects',
  },

  ui: {
    leadsNuevos: 'New leads',
    columnas: ['Name', 'Source', 'Campaign', 'Time', 'Status'],
    nuevo: 'New',
    distribucion: 'Lead distribution',
    leadAsignado: 'Assigned lead',
    origen: 'Source: campaign',
    asignadoA: 'Assigned to',
    asesor: 'Rep',
    firmasProgramadas: 'Scheduled signings',
    columnasFirmas: ['Customer', 'Plot', 'Date', 'Status'],
    documentacion: 'Paperwork',
    vence: 'Due',
    conversion: 'Overall conversion',
  },

  mock: {
    leads: [
      { fuente: 'Campaign', campania: 'Developments · Interest' },
      { fuente: 'Instagram', campania: 'Stories · Sept' },
      { fuente: 'Campaign', campania: 'Remarketing' },
      { fuente: 'Instagram', campania: 'Stories' },
    ],
    asignacion: { equipo: 'North Team' },
    equipos: [
      { nombre: 'North Team' },
      { nombre: 'Central Team' },
      { nombre: 'South Team' },
    ],
    embudo: [
      { etapa: 'Lead' },
      { etapa: 'Contacted' },
      { etapa: 'Reserved' },
      { etapa: 'Signing' },
      { etapa: 'Sale' },
    ],
    expediente: {
      lote: 'Blk 20 · Plot 1',
      docs: [
        { nombre: 'ID (front)' },
        { nombre: 'ID (back)' },
        { nombre: 'Tax ID certificate' },
        { nombre: 'Deposit receipt' },
        { nombre: 'Receipt' },
      ],
      etapas: [
        { nombre: 'Reservation' },
        { nombre: 'Paperwork' },
        { nombre: 'Review' },
        { nombre: 'Back office' },
        { nombre: 'Approved' },
        { nombre: 'Signing' },
      ],
    },
    firmas: [
      { lote: 'Blk 20 · Plot 1', estado: 'Confirmed' },
      { lote: 'Blk 3 · Plot 9', estado: 'Requested' },
      { lote: 'Blk 11 · Plot 4', estado: 'Requested' },
      { lote: 'Blk 9 · Plot 7', estado: 'Completed' },
    ],
    cuotas: {
      plan: '60-instalment plan',
      resumen: [
        { label: 'Paid' },
        { label: 'Upcoming' },
        { label: 'Overdue' },
      ],
      filas: [
        { numero: 'Instalment 17', estado: 'Paid' },
        { numero: 'Instalment 18', estado: 'Paid' },
        { numero: 'Instalment 19', estado: 'Overdue' },
        { numero: 'Instalment 20', estado: 'Upcoming' },
      ],
    },
    metricas: [
      { label: 'Leads', valor: '1,250' },
      { label: 'Operations' },
      { label: 'Signings' },
      { label: 'Instalments on time' },
    ],
  },
}

export const getContenido = contenidoPorIdioma(es, { en })
