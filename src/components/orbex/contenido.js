/**
 * Contenido del caso ORBEX. Todo el texto de la página vive acá para poder
 * editarlo sin tocar el layout. A nivel producto: sin reglas internas de
 * negocio ni datos operativos del cliente.
 *
 * Cada bloque acepta `img` (ruta en /public/projects/orbex/): si está, se
 * muestra la captura real; si no, el mockup en CSS que hace de placeholder.
 */

export const hero = {
  eyebrow: 'Desarrollos Inmobiliarios',
  titulo: 'ORBEX',
  subtitulo: 'DESARROLLOS',
  bajada:
    'Sistema comercial y administrativo propio: cada operación seguida desde el primer contacto hasta la última cuota.',
  stack: ['React', 'Node.js', 'PostgreSQL', 'Meta API'],
  img: '/projects/orbex-login.png',
}

export const desafio = {
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
}

export const funcionalidades = [
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
]

export const sistema = {
  eyebrow: 'El sistema',
  titulo: 'Todo el proceso comercial y administrativo',
  destacado: 'en una sola plataforma.',
  img: '',
}

/** Datos de los mockups. Se reemplazan por capturas cuando estén. */
export const mock = {
  leads: [
    { nombre: 'Martina Pérez', fuente: 'Campaña', campania: 'Desarrollos · Interés', hora: '14:32' },
    { nombre: 'Juan González', fuente: 'Instagram', campania: 'Historias · Sept', hora: '14:28' },
    { nombre: 'Lucía Martínez', fuente: 'Campaña', campania: 'Remarketing', hora: '14:21' },
    { nombre: 'Carlos Rodríguez', fuente: 'Instagram', campania: 'Historias', hora: '14:15' },
  ],
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
}
