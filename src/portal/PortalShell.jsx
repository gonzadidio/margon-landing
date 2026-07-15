import { useState, useEffect } from 'react'
import { Home, CreditCard, FolderKanban, FileText, Paperclip, LogOut } from 'lucide-react'
import Logo from '../components/Logo'
import { portalGet } from './portalApi'
import PortalHome from './PortalHome'
import PortalPagos from './PortalPagos'
import PortalProyectos from './PortalProyectos'
import PortalArchivos from './PortalArchivos'
import PortalPresupuestos from './PortalPresupuestos'

const NAV = [
  { k: 'inicio', label: 'Inicio', icon: Home },
  { k: 'presupuestos', label: 'Presupuestos', icon: FileText },
  { k: 'pagos', label: 'Pagos', icon: CreditCard },
  { k: 'proyectos', label: 'Proyectos', icon: FolderKanban },
  { k: 'archivos', label: 'Archivos', icon: Paperclip },
]

export default function PortalShell({ onLogout }) {
  const [me, setMe] = useState(null)
  const [section, setSection] = useState('inicio')

  useEffect(() => { portalGet('/me').then(setMe).catch(() => {}) }, [])

  return (
    <div className="ad-app min-h-screen">
      {/* Barra superior */}
      <header className="ad-line sticky top-0 z-20 border-b" style={{ background: '#0a0f0d' }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 h-16">
          <div className="flex items-center gap-3">
            <Logo src="/logo.png" alt="Margon" className="h-9 w-auto" />
            <span className="ad-faint hidden text-sm sm:inline">· Portal de clientes</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="ad-muted hidden text-sm sm:inline">{me?.cliente?.nombre}</span>
            <button onClick={onLogout} className="ad-btn ad-btn-ghost ad-btn-sm" title="Salir">
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>
        {/* Nav */}
        <div className="mx-auto max-w-5xl px-2">
          <nav className="flex gap-1 overflow-x-auto">
            {NAV.map((n) => {
              const active = section === n.k
              const Icon = n.icon
              const badge = n.k === 'presupuestos' && me?.presupuestos_pendientes > 0 ? me.presupuestos_pendientes : null
              return (
                <button key={n.k} onClick={() => setSection(n.k)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition ${
                    active ? 'border-[#10b981] text-white' : 'border-transparent ad-muted hover:text-white'
                  }`}>
                  <Icon className="h-4 w-4" /> {n.label}
                  {badge && <span className="ad-pill ad-pill-amber">{badge}</span>}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-7">
        {section === 'inicio' && <PortalHome me={me} onGo={setSection} />}
        {section === 'presupuestos' && <PortalPresupuestos />}
        {section === 'pagos' && <PortalPagos />}
        {section === 'proyectos' && <PortalProyectos />}
        {section === 'archivos' && <PortalArchivos />}
      </main>
    </div>
  )
}
