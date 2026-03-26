import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Check, Plus, Minus, Monitor, Smartphone, ShoppingCart, Shield, Database,
  Palette, Zap, MessageSquare, Search, Cloud, Settings, CreditCard,
  BarChart3, Globe, Headphones, ArrowLeft, Download, Send, ChevronDown,
  ChevronUp, Layers, Lock, Cpu, Webhook, BellRing, FileText, Users,
  CalendarDays, PackageCheck, Rocket, X
} from 'lucide-react'
import Logo from './Logo'

const categories = [
  {
    id: 'web',
    title: 'Desarrollo Web',
    icon: Monitor,
    description: 'Sitios y aplicaciones web a medida',
    items: [
      { id: 'landing', name: 'Landing Page', desc: 'Sitio one-page con diseño premium, animaciones y responsive', price: 300, popular: true },
      { id: 'multipage', name: 'Sitio Multi-página', desc: 'Sitio institucional completo con múltiples secciones y páginas', price: 500 },
      { id: 'webapp', name: 'Aplicación Web (SPA)', desc: 'App interactiva con React/Next.js, estado global y routing', price: 900, popular: true },
      { id: 'ecommerce', name: 'E-Commerce Completo', desc: 'Tienda online con catálogo, carrito, checkout y pasarela de pago', price: 1200 },
      { id: 'blog', name: 'Blog / CMS', desc: 'Sistema de contenido administrable con editor y categorías', price: 400 },
      { id: 'portal', name: 'Portal / Dashboard', desc: 'Panel con métricas, gráficos, tablas y reportes interactivos', price: 800 },
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile & Apps',
    icon: Smartphone,
    description: 'Aplicaciones móviles nativas y multiplataforma',
    items: [
      { id: 'mobileapp', name: 'App Mobile (React Native)', desc: 'Aplicación multiplataforma iOS + Android desde un solo código', price: 1500, popular: true },
      { id: 'pwa', name: 'Progressive Web App', desc: 'App instalable desde el navegador con funcionamiento offline', price: 500 },
      { id: 'pushnotif', name: 'Push Notifications', desc: 'Sistema de notificaciones push para engagement de usuarios', price: 250 },
    ]
  },
  {
    id: 'backend',
    title: 'Backend & APIs',
    icon: Database,
    description: 'Arquitectura de servidor, bases de datos y APIs',
    items: [
      { id: 'api', name: 'API REST', desc: 'Backend completo con endpoints, validación y documentación', price: 600, popular: true },
      { id: 'database', name: 'Diseño de Base de Datos', desc: 'Modelado, relaciones, migraciones y optimización de consultas', price: 350 },
      { id: 'auth', name: 'Sistema de Autenticación', desc: 'Login, registro, JWT/OAuth, roles y permisos de usuario', price: 400 },
      { id: 'websockets', name: 'Real-time (WebSockets)', desc: 'Comunicación en tiempo real para chat, notificaciones o updates', price: 450 },
      { id: 'microservices', name: 'Arquitectura Microservicios', desc: 'Descomposición en servicios independientes y escalables', price: 800 },
    ]
  },
  {
    id: 'admin',
    title: 'Panel de Admin',
    icon: Settings,
    description: 'Herramientas de gestión y administración',
    items: [
      { id: 'adminpanel', name: 'Panel Administrativo', desc: 'CRUD completo, dashboard con métricas, gestión de contenido', price: 600, popular: true },
      { id: 'usermgmt', name: 'Gestión de Usuarios', desc: 'ABM de usuarios, roles, permisos y actividad', price: 300 },
      { id: 'inventory', name: 'Gestión de Inventario', desc: 'Control de stock, productos, categorías y variantes', price: 400 },
      { id: 'appointments', name: 'Sistema de Turnos', desc: 'Agenda online con calendario, disponibilidad y confirmación', price: 450 },
      { id: 'reports', name: 'Reportes y Analytics', desc: 'Generación de reportes exportables con gráficos y filtros', price: 350 },
    ]
  },
  {
    id: 'design',
    title: 'Diseño UI/UX',
    icon: Palette,
    description: 'Interfaces atractivas y experiencia de usuario',
    items: [
      { id: 'uidesign', name: 'Diseño de Interfaces', desc: 'Mockups en Figma, sistema de diseño y guía de estilos', price: 400 },
      { id: 'responsive', name: 'Diseño Responsive', desc: 'Adaptación completa a mobile, tablet y desktop', price: 200, popular: true },
      { id: 'animations', name: 'Animaciones & Micro-interacciones', desc: 'Transiciones fluidas, efectos de scroll y feedback visual', price: 250 },
      { id: 'darkmode', name: 'Modo Oscuro / Claro', desc: 'Theme switching con persistencia de preferencia', price: 150 },
    ]
  },
  {
    id: 'integrations',
    title: 'Integraciones',
    icon: Webhook,
    description: 'Conexiones con servicios y plataformas externas',
    items: [
      { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Botones de contacto, mensajes pre-armados y notificaciones', price: 150, popular: true },
      { id: 'payments', name: 'Pasarela de Pagos', desc: 'MercadoPago, Stripe o PayPal con webhooks', price: 400 },
      { id: 'email', name: 'Email Marketing', desc: 'Integración con Mailchimp, Resend o SendGrid', price: 200 },
      { id: 'maps', name: 'Google Maps', desc: 'Mapa interactivo con ubicación y direcciones', price: 100 },
      { id: 'social', name: 'Redes Sociales', desc: 'Login social, compartir contenido y feeds embebidos', price: 200 },
      { id: 'analytics', name: 'Google Analytics & SEO', desc: 'Tracking de conversiones, métricas y optimización SEO', price: 200 },
    ]
  },
  {
    id: 'infra',
    title: 'Infraestructura & Deploy',
    icon: Cloud,
    description: 'Hosting, deploy y mantenimiento',
    items: [
      { id: 'docker', name: 'Docker & Containerización', desc: 'Docker Compose, imágenes optimizadas y orquestación', price: 250 },
      { id: 'cicd', name: 'CI/CD Pipeline', desc: 'Deploy automático con GitHub Actions, tests y staging', price: 300 },
      { id: 'hosting', name: 'Setup de Hosting', desc: 'Configuración en Vercel, AWS, DigitalOcean o VPS', price: 200, popular: true },
      { id: 'ssl', name: 'SSL & Dominio', desc: 'Configuración de certificado HTTPS y dominio personalizado', price: 100 },
      { id: 'maintenance', name: 'Mantenimiento Mensual', desc: 'Monitoreo, actualizaciones, backups y soporte técnico', price: 150 },
    ]
  },
]

const DISCOUNT = 0.50 // 50% de descuento

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price)
}

