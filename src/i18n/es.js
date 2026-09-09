/**
 * Diccionario en español (idioma de referencia).
 *
 * Regla: en.js tiene que tener exactamente las mismas claves. Si falta una,
 * el sitio cae a este archivo y avisa por consola en desarrollo.
 */

export const es = {
  // <title> y meta description; el provider los aplica al cambiar de idioma.
  meta: {
    title: 'Margon — Software House | Soluciones Digitales de Alto Nivel',
    description: 'Margon transforma ideas y procesos en soluciones digitales reales. Desarrollo web, apps mobile, ecommerce, sistemas a medida y más.',
  },

  nav: {
    // Clientes y Soluciones salieron del menú: esas secciones no existen todavía.
    links: [
      { label: 'Servicios', href: '#servicios' },
      { label: 'Proyectos', href: '#proyectos' },
    ],
    cta: 'Hablemos',
    abrirMenu: 'Abrir menú',
    cerrarMenu: 'Cerrar menú',
    idioma: 'Idioma',
    cambiarIdioma: 'Cambiar idioma',
  },

  hero: {
    // Pseudocódigo decorativo de la izquierda del hero
    codigo: {
      idea: 'idea',
      negocio: 'negocio',
      desafio: 'desafio',
      detectar: 'detectar',
      estrategia: 'estrategia',
      disenar: 'diseñar',
      desarrollar: 'desarrollar',
      tecnologia: 'tecnologia',
      escalable: 'escalable',
      segura: 'segura',
      eficiente: 'eficiente',
      conectada: 'conectada',
      sistema: 'sistema',
      implementar: 'implementar',
      resultados: 'resultados_reales',
    },
    titulo: {
      antes: 'Transformamos',
      resaltado1: 'ideas',
      medio: 'en',
      resaltado2: 'soluciones digitales',
      despues: 'reales',
    },
    idea: {
      titulo: 'Tu idea / desafío',
      items: [
        { title: 'Objetivos del negocio', sub: 'Qué querés lograr y hacia dónde crecer.' },
        { title: 'Necesidades de usuarios', sub: 'Qué necesitan y cómo interactúan.' },
        { title: 'Procesos a mejorar', sub: 'Qué podemos simplificar u optimizar.' },
        { title: 'Problemas actuales', sub: 'Qué está frenando hoy tu operación.' },
      ],
    },
    desarrollo: {
      titulo: 'Nuestro desarrollo',
      steps: [
        { title: 'Experiencia', sub: 'UX / UI / Branding' },
        { title: 'Interfaz', sub: 'Web / Mobile / Ecommerce' },
        { title: 'Lógica', sub: 'Backend / APIs / Integraciones' },
        { title: 'Datos', sub: 'Databases / Analytics / BI' },
        { title: 'Infraestructura', sub: 'Cloud / Seguridad / Escalabilidad' },
      ],
    },
    solucion: {
      titulo: 'Solución plasmada en sistema',
      dashboard: 'Dashboard',
      rango: '01 May - 31 May',
      metricas: [
        { label: 'Ventas', valor: '$ 2.4 M', alza: '12%' },
        { label: 'Clientes', valor: '1.892', alza: '8%' },
        { label: 'Pedidos', valor: '482', alza: '15%' },
        { label: 'Productos', valor: '1.250', alza: '7%' },
      ],
      subtituloModulos: 'Módulos principales',
      modulos: [
        { titulo: 'CRM Comercial', detalle: 'Leads, clientes y oportunidades' },
        { titulo: 'Gestión Administrativa', detalle: 'Administración y financiera' },
        { titulo: 'Inventario', detalle: 'Stock, productos y movimientos' },
        { titulo: 'Portal Clientes', detalle: 'Pedidos, consultas y seguimiento' },
      ],
    },
    tech: {
      etiqueta1: 'Tecnologías',
      etiqueta2: 'que utilizamos',
      alt: 'Tecnologías que utilizamos: React, Next.js, Node.js, TypeScript, Python, PostgreSQL, AWS y Docker',
    },
    acciones: {
      primario: 'Empezá tu proyecto',
      secundario: 'Ver proyectos',
    },
  },

  services: {
    tituloLinea1: 'Diseño, desarrollo y datos.',
    tituloLinea2Antes: 'Todo en',
    tituloLinea2Resaltado: 'un solo lugar.',
    items: [
      {
        title: 'Producto & Diseño',
        text: 'Investigación, UX/UI, design systems y prototipos que conectan con usuarios y objetivos de negocio.',
      },
      {
        title: 'Desarrollo Web & Mobile',
        text: 'Aplicaciones rápidas, escalables y responsivas para web y dispositivos móviles.',
      },
      {
        title: 'Backend & APIs',
        text: 'Desarrollamos la lógica, APIs e integraciones que hacen funcionar todo tu producto.',
      },
      {
        title: 'Datos & Analytics',
        text: 'Bases de datos, reportes y dashboards para tomar decisiones basadas en información real.',
      },
      {
        title: 'Automatizaciones',
        text: 'Conectamos herramientas y automatizamos procesos para que tu equipo enfoque lo que importa.',
      },
      {
        title: 'Integraciones & Cloud',
        text: 'Conectamos sistemas terceros y desplegamos en la nube con seguridad y escalabilidad.',
      },
    ],
    // Textos dentro de los mockups de cada tarjeta
    visuales: {
      publicar: 'Publicar proyecto',
      phoneTitulo: 'Descubrí ideas',
      phoneSub: 'Diseño pensado para vos.',
      meses: ['Ene', 'Feb', 'Abr', 'May'],
      flujo: {
        lead: 'Lead',
        crm: 'CRM',
        venta: 'Venta',
        factura: 'Factura',
        reporte: 'Reporte',
      },
    },
  },

  projects: {
    eyebrow: 'Proyectos',
    tituloAntes: 'Lo que construimos',
    tituloResaltado: 'habla por nosotros',
    verCaso: 'Ver el caso',
    badgeWeb: 'Web',
    badgeMobile: 'Mobile',
    sinImagen: 'Captura pendiente',
    slot: {
      eyebrow: 'Próximo caso',
      titulo: 'Espacio reservado',
      texto: 'Este lugar queda listo para el cuarto proyecto destacado.',
    },
    otros: {
      titulo: 'Otros proyectos',
      subtitulo: 'Deslizá para verlos todos.',
      anteriores: 'Ver proyectos anteriores',
      siguientes: 'Ver más proyectos',
    },
  },

  cta: {
    badge: 'Agendá una reunión sin compromiso',
    tituloAntes: '¿Listo para llevar tu negocio al',
    tituloResaltado: 'siguiente nivel',
    tituloDespues: '?',
    texto: 'Contanos tu idea o tu desafío. En una llamada de 30 minutos te mostramos cómo podemos ayudarte a transformarlo en realidad.',
    boton: 'Escribinos',
    nota: 'Sin compromiso. Sin spam. Respuesta en menos de 24 horas.',
  },

  footer: {
    descripcion: 'Transformamos ideas y procesos en soluciones digitales reales. Software de alto nivel para empresas que quieren crecer.',
    columnas: [
      {
        titulo: 'Servicios',
        links: [
          { label: 'Aplicaciones Web', href: '#servicios' },
          { label: 'Apps Mobile', href: '#servicios' },
          { label: 'E-Commerce', href: '#servicios' },
          { label: 'Sistemas a Medida', href: '#servicios' },
          { label: 'Automatizaciones', href: '#servicios' },
        ],
      },
      {
        titulo: 'Empresa',
        links: [
          { label: 'Sobre Nosotros', href: '#' },
          { label: 'Blog', href: '#' },
          { label: 'Carreras', href: '#' },
          { label: 'Contacto', href: '#contacto' },
        ],
      },
      {
        titulo: 'Legal',
        links: [
          { label: 'Privacidad', href: '#' },
          { label: 'Términos', href: '#' },
          { label: 'Cookies', href: '#' },
        ],
      },
    ],
    derechos: 'Todos los derechos reservados.',
    hecho: 'Hecho con dedicación en Argentina',
  },

  // Página genérica de caso (/proyecto/:slug)
  detalle: {
    noEncontrado: 'Proyecto no encontrado.',
    volverProyectos: '← Volver a proyectos',
    proyectos: 'Proyectos',
    verSitio: 'Ver sitio',
    volver: 'Volver',
    tecnologias: 'Tecnologías',
    duracion: 'Duración',
    resultados: 'Resultados',
    queHace: 'Qué hace',
    cierreTitulo: '¿Tenés un proyecto así en mente?',
    cierreTexto: 'Contanos qué necesitás y lo hacemos realidad.',
    cierreBoton: 'Hablemos',
    cierreSecundario: 'Ver más proyectos',
  },

  // Etiquetas compartidas por las páginas de caso propias
  caso: {
    proyectos: 'Proyectos',
    volver: 'Volver',
    capturaPendiente: 'Captura pendiente',
    contactanos: 'Contactanos',
    hablemos: 'Hablemos',
    conocerProyecto: 'Conocé el proyecto',
    volverProyectos: 'Volver a proyectos',
  },
}
