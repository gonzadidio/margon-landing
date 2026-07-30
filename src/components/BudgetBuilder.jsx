import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Check, Zap, ArrowLeft, Download, Send, ChevronDown, ChevronUp,
  Layers, FileText, BarChart3, PackageCheck, X, Loader2, CheckCircle2,
} from 'lucide-react'
import Logo from './Logo'
import { defaultConfig, discountPct } from '../config/presupuestos'

function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(price)
}

// Paletas de tema. `light` = fácil de leer (para clientes); `dark` = marketing.
function tokens(light) {
  if (light) return {
    page: 'bg-[#eef3ec] text-slate-600', glow: false,
    nav: 'bg-white/85 border-b border-slate-200 backdrop-blur shadow-sm', navLink: 'text-slate-500 hover:text-slate-900',
    chip: 'border-primary-300 bg-primary-50 text-primary-700', h1: 'text-slate-900', accent: 'text-primary-600', sub: 'text-slate-500',
    stepCard: 'bg-white border border-slate-200 shadow-sm', stepNum: 'bg-primary-600 text-white', stepTitle: 'text-slate-900', stepDesc: 'text-slate-500',
    input: 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:ring-primary-200',
    discChip: 'bg-amber-50 border-amber-200 text-amber-700', discIcon: 'text-amber-500',
    stat: 'bg-white border border-slate-200 shadow-sm', statLbl: 'text-slate-500', statVal: 'text-slate-900', statFaint: 'text-slate-400',
    presetOn: 'border-primary-400 bg-primary-50 shadow-sm', presetOff: 'border-slate-200 bg-white hover:border-slate-300',
    presetIconOn: 'text-primary-600', presetIconOff: 'text-slate-400 group-hover:text-slate-500', presetTitle: 'text-slate-900', presetDesc: 'text-slate-500', presetPrice: 'text-primary-700',
    linkPri: 'text-primary-600 hover:text-primary-700 hover:bg-primary-50', linkMuted: 'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
    catHead: 'bg-white border border-slate-200 shadow-sm hover:border-primary-300', catIcon: 'bg-primary-50 border-primary-200 text-primary-600',
    catTitle: 'text-slate-900', catDesc: 'text-slate-500', catCount: 'text-primary-700 bg-primary-50 border-primary-200', catMoney: 'text-primary-700', chevron: 'text-slate-400',
    modOn: 'bg-primary-50 border-primary-300', modOff: 'bg-white border-slate-200 hover:border-slate-300',
    cbOn: 'bg-primary-500 border-transparent', cbOff: 'border-slate-300 group-hover:border-slate-400',
    modNameOn: 'text-slate-900', modNameOff: 'text-slate-700', popular: 'text-accent-600 bg-lime-50 border-lime-200',
    modDescOn: 'text-slate-600', modDescOff: 'text-slate-400', modPriceOn: 'text-primary-700', modPriceOff: 'text-slate-400',
    panel: 'bg-white border border-slate-200 shadow-xl', panelTitle: 'text-slate-900', panelSub: 'text-slate-500',
    sumCat: 'text-primary-700', sumItem: 'text-slate-600', sumMoney: 'text-slate-500', sumDivider: 'border-slate-200',
    sumSubLbl: 'text-slate-500', sumSubVal: 'text-slate-600', totalBox: 'bg-primary-50 border border-primary-200', totalLbl: 'text-slate-500', totalHint: 'text-slate-500', totalVal: 'text-primary-700',
    note: 'text-slate-500', noteFaint: 'text-slate-400', okBox: 'bg-primary-50 border border-primary-200 text-primary-700',
    btnPri: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20', btnSec: 'border border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900',
    sticky: 'bg-white/95 border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur',
    stickyIcon: 'bg-primary-50 border-primary-200 text-primary-600', stickyName: 'text-slate-900', stickyPct: 'text-slate-500', stickyBar: 'bg-slate-200', stickyStrike: 'text-slate-400', stickyTotal: 'text-primary-700', stickyCur: 'text-slate-400',
  }
  return {
    page: 'bg-[#0a0f0d] text-surface-200', glow: true,
    nav: 'glass shadow-lg shadow-black/20', navLink: 'text-surface-200/70 hover:text-white',
    chip: 'border-primary-500/20 bg-primary-500/5 text-primary-400', h1: 'text-white', accent: 'gradient-text', sub: 'text-surface-200/50',
    stepCard: 'glass', stepNum: 'bg-primary-600 text-white', stepTitle: 'text-white', stepDesc: 'text-surface-200/50',
    input: 'bg-surface-950/60 border-white/10 text-white placeholder:text-surface-200/30 focus:border-primary-500/40 focus:ring-primary-500/20',
    discChip: 'bg-accent-500/10 border-accent-500/20 text-accent-400', discIcon: 'text-accent-400',
    stat: 'glass', statLbl: 'text-surface-200/50', statVal: 'text-white', statFaint: 'text-surface-200/30',
    presetOn: 'border-primary-500/40 bg-primary-500/8 shadow-[0_0_24px_rgba(16,185,129,0.08)]', presetOff: 'border-white/5 bg-surface-950/40 hover:border-white/15 hover:bg-surface-950/60',
    presetIconOn: 'text-primary-400', presetIconOff: 'text-surface-200/30 group-hover:text-surface-200/50', presetTitle: 'text-white', presetDesc: 'text-surface-200/40', presetPrice: 'gradient-text',
    linkPri: 'text-primary-400 hover:text-primary-300 hover:bg-primary-500/5', linkMuted: 'text-surface-200/40 hover:text-surface-200/60 hover:bg-white/5',
    catHead: 'glass glow-sm hover:border-primary-500/30', catIcon: 'bg-gradient-to-br from-primary-600/20 to-accent-600/20 border-primary-500/20 text-primary-400',
    catTitle: 'text-white', catDesc: 'text-surface-200/50', catCount: 'text-primary-400 bg-primary-500/10 border-primary-500/20', catMoney: 'gradient-text', chevron: 'text-surface-200/40',
    modOn: 'bg-primary-500/8 border-primary-500/30 shadow-[0_0_20px_rgba(16,185,129,0.06)]', modOff: 'bg-surface-950/40 border-white/5 hover:border-white/10',
    cbOn: 'bg-gradient-to-br from-primary-500 to-accent-500 border-transparent', cbOff: 'border-white/20 group-hover:border-white/40',
    modNameOn: 'text-white', modNameOff: 'text-surface-200/70', popular: 'text-accent-400 bg-accent-500/10 border-accent-500/20',
    modDescOn: 'text-surface-200/50', modDescOff: 'text-surface-200/30', modPriceOn: 'gradient-text', modPriceOff: 'text-surface-200/40',
    panel: 'glass glow', panelTitle: 'text-white', panelSub: 'text-surface-200/50',
    sumCat: 'text-primary-400', sumItem: 'text-surface-200/70', sumMoney: 'text-surface-200/50', sumDivider: 'border-white/5',
    sumSubLbl: 'text-surface-200/40', sumSubVal: 'text-surface-200/50', totalBox: 'bg-gradient-to-r from-primary-950/80 to-surface-950/80 border-primary-500/20', totalLbl: 'text-surface-200/40', totalHint: 'text-surface-200/40', totalVal: 'gradient-text',
    note: 'text-surface-200/40', noteFaint: 'text-surface-200/30', okBox: 'bg-primary-500/10 border-primary-500/25 text-primary-300',
    btnPri: 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:brightness-110', btnSec: 'border border-white/10 text-surface-200/70 hover:border-white/20 hover:text-white',
    sticky: 'glass border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]',
    stickyIcon: 'bg-primary-500/10 border-primary-500/20 text-primary-400', stickyName: 'text-white', stickyPct: 'text-surface-200/40', stickyBar: 'bg-surface-800', stickyStrike: 'text-surface-200/30', stickyTotal: 'gradient-text', stickyCur: 'text-surface-200/30',
  }
}