function CategorySection({ category, selected, onToggle }) {
  const [expanded, setExpanded] = useState(true)
  const Icon = category.icon
  const selectedCount = category.items.filter(i => selected.has(i.id)).length
  const categoryTotal = category.items.filter(i => selected.has(i.id)).reduce((sum, i) => sum + Math.round(i.price * (1 - DISCOUNT)), 0)

  return (
    <div className="mb-6">
      {/* Category Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 p-4 rounded-xl glass glow-sm hover:border-primary-500/30 transition-all duration-300 group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600/20 to-accent-600/20 border border-primary-500/20 flex items-center justify-center group-hover:border-primary-500/40 transition-colors">
            <Icon size={20} className="text-primary-400" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-white">{category.title}</h3>
            <p className="text-xs text-surface-200/50">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <span className="text-xs font-semibold text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full border border-primary-500/20">
              {selectedCount} sel.
            </span>
          )}
          {categoryTotal > 0 && (
            <span className="text-sm font-bold gradient-text hidden sm:block">
              {formatPrice(categoryTotal)}
            </span>
          )}
          {expanded
            ? <ChevronUp size={18} className="text-surface-200/40" />
            : <ChevronDown size={18} className="text-surface-200/40" />
          }
        </div>
      </button>

      {/* Items */}
      {expanded && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 sm:pl-4">
          {category.items.map((item) => {
            const isSelected = selected.has(item.id)
            return (
              <button
                key={item.id}
                onClick={() => onToggle(item.id)}
                className={`group relative text-left w-full p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-primary-500/8 border-primary-500/30 shadow-[0_0_20px_rgba(16,185,129,0.06)]'
                    : 'bg-surface-950/40 border-white/5 hover:border-white/10 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-br from-primary-500 to-accent-500 border-transparent'
                      : 'border-white/20 group-hover:border-white/40'
                  }`}>
                    {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-white' : 'text-surface-200/70'}`}>
                        {item.name}
                      </span>
                      {item.popular && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent-400 bg-accent-500/10 px-1.5 py-0.5 rounded-full border border-accent-500/20">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed transition-colors ${isSelected ? 'text-surface-200/50' : 'text-surface-200/30'}`}>
                      {item.desc}
                    </p>
                  </div>
                  {/* Price */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className={`text-[10px] line-through transition-all ${
                      isSelected ? 'text-surface-200/30' : 'text-surface-200/20'
                    }`}>
                      {formatPrice(item.price)}
                    </span>
                    <span className={`text-sm font-bold transition-all ${
                      isSelected ? 'gradient-text' : 'text-surface-200/30'
                    }`}>
                      {formatPrice(Math.round(item.price * (1 - DISCOUNT)))}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Preset packs
const presets = [
  {
    name: 'Landing Básica',
    icon: FileText,
    desc: 'Sitio one-page con diseño y deploy',
    ids: ['landing', 'responsive', 'whatsapp', 'hosting', 'ssl', 'analytics'],
  },
  {
    name: 'Sitio Institucional',
    icon: Globe,
    desc: 'Multi-página con admin y SEO',
    ids: ['multipage', 'responsive', 'uidesign', 'adminpanel', 'database', 'auth', 'whatsapp', 'maps', 'analytics', 'hosting', 'ssl'],
  },
  {
    name: 'E-Commerce Pro',
    icon: ShoppingCart,
    desc: 'Tienda completa con pagos y stock',
    ids: ['ecommerce', 'responsive', 'uidesign', 'animations', 'api', 'database', 'auth', 'adminpanel', 'inventory', 'payments', 'whatsapp', 'email', 'analytics', 'hosting', 'ssl', 'docker'],
  },
  {
    name: 'App Completa',
    icon: Rocket,
    desc: 'Web app + admin + backend + deploy',
    ids: ['webapp', 'responsive', 'uidesign', 'animations', 'darkmode', 'api', 'database', 'auth', 'adminpanel', 'usermgmt', 'reports', 'whatsapp', 'analytics', 'docker', 'cicd', 'hosting', 'ssl'],
  },
]

export default function BudgetBuilder() {
  const [selected, setSelected] = useState(new Set())
  const [clientName, setClientName] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const summaryRef = useRef(null)

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    const allIds = categories.flatMap(c => c.items.map(i => i.id))
    setSelected(new Set(allIds))
  }

  const clearAll = () => setSelected(new Set())

  const applyPreset = (ids) => setSelected(new Set(ids))

  const allItems = useMemo(() => categories.flatMap(c => c.items), [])
  const selectedItems = useMemo(() => allItems.filter(i => selected.has(i.id)), [selected, allItems])
  const subtotal = useMemo(() => selectedItems.reduce((s, i) => s + i.price, 0), [selectedItems])
  const discountAmount = useMemo(() => Math.round(subtotal * DISCOUNT), [subtotal])
  const total = subtotal - discountAmount
  const totalModules = allItems.length
  const selectedPercent = Math.round((selectedItems.length / totalModules) * 100)

  // Generate WhatsApp message
  const generateWhatsAppMsg = () => {
    let msg = `*Presupuesto Margon Software*\n`
    if (clientName) msg += `Cliente: ${clientName}\n`
    msg += `\n`
    categories.forEach(cat => {
      const catItems = cat.items.filter(i => selected.has(i.id))
      if (catItems.length > 0) {
        msg += `*${cat.title}*\n`
        catItems.forEach(i => { msg += `  - ${i.name} -- ${formatPrice(i.price)}\n` })
        msg += `\n`
      }
    })
    msg += `Subtotal: ${formatPrice(subtotal)}\n`
    msg += `Descuento 50%: -${formatPrice(discountAmount)}\n`
    msg += `*Total: ${formatPrice(total)} USD*\n`
    msg += `${selectedItems.length} modulos seleccionados`
    return encodeURIComponent(msg)
  }

  const generatePDF = () => {
    const date = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
    let rows = ''
    let counter = 1
    categories.forEach(cat => {
      const catItems = cat.items.filter(i => selected.has(i.id))
      if (catItems.length === 0) return
      const catTotal = catItems.reduce((s, i) => s + i.price, 0)
      rows += `<tr class="cat-row"><td colspan="3">${cat.title}</td><td class="cat-total">${formatPrice(catTotal)}</td></tr>`
      catItems.forEach(i => {
        rows += `<tr><td class="num">${String(counter++).padStart(2,'0')}</td><td>${i.name}</td><td class="desc">${i.desc}</td><td class="price">${formatPrice(i.price)}</td></tr>`
      })
    })

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Presupuesto - Margon Software</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
@page{size:A4;margin:0}
body{font-family:'Inter',sans-serif;color:#1f2937;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:794px;min-height:1123px;margin:0 auto;background:#fff;position:relative;overflow:hidden}
.header{background:linear-gradient(135deg,#064e3b 0%,#0a0f0d 100%);color:#fff;padding:32px 44px 28px;position:relative;overflow:hidden}
.header::before{content:'';position:absolute;top:-40%;right:-8%;width:240px;height:240px;background:#10b981;border-radius:50%;opacity:.07}
.hc{display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1}
.brand{font-size:20px;font-weight:800;letter-spacing:-.5px}
.brand span{color:#34d399}
.brand-sub{font-size:10px;font-weight:300;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-top:3px}
.doc-title{font-size:28px;font-weight:800;letter-spacing:-1px;text-align:right}
.doc-meta{font-size:10px;color:rgba(255,255,255,.5);text-align:right;line-height:1.7;margin-top:6px}
.doc-meta strong{color:rgba(255,255,255,.85)}
.bar{height:3px;background:linear-gradient(90deg,#10b981,#a3e635,transparent)}
.body{padding:24px 44px 60px}
.info{display:flex;justify-content:space-between;margin-bottom:18px;gap:24px}
.info-block{flex:1}
.info-title{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:#10b981;margin-bottom:7px;padding-bottom:5px;border-bottom:1.5px solid #f3f4f6}
.info-row{display:flex;justify-content:space-between;font-size:10px;padding:2px 0}
.info-label{color:#9ca3af}
.info-value{color:#1f2937;font-weight:500}
table{width:100%;border-collapse:collapse;font-size:9.5px;margin-bottom:16px}
thead th{background:#064e3b;color:#fff;font-weight:600;font-size:8px;text-transform:uppercase;letter-spacing:1px;padding:7px 10px;text-align:left}
thead th:first-child{border-radius:5px 0 0 0;width:5%}
thead th:last-child{border-radius:0 5px 0 0;text-align:right;width:14%}
tbody td{padding:5px 10px;border-bottom:1px solid #f3f4f6;vertical-align:top}
.num{color:#9ca3af;font-weight:600;text-align:center}
.desc{color:#9ca3af;font-size:8.5px}
.price{text-align:right;font-weight:600;color:#374151;white-space:nowrap}
.cat-row{background:#f9fafb}
.cat-row td{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#10b981;padding:6px 10px;border-bottom:1px solid #e5e7eb}
.cat-total{text-align:right;font-weight:700;color:#374151}
.totals{display:flex;justify-content:flex-end;margin-bottom:16px}
.totals-box{width:230px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:10px;border-bottom:1px solid #f3f4f6}
.total-row-label{color:#6b7280}
.total-row-value{font-weight:600;color:#374151}
.total-final{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:linear-gradient(135deg,#064e3b,#0a0f0d);border-radius:8px;margin-top:6px}
.total-final-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.6)}
.total-final-value{font-size:22px;font-weight:800;color:#fff}
.total-final-currency{font-size:12px;font-weight:600;color:#34d399;margin-right:2px}
.terms{background:#f9fafb;border-radius:6px;padding:12px 14px}
.terms-title{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:#1f2937;margin-bottom:7px}
.terms-list{list-style:none}
.terms-list li{font-size:8.5px;color:#6b7280;padding:2px 0 2px 12px;position:relative}
.terms-list li::before{content:'';position:absolute;left:0;top:8px;width:3px;height:3px;background:#10b981;border-radius:50%}
.footer{position:absolute;bottom:0;left:0;right:0;padding:14px 44px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f3f4f6;font-size:8px;color:#9ca3af}
.footer-accent{color:#10b981;font-weight:600}
.section-title{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:#10b981;margin-bottom:8px}
@media print{.no-print{display:none!important}}
.print-btn{position:fixed;bottom:24px;right:24px;background:linear-gradient(135deg,#059669,#65a30d);color:#fff;border:none;padding:12px 24px;border-radius:50px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 8px 20px rgba(16,185,129,.35);display:flex;align-items:center;gap:8px;z-index:1000}
</style></head><body>
<button class="print-btn no-print" onclick="window.print()">&#128438; Guardar como PDF</button>
<div class="page">
<div class="header"><div class="hc">
<div><div class="brand">MARGON <span>SOFTWARE</span></div><div class="brand-sub">Desarrollo a medida</div></div>
<div><div class="doc-title">PRESUPUESTO</div><div class="doc-meta"><strong>Fecha:</strong> ${date}<br><strong>Validez:</strong> 30 d&iacute;as</div></div>
</div></div>
<div class="bar"></div>
<div class="body">
<div class="info">
<div class="info-block"><div class="info-title">Datos del cliente</div>
<div class="info-row"><span class="info-label">Proyecto</span><span class="info-value">${clientName || 'Sin especificar'}</span></div>
<div class="info-row"><span class="info-label">M&oacute;dulos</span><span class="info-value">${selectedItems.length} seleccionados</span></div>
</div>
<div class="info-block"><div class="info-title">Datos del proveedor</div>
<div class="info-row"><span class="info-label">Empresa</span><span class="info-value">Margon Software</span></div>
<div class="info-row"><span class="info-label">Modalidad</span><span class="info-value">Proyecto llave en mano</span></div>
</div></div>
<div class="section-title">Desglose de servicios</div>
<table><thead><tr><th>#</th><th>M&oacute;dulo</th><th>Descripci&oacute;n</th><th style="text-align:right">Valor</th></tr></thead><tbody>${rows}</tbody></table>
<div class="totals"><div class="totals-box">
<div class="total-row"><span class="total-row-label">Subtotal</span><span class="total-row-value">${formatPrice(subtotal)}</span></div>
<div class="total-row"><span class="total-row-label" style="color:#10b981;font-weight:600">Descuento 50%</span><span class="total-row-value" style="color:#10b981;font-weight:600">-${formatPrice(discountAmount)}</span></div>
<div class="total-final"><span class="total-final-label">Total</span><span class="total-final-value"><span class="total-final-currency">USD</span>${total.toLocaleString('en-US')}</span></div>
</div></div>
<div class="terms"><div class="terms-title">T&eacute;rminos y condiciones</div><ul class="terms-list">
<li>El presupuesto tiene una validez de 30 d&iacute;as corridos.</li>
<li>Se entrega c&oacute;digo fuente completo y documentaci&oacute;n.</li>
<li>Incluye 2 rondas de revisiones menores post-entrega.</li>
<li>Hosting y dominio no incluidos, corren por cuenta del cliente.</li>
<li>Forma de pago: 50% al inicio, 50% contra entrega.</li>
<li>Soporte t&eacute;cnico post-entrega: 15 d&iacute;as.</li>
</ul></div>
</div>
<div class="footer"><div><span class="footer-accent">Margon Software</span> &mdash; Presupuesto</div><div>margonsoftware.com</div></div>
</div></body></html>`

    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
  }

  useEffect(() => {
    if (showSummary && summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [showSummary])

  return (
    <div className="relative min-h-screen bg-[#0a0f0d] text-surface-200 font-sans">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[100px]" />
      </div>

      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-lg shadow-black/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.location.hash = '' }}
              className="flex items-center gap-2 text-sm font-medium text-surface-200/70 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Volver al inicio</span>
            </a>
            <Logo src="/logo.png" alt="MarGon Software" className="h-8 w-auto" />
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-24 pb-32">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-4 py-1.5 text-xs font-medium text-primary-400 mb-5">
            <Layers size={14} /> Generador de Presupuestos Interactivo
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Armá tu proyecto <span className="gradient-text">a medida</span>
          </h1>
          <p className="text-surface-200/50 max-w-2xl mx-auto text-sm sm:text-base">
            Seleccioná los módulos que necesitás y obtené un presupuesto estimado al instante. Cada proyecto es único, personalizá el tuyo.
          </p>
        </div>

        {/* Client name */}
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Nombre del proyecto o empresa (opcional)"
            className="w-full px-4 py-3 rounded-xl bg-surface-950/60 border border-white/10 text-sm text-white placeholder:text-surface-200/30 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </div>

        {/* Discount banner */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-500/10 border border-accent-500/20 px-4 py-1.5">
            <Zap size={14} className="text-accent-400" />
            <span className="text-xs font-bold text-accent-400">50% OFF en todos los módulos</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8">
          <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
            <PackageCheck size={16} className="text-primary-400" />
            <span className="text-xs text-surface-200/50">Módulos:</span>
            <span className="text-sm font-bold text-white">{selectedItems.length}<span className="text-surface-200/30">/{totalModules}</span></span>
          </div>
          <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
            <BarChart3 size={16} className="text-cyan-400" />
            <span className="text-xs text-surface-200/50">Cobertura:</span>
            <span className="text-sm font-bold text-white">{selectedPercent}%</span>
          </div>
          <div className="glass rounded-xl px-5 py-2.5 flex items-center gap-2 border-primary-500/20">
            {subtotal > 0 && <span className="text-xs line-through text-surface-200/30">{formatPrice(subtotal)}</span>}
            <span className="text-lg font-extrabold gradient-text">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-surface-200/30 mb-4">Packs predefinidos</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {presets.map(preset => {
              const PreIcon = preset.icon
              const presetSubtotal = allItems.filter(i => preset.ids.includes(i.id)).reduce((s, i) => s + i.price, 0)
              const presetTotal = Math.round(presetSubtotal * (1 - DISCOUNT))
              const isActive = preset.ids.every(id => selected.has(id)) && preset.ids.length === selected.size
              return (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.ids)}
                  className={`text-left p-3 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${
                    isActive
                      ? 'border-primary-500/40 bg-primary-500/8 shadow-[0_0_24px_rgba(16,185,129,0.08)]'
                      : 'border-white/5 bg-surface-950/40 hover:border-white/15 hover:bg-surface-950/60'
                  }`}
                >
                  <PreIcon size={18} className={`mb-2 ${isActive ? 'text-primary-400' : 'text-surface-200/30 group-hover:text-surface-200/50'} transition-colors`} />
                  <div className="text-xs sm:text-sm font-bold text-white">{preset.name}</div>
                  <div className="text-[10px] sm:text-xs text-surface-200/40 mt-0.5">{preset.desc}</div>
                  <div className={`text-xs font-bold mt-2 ${isActive ? 'gradient-text' : 'text-surface-200/30'}`}>{formatPrice(presetTotal)}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button onClick={selectAll} className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-500/5 cursor-pointer">
            Seleccionar todo
          </button>
          <span className="text-surface-200/20">|</span>
          <button onClick={clearAll} className="text-xs font-medium text-surface-200/40 hover:text-surface-200/60 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
            Limpiar selección
          </button>
        </div>

        {/* Categories */}
        {categories.map(cat => (
          <CategorySection key={cat.id} category={cat} selected={selected} onToggle={toggle} />
        ))}

        {/* Summary toggle */}
        {selectedItems.length > 0 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:brightness-110 transition-all cursor-pointer"
            >
              <FileText size={18} />
              {showSummary ? 'Ocultar resumen' : 'Ver resumen del presupuesto'}
            </button>
          </div>
        )}

        {/* Summary Panel */}
        {showSummary && selectedItems.length > 0 && (
          <div ref={summaryRef} className="mt-8 rounded-2xl glass glow p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Resumen del Presupuesto</h2>
                {clientName && <p className="text-sm text-surface-200/50 mt-1">{clientName}</p>}
              </div>
              <button onClick={() => setShowSummary(false)} className="text-surface-200/40 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {categories.map(cat => {
              const catItems = cat.items.filter(i => selected.has(i.id))
              if (catItems.length === 0) return null
              const CatIcon = cat.icon
              const catTotal = catItems.reduce((s, i) => s + i.price, 0)
              return (
                <div key={cat.id} className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CatIcon size={14} className="text-primary-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-400">{cat.title}</span>
                    <span className="ml-auto text-xs font-semibold text-surface-200/50">{formatPrice(catTotal)}</span>
                  </div>
                  <div className="space-y-1.5 pl-5">
                    {catItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Check size={12} className="text-primary-400" />
                          <span className="text-surface-200/70">{item.name}</span>
                        </div>
                        <span className="font-semibold text-surface-200/50">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-white/5" />
                </div>
              )
            })}

            {/* Totals */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs text-surface-200/40">Subtotal</span>
                <span className="text-sm font-semibold text-surface-200/50">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs text-accent-400 font-medium">Descuento 50%</span>
                <span className="text-sm font-semibold text-accent-400">-{formatPrice(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary-950/80 to-surface-950/80 border border-primary-500/20">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-surface-200/40">Inversión total</p>
                  <p className="text-xs text-surface-200/40 mt-0.5">{selectedItems.length} módulos seleccionados</p>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold gradient-text">{formatPrice(total)}</span>
              </div>
            </div>

            <p className="text-[10px] text-surface-200/30 mt-3 text-center">
              * Los precios son estimativos y pueden variar según la complejidad final del proyecto. Consultar por descuentos en packs.
            </p>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/541131930330?text=${generateWhatsAppMsg()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:brightness-110 transition-all"
              >
                <Send size={16} />
                Enviar por WhatsApp
              </a>
              <button
                onClick={generatePDF}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-surface-200/70 text-sm font-medium hover:border-white/20 hover:text-white transition-all cursor-pointer"
              >
                <Download size={16} />
                Descargar PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 print:hidden">
          <div className="glass border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                    <PackageCheck size={16} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{selectedItems.length} módulos</p>
                    <p className="text-[10px] text-surface-200/40">{selectedPercent}% del catálogo</p>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="hidden md:block w-32 h-1.5 rounded-full bg-surface-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-400 transition-all duration-500"
                    style={{ width: `${selectedPercent}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {subtotal > 0 && <span className="text-sm line-through text-surface-200/30">{formatPrice(subtotal)}</span>}
                <span className="text-xl sm:text-2xl font-extrabold gradient-text">{formatPrice(total)}</span>
                <span className="text-[10px] uppercase tracking-wider text-surface-200/30 font-bold">USD</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
