/**
 * Contenido del caso ComexTracker. Todo el texto vive acá para poder editarlo
 * sin tocar el layout.
 *
 * Cada bloque acepta `img` (ruta en /public/projects/comextracker/). Si el
 * archivo todavía no está, el bloque muestra un marcador en vez de romperse.
 */

export const hero = {
  eyebrow: 'Gestión integral de operaciones',
  titulo: 'Toda la operación,',
  destacado: 'en un solo lugar.',
  bajada:
    'ComexTracker centraliza el seguimiento de operaciones de comercio exterior, desde la apertura hasta la liberación y entrega.',
  suelto: ['Operaciones más simples.', 'Negocios que avanzan.'],
  img: '/projects/comextracker/hero.png',
}

/** Píldoras del hero: los módulos, de un vistazo */
export const pastillas = [
  { titulo: 'Operaciones', icono: 'operaciones' },
  { titulo: 'Documentación', icono: 'documentos' },
  { titulo: 'Despachos', icono: 'despachos' },
  { titulo: 'Clientes', icono: 'clientes' },
  { titulo: 'Alertas', icono: 'alertas' },
  { titulo: 'Informes', icono: 'informes' },
]

export const resumen = {
  eyebrow: 'Pantallazo general',
  titulo: ['Una plataforma.', 'Todo el proceso.'],
  bajada: 'Módulos integrados para tener el control total de cada operación, en tiempo real.',
  img: '/projects/comextracker/dashboard.png',
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
}

export const bloques = [
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
]

export const columnas = [
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
]

export const cierre = {
  copy: ['Procesos más simples.', 'Operaciones que llegan más lejos.'],
  boton: 'Hablemos de tu proyecto',
  href: 'https://wa.me/541131930330',
}
