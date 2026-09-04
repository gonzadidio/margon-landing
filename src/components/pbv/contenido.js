/**
 * Contenido del caso Punto Bella Vista. Todo el texto vive acá para poder
 * editarlo sin tocar el layout.
 *
 * Regla: nada de métricas, testimonios ni datos sin confirmar. Si un campo
 * está vacío, la sección que lo usa no se renderiza.
 */

export const hero = {
  eyebrow: 'Concesionaria',
  titulo: 'Punto Bella Vista',
  bajada:
    'Plataforma web y panel de gestión para una concesionaria: catálogo de vehículos, turnos online y administración centralizada, todo en un mismo lugar.',
  mockup: '/projects/pbv/mockup.png',
}

export const casos = [
  {
    n: '01',
    titulo: 'Catálogo con búsqueda inteligente',
    texto:
      'Los clientes filtran por marca, modelo, año y precio en segundos. Cada unidad tiene ficha con galería, datos técnicos y contacto directo por WhatsApp.',
    img: '/projects/pbv/catalogo.png',
    fondo: 'claro',
  },
  {
    n: '02',
    titulo: 'Turnos online sin llamadas',
    texto:
      'Reservas de visita sincronizadas con la agenda del local: el cliente elige día y horario, y la confirmación sale por WhatsApp.',
    img: '/projects/pbv/turnos.png',
    fondo: 'claro',
  },
  {
    n: '03',
    titulo: 'Panel de administración',
    texto:
      'Alta y edición de vehículos, gestión de turnos y consultas en un panel simple que el equipo maneja sin depender de nadie.',
    img: '/projects/pbv/admin.png',
    fondo: 'oscuro',
  },
]

export const cierre = {
  titulo: '¿Tenés un proyecto así en mente?',
  bajada: 'Contanos qué necesitás y lo hacemos realidad.',
  whatsapp: 'https://wa.me/541131930330',
}
