// ============================================================
// Configuraciones del generador de presupuestos interactivo.
// Cada entrada define una "propuesta" (módulos, descuentos, textos).
//  - default: catálogo genérico de Margon (servicios a medida).
//  - orbex-admin: sistema administrativo de ORBEX (Fase 2).
// Se selecciona por slug de ruta: /presupuesto (default) o /p/<slug>.
// ============================================================
import {
  Monitor, Smartphone, Database, Settings, Palette, Webhook, Cloud,
  FileText, Globe, ShoppingCart, Rocket, Layers, ClipboardList, PenLine,
  GitBranch, CalendarDays, Wallet, Users, Boxes, ShieldCheck, Plug,
} from 'lucide-react'

// Descuento por tramos según SUBTOTAL (lista). Se toma el primer tramo cuyo
// umbral `min` sea <= subtotal. Tramos ordenados de mayor a menor.
export function discountPct(tiers, subtotal) {
  for (const t of tiers) if (subtotal >= t.min) return t.pct
  return 0
}

/* -------------------- Catálogo genérico Margon -------------------- */
const genericCategories = [
  {
    id: 'web', title: 'Desarrollo Web', icon: Monitor, description: 'Sitios y aplicaciones web a medida',
    items: [
      { id: 'landing', name: 'Landing Page', desc: 'Sitio one-page con diseño premium, animaciones y responsive', price: 300, popular: true },
      { id: 'multipage', name: 'Sitio Multi-página', desc: 'Sitio institucional completo con múltiples secciones y páginas', price: 500 },
      { id: 'webapp', name: 'Aplicación Web (SPA)', desc: 'App interactiva con React/Next.js, estado global y routing', price: 900, popular: true },
      { id: 'ecommerce', name: 'E-Commerce Completo', desc: 'Tienda online con catálogo, carrito, checkout y pasarela de pago', price: 1200 },
      { id: 'blog', name: 'Blog / CMS', desc: 'Sistema de contenido administrable con editor y categorías', price: 400 },
      { id: 'portal', name: 'Portal / Dashboard', desc: 'Panel con métricas, gráficos, tablas y reportes interactivos', price: 800 },
    ],
  },
  {
    id: 'mobile', title: 'Mobile & Apps', icon: Smartphone, description: 'Aplicaciones móviles nativas y multiplataforma',
    items: [
      { id: 'mobileapp', name: 'App Mobile (React Native)', desc: 'Aplicación multiplataforma iOS + Android desde un solo código', price: 1500, popular: true },
      { id: 'pwa', name: 'Progressive Web App', desc: 'App instalable desde el navegador con funcionamiento offline', price: 500 },
      { id: 'pushnotif', name: 'Push Notifications', desc: 'Sistema de notificaciones push para engagement de usuarios', price: 250 },
    ],
  },
  {
    id: 'backend', title: 'Backend & APIs', icon: Database, description: 'Arquitectura de servidor, bases de datos y APIs',
    items: [
      { id: 'api', name: 'API REST', desc: 'Backend completo con endpoints, validación y documentación', price: 600, popular: true },
      { id: 'database', name: 'Diseño de Base de Datos', desc: 'Modelado, relaciones, migraciones y optimización de consultas', price: 350 },
      { id: 'auth', name: 'Sistema de Autenticación', desc: 'Login, registro, JWT/OAuth, roles y permisos de usuario', price: 400 },
      { id: 'websockets', name: 'Real-time (WebSockets)', desc: 'Comunicación en tiempo real para chat, notificaciones o updates', price: 450 },
      { id: 'microservices', name: 'Arquitectura Microservicios', desc: 'Descomposición en servicios independientes y escalables', price: 800 },
    ],
  },
  {
    id: 'admin', title: 'Panel de Admin', icon: Settings, description: 'Herramientas de gestión y administración',
    items: [
      { id: 'adminpanel', name: 'Panel Administrativo', desc: 'CRUD completo, dashboard con métricas, gestión de contenido', price: 600, popular: true },
      { id: 'usermgmt', name: 'Gestión de Usuarios', desc: 'ABM de usuarios, roles, permisos y actividad', price: 300 },
      { id: 'inventory', name: 'Gestión de Inventario', desc: 'Control de stock, productos, categorías y variantes', price: 400 },
      { id: 'appointments', name: 'Sistema de Turnos', desc: 'Agenda online con calendario, disponibilidad y confirmación', price: 450 },
      { id: 'reports', name: 'Reportes y Analytics', desc: 'Generación de reportes exportables con gráficos y filtros', price: 350 },
    ],
  },
  {
    id: 'design', title: 'Diseño UI/UX', icon: Palette, description: 'Interfaces atractivas y experiencia de usuario',
    items: [
      { id: 'uidesign', name: 'Diseño de Interfaces', desc: 'Mockups en Figma, sistema de diseño y guía de estilos', price: 400 },
      { id: 'responsive', name: 'Diseño Responsive', desc: 'Adaptación completa a mobile, tablet y desktop', price: 200, popular: true },
      { id: 'animations', name: 'Animaciones & Micro-interacciones', desc: 'Transiciones fluidas, efectos de scroll y feedback visual', price: 250 },
      { id: 'darkmode', name: 'Modo Oscuro / Claro', desc: 'Theme switching con persistencia de preferencia', price: 150 },
    ],
  },
  {
    id: 'integrations', title: 'Integraciones', icon: Webhook, description: 'Conexiones con servicios y plataformas externas',
    items: [
      { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Botones de contacto, mensajes pre-armados y notificaciones', price: 150, popular: true },
      { id: 'payments', name: 'Pasarela de Pagos', desc: 'MercadoPago, Stripe o PayPal con webhooks', price: 400 },
      { id: 'email', name: 'Email Marketing', desc: 'Integración con Mailchimp, Resend o SendGrid', price: 200 },
      { id: 'maps', name: 'Google Maps', desc: 'Mapa interactivo con ubicación y direcciones', price: 100 },
      { id: 'social', name: 'Redes Sociales', desc: 'Login social, compartir contenido y feeds embebidos', price: 200 },
      { id: 'analytics', name: 'Google Analytics & SEO', desc: 'Tracking de conversiones, métricas y optimización SEO', price: 200 },
    ],
  },
  {
    id: 'infra', title: 'Infraestructura & Deploy', icon: Cloud, description: 'Hosting, deploy y mantenimiento',
    items: [
      { id: 'docker', name: 'Docker & Containerización', desc: 'Docker Compose, imágenes optimizadas y orquestación', price: 250 },
      { id: 'cicd', name: 'CI/CD Pipeline', desc: 'Deploy automático con GitHub Actions, tests y staging', price: 300 },
      { id: 'hosting', name: 'Setup de Hosting', desc: 'Configuración en Vercel, AWS, DigitalOcean o VPS', price: 200, popular: true },
      { id: 'ssl', name: 'SSL & Dominio', desc: 'Configuración de certificado HTTPS y dominio personalizado', price: 100 },
      { id: 'maintenance', name: 'Mantenimiento Mensual', desc: 'Monitoreo, actualizaciones, backups y soporte técnico', price: 150 },
    ],
  },
]

const genericPresets = [
  { name: 'Landing Básica', icon: FileText, desc: 'Sitio one-page con diseño y deploy', ids: ['landing', 'responsive', 'whatsapp', 'hosting', 'ssl', 'analytics'] },
  { name: 'Sitio Institucional', icon: Globe, desc: 'Multi-página con admin y SEO', ids: ['multipage', 'responsive', 'uidesign', 'adminpanel', 'database', 'auth', 'whatsapp', 'maps', 'analytics', 'hosting', 'ssl'] },
  { name: 'E-Commerce Pro', icon: ShoppingCart, desc: 'Tienda completa con pagos y stock', ids: ['ecommerce', 'responsive', 'uidesign', 'animations', 'api', 'database', 'auth', 'adminpanel', 'inventory', 'payments', 'whatsapp', 'email', 'analytics', 'hosting', 'ssl', 'docker'] },
  { name: 'App Completa', icon: Rocket, desc: 'Web app + admin + backend + deploy', ids: ['webapp', 'responsive', 'uidesign', 'animations', 'darkmode', 'api', 'database', 'auth', 'adminpanel', 'usermgmt', 'reports', 'whatsapp', 'analytics', 'docker', 'cicd', 'hosting', 'ssl'] },
]

export const defaultConfig = {
  slug: 'presupuesto',
  eyebrow: 'Generador de Presupuestos Interactivo',
  title: 'Armá tu proyecto',
  titleAccent: 'a medida',
  subtitle: 'Seleccioná los módulos que necesitás y obtené un presupuesto estimado al instante. Cada proyecto es único, personalizá el tuyo.',
  nameLabel: 'Nombre del proyecto o empresa (opcional)',
  currency: 'USD',
  waNumber: '541131930330',
  discountLabel: '50% OFF en todos los módulos',
  discountTiers: [{ min: 0, pct: 0.5 }],
  categories: genericCategories,
  presets: genericPresets,
  terms: [
    'El presupuesto tiene una validez de 30 días corridos.',
    'Se entrega código fuente completo y documentación.',
    'Incluye 2 rondas de revisiones menores post-entrega.',
    'Hosting y dominio no incluidos, corren por cuenta del cliente.',
    'Forma de pago: 50% al inicio, 50% contra entrega.',
    'Soporte técnico post-entrega: 15 días.',
  ],
}

/* -------------------- ORBEX · Sistema Administrativo -------------------- */
const orbexCategories = [
  {
    id: 'nucleo', title: 'Núcleo operativo', icon: ClipboardList, description: 'De la reserva a la firma',
    items: [
      { id: 'operaciones', name: 'Operaciones y Reservas', desc: 'Alta de la reserva desde el celular (desarrolladora, lote, comprobante), estados y alertas de vencimiento.', price: 2400, popular: true },
      { id: 'documentacion', name: 'Documentación y Minutas', desc: 'Minuta, reserva de compra y recibo autocompletados en PDF, con firma del comprador en pantalla.', price: 1000, popular: true },
      { id: 'aprobacion', name: 'Circuito de aprobación', desc: 'Vendedor → supervisor → administración, con revisión, devolución y todo trazado.', price: 800 },
      { id: 'firmas', name: 'Calendario de Firmas', desc: 'Solicitud y confirmación de turno; el aviso llega al vendedor y al supervisor a la vez.', price: 500 },
    ],
  },
  {
    id: 'cobranzas', title: 'Cobranzas y clientes', icon: Wallet, description: 'Cuotas y base de propietarios',
    items: [
      { id: 'cuotas', name: 'Seguimiento de Cuotas', desc: 'Historial de cuotas con comprobante y estado (pendiente/pagada/vencida) + avisos automáticos por WhatsApp.', price: 1300 },
      { id: 'clientes', name: 'Clientes / Propietarios', desc: 'Base de clientes firmados, separada de los leads, lista para campañas de email y difusión por WhatsApp.', price: 1050 },
    ],
  },
  {
    id: 'gestion', title: 'Equipo y administración', icon: ShieldCheck, description: 'Roles, legajos y control',
    items: [
      { id: 'rrhh', name: 'RRHH / Legajos', desc: 'Legajo digital de cada persona: DNI, contrato, CV, comisiones; estado activo/inactivo, todo respaldado.', price: 750 },
      { id: 'admin', name: 'Administración, Roles y Auditoría', desc: 'Área separada de Ventas, 5 roles con su alcance y registro de actividad.', price: 800 },
      { id: 'integracion', name: 'Integración con el CRM comercial', desc: 'Enlaza el lead con la operación — un solo login, sin duplicar nada.', price: 350, popular: true },
    ],
  },
  {
    id: 'extras', title: 'Sumás cuando quieras', icon: Boxes, description: 'Opcionales, por separado',
    items: [
      { id: 'inventario', name: 'Inventario y Activos', desc: 'Notebooks, celulares, vehículos, chips: quién tiene qué, entrega/devolución e historial.', price: 350 },
      { id: 'dashboard', name: 'Dashboard e Indicadores', desc: 'Tablero de leads, operaciones, firmas y cuotas + ROI por equipo (inversión vs. resultados).', price: 400 },
    ],
  },
]

const orbexPresets = [
  { name: 'Arranque administrativo', icon: Rocket, desc: 'Expediente + docs + firma + aprobación', ids: ['operaciones', 'documentacion', 'aprobacion', 'firmas', 'admin', 'integracion'] },
  { name: 'Núcleo mínimo', icon: ClipboardList, desc: 'Lo básico para operar', ids: ['operaciones', 'documentacion', 'aprobacion', 'admin', 'integracion'] },
  { name: 'Cobranzas', icon: Wallet, desc: 'Núcleo + cuotas + clientes', ids: ['operaciones', 'documentacion', 'aprobacion', 'firmas', 'admin', 'integracion', 'cuotas', 'clientes'] },
  { name: 'Sistema completo', icon: Layers, desc: 'Los 9 módulos administrativos', ids: ['operaciones', 'documentacion', 'aprobacion', 'firmas', 'cuotas', 'clientes', 'rrhh', 'admin', 'integracion'] },
]

export const orbexConfig = {
  slug: 'orbex-admin',
  brand: 'ORBEX Desarrollos',
  eyebrow: 'Fase 2 · Sistema Operativo & Administrativo',
  title: 'Armá tu sistema',
  titleAccent: 'administrativo',
  subtitle: 'Elegí los módulos que querés arrancar ahora. Sumás el resto cuando quieras — igual que hicimos con lo comercial. El precio se ajusta solo, con más descuento a mayor combo.',
  nameLabel: 'Tu nombre / a nombre de quién (para identificar la propuesta)',
  currency: 'USD',
  waNumber: '541131930330',
  discountLabel: 'Descuento por combo · hasta 16% OFF',
  // Descuento por tramos según subtotal: cuanto más suman, mejor el precio.
  discountTiers: [
    { min: 8000, pct: 0.16 },
    { min: 6000, pct: 0.13 },
    { min: 4000, pct: 0.10 },
    { min: 2500, pct: 0.06 },
    { min: 0, pct: 0 },
  ],
  categories: orbexCategories,
  presets: orbexPresets,
  paymentNote: 'Pagable en cuotas mensuales (a coordinar). Abono mensual del sistema: USD 300/mes (hosting, servidor, base de datos, backups y soporte).',
  terms: [
    'Valores en USD. Propuesta válida 15 días.',
    'Entrega por etapas, con una parte funcionando cada semana.',
    'Incluye PWA (app en el celular) y envío de emails, sin cargo.',
    'Garantía de 30 días: bugs corregidos sin cargo.',
    'El código queda de ORBEX (sin alquiler).',
    'WhatsApp y emails: lo entrante y los avisos dentro de 24 h, sin cargo; el volumen alto lo cobra el proveedor aparte.',
  ],
}

const CONFIGS = {
  [defaultConfig.slug]: defaultConfig,
  [orbexConfig.slug]: orbexConfig,
}

// Devuelve la config por slug (o la default).
export function getPresupuestoConfig(slug) {
  return CONFIGS[slug] || defaultConfig
}