function CategorySection({ category, selected, onToggle, currency, T }) {
  const [expanded, setExpanded] = useState(true)
  const Icon = category.icon
  const selectedCount = category.items.filter(i => selected.has(i.id)).length
  const categoryTotal = category.items.filter(i => selected.has(i.id)).reduce((sum, i) => sum + i.price, 0)

  return (
    <div className="mb-6">
      <button onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-300 group cursor-pointer ${T.catHead}`}>
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${T.catIcon}`}>{Icon && <Icon size={20} />}</div>
          <div className="text-left">
            <h3 className={`text-base font-bold ${T.catTitle}`}>{category.title}</h3>
            <p className={`text-xs ${T.catDesc}`}>{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedCount > 0 && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${T.catCount}`}>{selectedCount} sel.</span>}
          {categoryTotal > 0 && <span className={`text-sm font-bold hidden sm:block ${T.catMoney}`}>{formatPrice(categoryTotal, currency)}</span>}
          {expanded ? <ChevronUp size={18} className={T.chevron} /> : <ChevronDown size={18} className={T.chevron} />}
        </div>
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 sm:pl-4">
          {category.items.map((item) => {
            const isSelected = selected.has(item.id)
            return (
              <button key={item.id} onClick={() => onToggle(item.id)}
                className={`group relative text-left w-full p-4 rounded-xl border transition-all duration-300 cursor-pointer ${isSelected ? T.modOn : `${T.modOff} opacity-70 hover:opacity-100`}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isSelected ? T.cbOn : T.cbOff}`}>
                    {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold transition-colors ${isSelected ? T.modNameOn : T.modNameOff}`}>{item.name}</span>
                      {item.popular && <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${T.popular}`}>Recomendado</span>}
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed transition-colors ${isSelected ? T.modDescOn : T.modDescOff}`}>{item.desc}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className={`text-sm font-bold transition-all ${isSelected ? T.modPriceOn : T.modPriceOff}`}>{formatPrice(item.price, currency)}</span>
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

