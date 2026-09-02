import { Users, LayoutDashboard, ShoppingCart, FileText, Package, UserCircle } from 'lucide-react'
import ProcessCard from './ProcessCard'

/* ---- Mini previews de UI (placeholder hasta reemplazar por imágenes) ---- */
function PreviewCrm() {
  return (
    <div className="hero-ui">
      <div className="w-4 rounded-sm bg-white/5" />
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <span className="h-1.5 rounded-full bg-white/15" />
        <span className="h-1.5 w-[70%] rounded-full bg-accent-400/40" />
        <span className="h-1.5 w-[85%] rounded-full bg-white/15" />
      </div>
    </div>
  )
}

function PreviewDashboard() {
  return (
    <div className="hero-ui items-center">
      <div className="flex-1 h-9 flex items-end gap-1">
        {[20, 40, 35, 70, 90].map((h, i) => (
          <i key={i} className="flex-1 rounded-sm bg-cyan-400" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="w-8 h-8 rounded-full border-[5px] border-accent-400/25 border-t-accent-400" />
    </div>
  )
}

function PreviewEcommerce() {
  return (
    <div className="hero-ui items-center">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-1 h-9 rounded bg-gradient-to-br from-white/15 to-white/5" />
      ))}
    </div>
  )
}

function PreviewTable() {
  return (
    <div className="hero-ui flex-col justify-center">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="hero-ui-row" />
      ))}
    </div>
  )
}

function PreviewClient() {
  return (
    <div className="hero-ui items-center">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-cyan-400" />
      <div className="flex-1 flex flex-col gap-1.5">
        <span className="h-1.5 rounded-full bg-white/15" />
        <span className="h-1.5 w-[60%] rounded-full bg-white/15" />
      </div>
    </div>
  )
}

const solutions = [
  { icon: Users, title: 'CRM Comercial', text: 'Gestioná leads, clientes, oportunidades y más.', preview: PreviewCrm },
  { icon: LayoutDashboard, title: 'Panel de gestión', text: 'Tené el control de tu operación en tiempo real.', preview: PreviewDashboard },
  { icon: ShoppingCart, title: 'E-commerce', text: 'Vendé online, gestioná productos, pedidos y stock.', preview: PreviewEcommerce },
  { icon: FileText, title: 'Sistema administrativo', text: 'Manejá cobros, pagos, proveedores y finanzas.', preview: PreviewTable },
  { icon: Package, title: 'Gestión de inventario', text: 'Controlá stock, movimientos y alertas inteligentes.', preview: PreviewTable },
  { icon: UserCircle, title: 'Portal de clientes', text: 'Tus clientes acceden a sus datos y seguimiento.', preview: PreviewClient },
]

/** Tarjeta 03 — Solución plasmada en sistema */
export default function ProcessSolution() {
  return (
    <ProcessCard
      tone="green"
      number="03"
      title="Solución plasmada en sistema"
      description="Entregamos sistemas robustos, intuitivos y fáciles de usar que optimizan, automatizan y potencian tu negocio."
    >
      <div className="flex flex-col gap-2.5">
        {solutions.map(({ icon: Icon, title, text, preview: Preview }) => (
          <div key={title} className="grid sm:grid-cols-[minmax(150px,1fr)_150px] gap-3.5 items-center">
            <div className="flex items-center gap-3">
              <span className="hero-solution-icon">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="m-0 mb-0.5 text-xs font-bold text-white">{title}</h3>
                <p className="m-0 text-[10px] leading-snug text-surface-200/65">{text}</p>
              </div>
            </div>
            <Preview />
          </div>
        ))}
      </div>
    </ProcessCard>
  )
}
