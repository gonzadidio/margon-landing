/**
 * English dictionary. Mirrors es.js key by key: if a key is missing here the
 * site falls back to Spanish and logs a warning in development.
 */

export const en = {
  // <title> and meta description; the provider applies them on language change.
  meta: {
    title: 'Margon — Software House | High-End Digital Solutions',
    description: 'Margon turns ideas and processes into real digital solutions. Web development, mobile apps, ecommerce, custom systems and more.',
  },

  nav: {
    // Clients and Solutions were dropped from the menu: those sections don't exist yet.
    links: [
      { label: 'Services', href: '#servicios' },
      { label: 'Projects', href: '#proyectos' },
    ],
    cta: "Let's talk",
    abrirMenu: 'Open menu',
    cerrarMenu: 'Close menu',
    idioma: 'Language',
    cambiarIdioma: 'Change language',
  },

  hero: {
    // Decorative pseudo-code on the left of the hero
    codigo: {
      idea: 'idea',
      negocio: 'business',
      desafio: 'challenge',
      detectar: 'detect',
      estrategia: 'strategy',
      disenar: 'design',
      desarrollar: 'build',
      tecnologia: 'technology',
      escalable: 'scalable',
      segura: 'secure',
      eficiente: 'efficient',
      conectada: 'connected',
      sistema: 'system',
      implementar: 'deploy',
      resultados: 'real_results',
    },
    titulo: {
      antes: 'We turn',
      resaltado1: 'ideas',
      medio: 'into real',
      resaltado2: 'digital solutions',
      despues: '',
    },
    idea: {
      titulo: 'Your idea / challenge',
      items: [
        { title: 'Business goals', sub: 'What you want to achieve and where you want to grow.' },
        { title: 'User needs', sub: 'What they need and how they interact.' },
        { title: 'Processes to improve', sub: 'What we can simplify or optimise.' },
        { title: 'Current pain points', sub: "What's slowing your operation down today." },
      ],
    },
    desarrollo: {
      titulo: 'How we build it',
      steps: [
        { title: 'Experience', sub: 'UX / UI / Branding' },
        { title: 'Interface', sub: 'Web / Mobile / Ecommerce' },
        { title: 'Logic', sub: 'Backend / APIs / Integrations' },
        { title: 'Data', sub: 'Databases / Analytics / BI' },
        { title: 'Infrastructure', sub: 'Cloud / Security / Scalability' },
      ],
    },
    solucion: {
      titulo: 'Your solution, shipped as a system',
      dashboard: 'Dashboard',
      rango: 'May 01 - May 31',
      metricas: [
        { label: 'Sales', valor: '$ 2.4 M', alza: '12%' },
        { label: 'Customers', valor: '1,892', alza: '8%' },
        { label: 'Orders', valor: '482', alza: '15%' },
        { label: 'Products', valor: '1,250', alza: '7%' },
      ],
      subtituloModulos: 'Core modules',
      modulos: [
        { titulo: 'Sales CRM', detalle: 'Leads, customers and opportunities' },
        { titulo: 'Back Office', detalle: 'Administration and finance' },
        { titulo: 'Inventory', detalle: 'Stock, products and movements' },
        { titulo: 'Client Portal', detalle: 'Orders, requests and tracking' },
      ],
    },
    tech: {
      etiqueta1: 'Technologies',
      etiqueta2: 'we work with',
      alt: 'Technologies we work with: React, Next.js, Node.js, TypeScript, Python, PostgreSQL, AWS and Docker',
    },
    acciones: {
      primario: 'Start your project',
      secundario: 'See our work',
    },
  },

  services: {
    tituloLinea1: 'Design, engineering and data.',
    tituloLinea2Antes: 'All in',
    tituloLinea2Resaltado: 'one place.',
    items: [
      {
        title: 'Product & Design',
        text: 'Research, UX/UI, design systems and prototypes that connect with users and business goals.',
      },
      {
        title: 'Web & Mobile Development',
        text: 'Fast, scalable and responsive applications for the web and mobile devices.',
      },
      {
        title: 'Backend & APIs',
        text: 'We build the logic, APIs and integrations that keep your whole product running.',
      },
      {
        title: 'Data & Analytics',
        text: 'Databases, reports and dashboards so you can decide based on real information.',
      },
      {
        title: 'Automation',
        text: 'We connect tools and automate processes so your team can focus on what matters.',
      },
      {
        title: 'Integrations & Cloud',
        text: 'We connect third-party systems and deploy to the cloud with security and scalability.',
      },
    ],
    // Copy inside each card's mockup
    visuales: {
      publicar: 'Publish project',
      phoneTitulo: 'Discover ideas',
      phoneSub: 'Design made for you.',
      meses: ['Jan', 'Feb', 'Apr', 'May'],
      flujo: {
        lead: 'Lead',
        crm: 'CRM',
        venta: 'Sale',
        factura: 'Invoice',
        reporte: 'Report',
      },
    },
  },

  projects: {
    eyebrow: 'Projects',
    tituloAntes: 'What we build',
    tituloResaltado: 'speaks for us',
    verCaso: 'View case study',
    badgeWeb: 'Web',
    badgeMobile: 'Mobile',
    sinImagen: 'Screenshot coming soon',
    slot: {
      eyebrow: 'Next case study',
      titulo: 'Reserved space',
      texto: 'This slot is ready for the fourth featured project.',
    },
    otros: {
      titulo: 'Other projects',
      subtitulo: 'Swipe to see them all.',
      anteriores: 'See previous projects',
      siguientes: 'See more projects',
    },
  },

  cta: {
    badge: 'Book a no-strings call',
    tituloAntes: 'Ready to take your business to the',
    tituloResaltado: 'next level',
    tituloDespues: '?',
    texto: 'Tell us your idea or your challenge. In a 30-minute call we show you how we can help you turn it into reality.',
    boton: 'Get in touch',
    nota: 'No commitment. No spam. We reply in under 24 hours.',
  },

  footer: {
    descripcion: 'We turn ideas and processes into real digital solutions. High-end software for companies that want to grow.',
    columnas: [
      {
        titulo: 'Services',
        links: [
          { label: 'Web Applications', href: '#servicios' },
          { label: 'Mobile Apps', href: '#servicios' },
          { label: 'E-Commerce', href: '#servicios' },
          { label: 'Custom Systems', href: '#servicios' },
          { label: 'Automation', href: '#servicios' },
        ],
      },
      {
        titulo: 'Company',
        links: [
          { label: 'About Us', href: '#' },
          { label: 'Blog', href: '#' },
          { label: 'Careers', href: '#' },
          { label: 'Contact', href: '#contacto' },
        ],
      },
      {
        titulo: 'Legal',
        links: [
          { label: 'Privacy', href: '#' },
          { label: 'Terms', href: '#' },
          { label: 'Cookies', href: '#' },
        ],
      },
    ],
    derechos: 'All rights reserved.',
    hecho: 'Made with care in Argentina',
  },

  // Generic case study page (/proyecto/:slug)
  detalle: {
    noEncontrado: 'Project not found.',
    volverProyectos: '← Back to projects',
    proyectos: 'Projects',
    verSitio: 'Visit site',
    volver: 'Back',
    tecnologias: 'Technologies',
    duracion: 'Timeline',
    resultados: 'Results',
    queHace: 'What it does',
    cierreTitulo: 'Got a project like this in mind?',
    cierreTexto: 'Tell us what you need and we make it happen.',
    cierreBoton: "Let's talk",
    cierreSecundario: 'See more projects',
  },

  // Shared labels across the custom case study pages
  caso: {
    proyectos: 'Projects',
    volver: 'Back',
    capturaPendiente: 'Screenshot coming soon',
    contactanos: 'Contact us',
    hablemos: "Let's talk",
    conocerProyecto: 'Explore the project',
    volverProyectos: 'Back to projects',
  },
}