export default function BudgetBuilder({ config = defaultConfig }) {
  const { categories, presets = [], currency = 'USD', waNumber, discountTiers, steps = [] } = config
  const T = useMemo(() => tokens(config.theme === 'light'), [config.theme])
  const roundTo = config.roundTo || 1
  const roundNice = (n) => Math.round(n / roundTo) * roundTo

  const [selected, setSelected] = useState(new Set())
  const [clientName, setClientName] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const summaryRef = useRef(null)

  const toggle = (id) => { setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next }); setSent(false) }
  const selectAll = () => setSelected(new Set(categories.flatMap(c => c.items.map(i => i.id))))
  const clearAll = () => setSelected(new Set())
  const applyPreset = (ids) => { setSelected(new Set(ids)); setSent(false) }

  const allItems = useMemo(() => categories.flatMap(c => c.items), [categories])
  const selectedItems = useMemo(() => allItems.filter(i => selected.has(i.id)), [selected, allItems])
  const subtotal = useMemo(() => selectedItems.reduce((s, i) => s + i.price, 0), [selectedItems])
  const discountFraction = useMemo(() => discountPct(discountTiers, subtotal), [discountTiers, subtotal])
  const total = roundNice(subtotal - subtotal * discountFraction)
  const discountAmount = subtotal - total
  const totalModules = allItems.length
  const selectedPercent = totalModules ? Math.round((selectedItems.length / totalModules) * 100) : 0
  const discPctLabel = Math.round(discountFraction * 100)
  const presetTotal = (ids) => { const s = allItems.filter(i => ids.includes(i.id)).reduce((a, i) => a + i.price, 0); return roundNice(s - s * discountPct(discountTiers, s)) }

  const generateWhatsAppMsg = () => {
    let msg = `*Solicitud de propuesta${config.brand ? ' · ' + config.brand : ''}*\n`
    if (clientName) msg += `De: ${clientName}\n`
    if (telefono) msg += `Tel: ${telefono}\n`
    if (email) msg += `Email: ${email}\n`
    msg += `\n`
    categories.forEach(cat => {
      const catItems = cat.items.filter(i => selected.has(i.id))
      if (catItems.length > 0) {
        msg += `*${cat.title}*\n`
        catItems.forEach(i => { msg += `  - ${i.name} -- ${formatPrice(i.price, currency)}\n` })
        msg += `\n`
      }
    })
    msg += `Subtotal: ${formatPrice(subtotal, currency)}\n`
    if (discountAmount > 0) msg += `Descuento ${discPctLabel}%: -${formatPrice(discountAmount, currency)}\n`
    msg += `*Total: ${formatPrice(total, currency)} ${currency}*\n`
    msg += `${selectedItems.length} módulos seleccionados`
    return encodeURIComponent(msg)
  }

  const pedirPropuesta = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await fetch('/api/presupuesto', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: clientName || null, email: email || null, telefono: telefono || null,
          modulos: selectedItems.map(i => ({ id: i.id, name: i.name, price: i.price })),
          total, moneda: currency, mensaje: null, origen: config.slug,
        }),
      })
      setSent(true)
    } catch { /* aunque falle el guardado, seguimos al WhatsApp */ }
    setSubmitting(false)
    window.open(`https://wa.me/${waNumber}?text=${generateWhatsAppMsg()}`, '_blank', 'noopener,noreferrer')
  }

  const generatePDF = () => {
    const date = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
    let rows = ''
    let counter = 1
    categories.forEach(cat => {
      const catItems = cat.items.filter(i => selected.has(i.id))
      if (catItems.length === 0) return
      const catTotal = catItems.reduce((s, i) => s + i.price, 0)
      rows += `<tr class="cat-row"><td colspan="3">${cat.title}</td><td class="cat-total">${formatPrice(catTotal, currency)}</td></tr>`
      catItems.forEach(i => { rows += `<tr><td class="num">${String(counter++).padStart(2, '0')}</td><td>${i.name}</td><td class="desc">${i.desc}</td><td class="price">${formatPrice(i.price, currency)}</td></tr>` })
    })
    const termsHtml = (config.terms || []).map(t => `<li>${t}</li>`).join('')
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Presupuesto - Margon Software</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');*{margin:0;padding:0;box-sizing:border-box}@page{size:A4;margin:0}body{font-family:'Inter',sans-serif;color:#1f2937;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{width:794px;min-height:1123px;margin:0 auto;background:#fff;position:relative;overflow:hidden}.header{background:linear-gradient(135deg,#064e3b 0%,#0a0f0d 100%);color:#fff;padding:32px 44px 28px;position:relative;overflow:hidden}.header::before{content:'';position:absolute;top:-40%;right:-8%;width:240px;height:240px;background:#10b981;border-radius:50%;opacity:.07}.hc{display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1}.brand{font-size:20px;font-weight:800;letter-spacing:-.5px}.brand span{color:#34d399}.brand-sub{font-size:10px;font-weight:300;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-top:3px}.doc-title{font-size:28px;font-weight:800;letter-spacing:-1px;text-align:right}.doc-meta{font-size:10px;color:rgba(255,255,255,.5);text-align:right;line-height:1.7;margin-top:6px}.doc-meta strong{color:rgba(255,255,255,.85)}.bar{height:3px;background:linear-gradient(90deg,#10b981,#a3e635,transparent)}.body{padding:24px 44px 60px}.info{display:flex;justify-content:space-between;margin-bottom:18px;gap:24px}.info-block{flex:1}.info-title{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:#10b981;margin-bottom:7px;padding-bottom:5px;border-bottom:1.5px solid #f3f4f6}.info-row{display:flex;justify-content:space-between;font-size:10px;padding:2px 0}.info-label{color:#9ca3af}.info-value{color:#1f2937;font-weight:500}table{width:100%;border-collapse:collapse;font-size:9.5px;margin-bottom:16px}thead th{background:#064e3b;color:#fff;font-weight:600;font-size:8px;text-transform:uppercase;letter-spacing:1px;padding:7px 10px;text-align:left}thead th:first-child{border-radius:5px 0 0 0;width:5%}thead th:last-child{border-radius:0 5px 0 0;text-align:right;width:14%}tbody td{padding:5px 10px;border-bottom:1px solid #f3f4f6;vertical-align:top}.num{color:#9ca3af;font-weight:600;text-align:center}.desc{color:#9ca3af;font-size:8.5px}.price{text-align:right;font-weight:600;color:#374151;white-space:nowrap}.cat-row{background:#f9fafb}.cat-row td{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#10b981;padding:6px 10px;border-bottom:1px solid #e5e7eb}.cat-total{text-align:right;font-weight:700;color:#374151}.totals{display:flex;justify-content:flex-end;margin-bottom:16px}.totals-box{width:230px}.total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:10px;border-bottom:1px solid #f3f4f6}.total-row-label{color:#6b7280}.total-row-value{font-weight:600;color:#374151}.total-final{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:linear-gradient(135deg,#064e3b,#0a0f0d);border-radius:8px;margin-top:6px}.total-final-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.6)}.total-final-value{font-size:22px;font-weight:800;color:#fff}.total-final-currency{font-size:12px;font-weight:600;color:#34d399;margin-right:2px}.terms{background:#f9fafb;border-radius:6px;padding:12px 14px}.terms-title{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:#1f2937;margin-bottom:7px}.terms-list{list-style:none}.terms-list li{font-size:8.5px;color:#6b7280;padding:2px 0 2px 12px;position:relative}.terms-list li::before{content:'';position:absolute;left:0;top:8px;width:3px;height:3px;background:#10b981;border-radius:50%}.footer{position:absolute;bottom:0;left:0;right:0;padding:14px 44px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f3f4f6;font-size:8px;color:#9ca3af}.footer-accent{color:#10b981;font-weight:600}.section-title{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:#10b981;margin-bottom:8px}@media print{.no-print{display:none!important}}.print-btn{position:fixed;bottom:24px;right:24px;background:linear-gradient(135deg,#059669,#65a30d);color:#fff;border:none;padding:12px 24px;border-radius:50px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 8px 20px rgba(16,185,129,.35);display:flex;align-items:center;gap:8px;z-index:1000}</style></head><body>
<button class="print-btn no-print" onclick="window.print()">&#128438; Guardar como PDF</button>
<div class="page"><div class="header"><div class="hc">
<div><div class="brand">MARGON <span>SOFTWARE</span></div><div class="brand-sub">Desarrollo a medida</div></div>
<div><div class="doc-title">PRESUPUESTO</div><div class="doc-meta"><strong>Fecha:</strong> ${date}<br><strong>Validez:</strong> 15 d&iacute;as</div></div>
</div></div><div class="bar"></div><div class="body">
<div class="info"><div class="info-block"><div class="info-title">Datos del cliente</div>
<div class="info-row"><span class="info-label">Propuesta</span><span class="info-value">${config.brand || clientName || 'Sin especificar'}</span></div>
<div class="info-row"><span class="info-label">M&oacute;dulos</span><span class="info-value">${selectedItems.length} seleccionados</span></div></div>
<div class="info-block"><div class="info-title">Datos del proveedor</div>
<div class="info-row"><span class="info-label">Empresa</span><span class="info-value">Margon Software</span></div>
<div class="info-row"><span class="info-label">Modalidad</span><span class="info-value">Proyecto llave en mano</span></div></div></div>
<div class="section-title">Desglose de servicios</div>
<table><thead><tr><th>#</th><th>M&oacute;dulo</th><th>Descripci&oacute;n</th><th style="text-align:right">Valor</th></tr></thead><tbody>${rows}</tbody></table>
<div class="totals"><div class="totals-box">
<div class="total-row"><span class="total-row-label">Subtotal</span><span class="total-row-value">${formatPrice(subtotal, currency)}</span></div>
${discountAmount > 0 ? `<div class="total-row"><span class="total-row-label" style="color:#10b981;font-weight:600">Descuento ${discPctLabel}%</span><span class="total-row-value" style="color:#10b981;font-weight:600">-${formatPrice(discountAmount, currency)}</span></div>` : ''}
<div class="total-final"><span class="total-final-label">Total</span><span class="total-final-value"><span class="total-final-currency">${currency}</span>${total.toLocaleString('en-US')}</span></div>
</div></div>
<div class="terms"><div class="terms-title">T&eacute;rminos y condiciones</div><ul class="terms-list">${termsHtml}</ul></div>
</div><div class="footer"><div><span class="footer-accent">Margon Software</span> &mdash; Presupuesto</div><div>margonsoftware.com</div></div>
</div></body></html>`
    const w = window.open('', '_blank')
    w.document.write(html); w.document.close()
  }

  useEffect(() => { if (showSummary && summaryRef.current) summaryRef.current.scrollIntoView({ behavior: 'smooth' }) }, [showSummary])

  return (
    <div className={`relative min-h-screen font-sans ${T.page}`}>
      {T.glow && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[100px]" />
        </div>
      )}

      <nav className={`fixed top-0 left-0 right-0 z-50 ${T.nav}`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <a href="/" className={`flex items-center gap-2 text-sm font-medium transition-colors ${T.navLink}`}><ArrowLeft size={16} /><span className="hidden sm:inline">Volver al inicio</span></a>
            {config.theme === 'light'
              ? <a href="/" className="flex items-center gap-2"><img src="/logo2.png" alt="Margon" className="h-7 w-auto" /><span className="font-extrabold tracking-tight text-slate-900 text-[15px]">Margon<span className="text-primary-600"> Software</span></span></a>
              : <Logo src="/logo.png" alt="MarGon Software" className="h-8 w-auto" />}
            <div className="w-24" />
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pt-24 pb-32">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium mb-5 ${T.chip}`}>
            <Layers size={14} /> {config.eyebrow || 'Presupuesto interactivo'}
          </div>
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 ${T.h1}`}>
            {config.title} <span className={T.accent}>{config.titleAccent}</span>
          </h1>
          <p className={`max-w-2xl mx-auto text-sm sm:text-base ${T.sub}`}>{config.subtitle}</p>
        </div>

        {/* Cómo funciona — 3 pasos */}
        {steps.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-9">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl ${T.stepCard}`}>
                <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${T.stepNum}`}>{i + 1}</span>
                <div>
                  <div className={`text-sm font-bold ${T.stepTitle}`}>{s.t}</div>
                  <div className={`text-xs mt-0.5 leading-snug ${T.stepDesc}`}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contacto (opcional según config) */}
        {config.showContact !== false && (
          <div className="max-w-xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder={config.nameLabel || 'Nombre / empresa'}
              className={`sm:col-span-2 w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 transition-all ${T.input}`} />
            <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="WhatsApp / teléfono"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 transition-all ${T.input}`} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (opcional)"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 transition-all ${T.input}`} />
          </div>
        )}

        {config.discountLabel && (
          <div className="flex justify-center mb-5">
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${T.discChip}`}>
              <Zap size={14} className={T.discIcon} />
              <span className="text-xs font-bold">{config.discountLabel}</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8">
          <div className={`rounded-xl px-4 py-2.5 flex items-center gap-2 ${T.stat}`}>
            <PackageCheck size={16} className="text-primary-500" /><span className={`text-xs ${T.statLbl}`}>Elegidos:</span>
            <span className={`text-sm font-bold ${T.statVal}`}>{selectedItems.length}<span className={T.statFaint}>/{totalModules}</span></span>
          </div>
          <div className={`rounded-xl px-4 py-2.5 flex items-center gap-2 ${T.stat}`}>
            <BarChart3 size={16} className="text-primary-500" /><span className={`text-xs ${T.statLbl}`}>Descuento:</span>
            <span className={`text-sm font-bold ${T.statVal}`}>{discPctLabel}%</span>
          </div>
          <div className={`rounded-xl px-5 py-2.5 flex items-center gap-2 ${T.stat}`}>
            {discountAmount > 0 && <span className={`text-xs line-through ${T.statFaint}`}>{formatPrice(subtotal, currency)}</span>}
            <span className={`text-lg font-extrabold ${T.accent}`}>{formatPrice(total, currency)}</span>
          </div>
        </div>

        {presets.length > 0 && (
          <div className="mb-8">
            <p className={`text-center text-xs font-semibold uppercase tracking-widest mb-4 ${T.statFaint}`}>Combos sugeridos — tocá uno para empezar</p>
            <div className={`grid gap-3 ${presets.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
              {presets.map(preset => {
                const PreIcon = preset.icon
                const isActive = preset.ids.length === selected.size && preset.ids.every(id => selected.has(id))
                return (
                  <button key={preset.name} onClick={() => applyPreset(preset.ids)}
                    className={`text-left p-3 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${isActive ? T.presetOn : T.presetOff}`}>
                    {PreIcon && <PreIcon size={18} className={`mb-2 transition-colors ${isActive ? T.presetIconOn : T.presetIconOff}`} />}
                    <div className={`text-xs sm:text-sm font-bold ${T.presetTitle}`}>{preset.name}</div>
                    <div className={`text-[10px] sm:text-xs mt-0.5 ${T.presetDesc}`}>{preset.desc}</div>
                    <div className={`text-xs font-bold mt-2 ${isActive ? T.presetPrice : T.statFaint}`}>{formatPrice(presetTotal(preset.ids), currency)}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mb-8">
          <button onClick={selectAll} className={`text-xs font-medium transition-colors px-3 py-1.5 rounded-lg cursor-pointer ${T.linkPri}`}>Elegir todo</button>
          <span className={T.statFaint}>|</span>
          <button onClick={clearAll} className={`text-xs font-medium transition-colors px-3 py-1.5 rounded-lg cursor-pointer ${T.linkMuted}`}>Empezar de cero</button>
        </div>

        {categories.map(cat => <CategorySection key={cat.id} category={cat} selected={selected} onToggle={toggle} currency={currency} T={T} />)}

        {selectedItems.length > 0 && (
          <div className="mt-10 text-center">
            <button onClick={() => setShowSummary(!showSummary)}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${T.btnPri}`}>
              <FileText size={18} />{showSummary ? 'Ocultar resumen' : 'Ver resumen y pedir propuesta'}
            </button>
          </div>
        )}

        {showSummary && selectedItems.length > 0 && (
          <div ref={summaryRef} className={`mt-8 rounded-2xl p-6 sm:p-8 ${T.panel}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold ${T.panelTitle}`}>Tu propuesta</h2>
                {clientName && <p className={`text-sm mt-1 ${T.panelSub}`}>{clientName}</p>}
              </div>
              <button onClick={() => setShowSummary(false)} className={`transition-colors cursor-pointer ${T.navLink}`}><X size={20} /></button>
            </div>

            {categories.map(cat => {
              const catItems = cat.items.filter(i => selected.has(i.id))
              if (catItems.length === 0) return null
              const CatIcon = cat.icon
              const catTotal = catItems.reduce((s, i) => s + i.price, 0)
              return (
                <div key={cat.id} className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    {CatIcon && <CatIcon size={14} className={T.sumCat} />}
                    <span className={`text-xs font-bold uppercase tracking-wider ${T.sumCat}`}>{cat.title}</span>
                    <span className={`ml-auto text-xs font-semibold ${T.sumMoney}`}>{formatPrice(catTotal, currency)}</span>
                  </div>
                  <div className="space-y-1.5 pl-5">
                    {catItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2"><Check size={12} className="text-primary-500" /><span className={T.sumItem}>{item.name}</span></div>
                        <span className={`font-semibold ${T.sumMoney}`}>{formatPrice(item.price, currency)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-2 border-t ${T.sumDivider}`} />
                </div>
              )
            })}

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className={`text-xs ${T.sumSubLbl}`}>Precio de lista</span>
                <span className={`text-sm font-semibold ${T.sumSubVal}`}>{formatPrice(subtotal, currency)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs font-medium text-primary-600">Tu descuento ({discPctLabel}%)</span>
                  <span className="text-sm font-semibold text-primary-600">-{formatPrice(discountAmount, currency)}</span>
                </div>
              )}
              <div className={`flex items-center justify-between p-4 rounded-xl ${T.totalBox}`}>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${T.totalLbl}`}>Precio final</p>
                  <p className={`text-xs mt-0.5 ${T.totalHint}`}>{selectedItems.length} módulos elegidos</p>
                </div>
                <span className={`text-2xl sm:text-3xl font-extrabold ${T.totalVal}`}>{formatPrice(total, currency)}</span>
              </div>
            </div>

            {config.paymentNote && <p className={`text-[11px] mt-3 leading-relaxed ${T.note}`}>{config.paymentNote}</p>}
            <p className={`text-[10px] mt-2 text-center ${T.noteFaint}`}>El descuento crece según cuántos módulos elijas. Precios en {currency}, a confirmar en la reunión.</p>

            {sent && (
              <div className={`mt-5 flex items-center gap-2 justify-center rounded-xl px-4 py-3 text-sm ${T.okBox}`}>
                <CheckCircle2 size={18} /> ¡Listo! Recibimos tu selección y te vamos a escribir. Si no se abrió WhatsApp, tocá el botón otra vez.
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={pedirPropuesta} disabled={submitting}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 cursor-pointer ${T.btnPri}`}>
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando…</> : <><Send size={16} /> Pedir esta propuesta</>}
              </button>
              <button onClick={generatePDF}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${T.btnSec}`}>
                <Download size={16} /> Descargar PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 print:hidden">
          <div className={T.sticky}>
            <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${T.stickyIcon}`}><PackageCheck size={16} /></div>
                  <div>
                    <p className={`text-xs font-bold ${T.stickyName}`}>{selectedItems.length} módulos</p>
                    <p className={`text-[10px] ${T.stickyPct}`}>{discPctLabel}% de descuento</p>
                  </div>
                </div>
                <div className={`hidden md:block w-32 h-1.5 rounded-full overflow-hidden ${T.stickyBar}`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-400 transition-all duration-500" style={{ width: `${selectedPercent}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {discountAmount > 0 && <span className={`text-sm line-through ${T.stickyStrike}`}>{formatPrice(subtotal, currency)}</span>}
                <span className={`text-xl sm:text-2xl font-extrabold ${T.stickyTotal}`}>{formatPrice(total, currency)}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold ${T.stickyCur}`}>{currency}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
