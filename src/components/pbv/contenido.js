/**
 * Contenido del caso Punto Bella Vista. Todo el texto vive acá para poder
 * editarlo sin tocar el layout.
 *
 * Regla: nada de métricas, testimonios ni datos sin confirmar. Si un campo
 * está vacío, la sección que lo usa no se renderiza.
 *
 * El español es la fuente de verdad y trae también las imágenes y los datos de
 * layout; `en` solo lleva texto y se fusiona sobre el español por índice.
 */

import { contenidoPorIdioma } from '../../i18n/fusionar'

const es = {
  hero: {
    eyebrow: 'Concesionaria',
    titulo: 'Punto Bella Vista',
    bajada:
      'Plataforma web y panel de gestión para una concesionaria: catálogo de vehículos, turnos online y administración centralizada, todo en un mismo lugar.',
    mockup: '/projects/pbv/mockup.png',
    alt: 'Punto Bella Vista en escritorio y mobile',
  },

  casos: [
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
  ],

  cierre: {
    titulo: '¿Tenés un proyecto así en mente?',
    bajada: 'Contanos qué necesitás y lo hacemos realidad.',
    whatsapp: 'https://wa.me/541131930330',
  },
}

const en = {
  hero: {
    eyebrow: 'Car Dealership',
    bajada:
      'Web platform and management panel for a dealership: vehicle catalogue, online bookings and centralised administration, all in one place.',
    alt: 'Punto Bella Vista on desktop and mobile',
  },

  casos: [
    {
      titulo: 'Catalogue with smart search',
      texto:
        'Customers filter by make, model, year and price in seconds. Every unit has its own page with a gallery, specs and direct contact over WhatsApp.',
    },
    {
      titulo: 'Online bookings, no phone calls',
      texto:
        'Visit bookings synced with the dealership calendar: the customer picks a day and time, and the confirmation goes out over WhatsApp.',
    },
    {
      titulo: 'Admin panel',
      texto:
        'Adding and editing vehicles, managing bookings and enquiries in a simple panel the team runs without depending on anyone.',
    },
  ],

  cierre: {
    titulo: 'Got a project like this in mind?',
    bajada: 'Tell us what you need and we make it happen.',
  },
}

export const getContenido = contenidoPorIdioma(es, { en })
