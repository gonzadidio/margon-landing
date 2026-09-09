/**
 * Contenido del caso Gestio. El texto vive acá para poder editarlo sin tocar
 * el layout.
 *
 * Sólo se usan dos capturas reales: dashboard.png y seguimiento.png. Si
 * alguna todavía no está, el bloque muestra un marcador en vez de romperse.
 */

export const marca = {
  logo: '/projects/gestio/logo.png',
  nombre: 'Gestio',
}

export const hero = {
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
}

export const dia = {
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
}

export const modulos = {
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
}

export const seguimiento = {
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
}

export const cierre = {
  eyebrow: 'Tu próximo paso',
  titulo: ['¿Querés un panel así', 'en tu negocio?'],
  bajada: 'Contanos qué necesitás y lo hacemos realidad.',
  boton: 'Hablemos',
  href: 'https://wa.me/541131930330',
  detalle: ['Sistemas que', 'impulsan negocios', 'reales.'],
}
