import {
  Box, Home, User, ShoppingCart, LineChart, Settings, MoreHorizontal,
  Calendar, ChevronDown, ArrowUp, ClipboardList, AppWindow,
} from 'lucide-react'
import ProcessCard from './ProcessCard'

const navIconos = [Home, User, ShoppingCart, Box, LineChart, Settings, MoreHorizontal]

const metricas = [
  { label: 'Ventas', valor: '$ 2.4 M', alza: '12%' },
  { label: 'Clientes', valor: '1.892', alza: '8%' },
  { label: 'Pedidos', valor: '482', alza: '15%' },
  { label: 'Productos', valor: '1.250', alza: '7%' },
]

const modulos = [
  { icono: ShoppingCart, titulo: 'CRM Comercial', detalle: 'Leads, clientes y oportunidades' },
  { icono: ClipboardList, titulo: 'Gestión Administrativa', detalle: 'Administración y financiera' },
  { icono: Box, titulo: 'Inventario', detalle: 'Stock, productos y movimientos' },
  { icono: AppWindow, titulo: 'Portal Clientes', detalle: 'Pedidos, consultas y seguimiento' },
]

/** Curva del sparkline que acompaña a cada métrica */
const CURVA = 'M2 34 C20 30, 21 35, 32 29 C43 20, 49 13, 60 18 C70 23, 78 34, 90 30 C104 26, 112 13, 128 8'

/** Tarjeta 03 — Solución plasmada en sistema */
export default function ProcessSolution() {
  return (
    <ProcessCard
      tone="green"
      number="03"
      plainNumber
      title="Solución plasmada en sistema"
    >
      <div className="dash">
        <aside className="dash-side">
          <div className="dash-logo"><Box size={17} strokeWidth={1.6} /></div>

          <nav className="dash-nav">
            {navIconos.map((Icono, i) => (
              <span
                key={i}
                className={i === 0 ? 'dash-nav-item dash-nav-item-on' : 'dash-nav-item'}
                aria-hidden="true"
              >
                <Icono size={13} strokeWidth={1.6} />
              </span>
            ))}
          </nav>
        </aside>

        <div className="dash-main">
          <div className="dash-head">
            <h4>Dashboard</h4>
            <span className="dash-fecha">
              <Calendar size={9} strokeWidth={1.8} />
              01 May - 31 May
              <ChevronDown size={9} strokeWidth={1.8} />
            </span>
          </div>

          <div className="dash-metricas">
            {metricas.map((m) => (
              <article key={m.label} className="dash-metrica">
                <span className="dash-metrica-label">{m.label}</span>
                <strong className="dash-metrica-valor">{m.valor}</strong>

                <div className="dash-metrica-pie">
                  <span className="dash-alza">
                    <ArrowUp size={8} strokeWidth={2.5} />
                    {m.alza}
                  </span>
                  <svg className="dash-spark" viewBox="0 0 130 45" preserveAspectRatio="none" aria-hidden="true">
                    <path d={CURVA} />
                  </svg>
                </div>
              </article>
            ))}
          </div>

          <span className="dash-divisor" />

          <h5 className="dash-subtitulo">Módulos principales</h5>

          <div className="dash-modulos">
            {modulos.map(({ icono: Icono, titulo, detalle }) => (
              <article key={titulo} className="dash-modulo">
                <div className="dash-modulo-icono"><Icono size={18} strokeWidth={1.5} /></div>
                <h6>{titulo}</h6>
                <p>{detalle}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </ProcessCard>
  )
}
