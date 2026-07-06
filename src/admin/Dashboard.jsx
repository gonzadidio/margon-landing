import { useState } from 'react'
import { LayoutDashboard, Users, FolderKanban, MessageSquare, FileText, Wallet, LogOut } from 'lucide-react'
import { NavContext } from './nav'
import Home from './Home'
import Clientes from './Clientes'
import Proyectos from './Proyectos'
import Seguimientos from './Seguimientos'
import Facturacion from './Facturacion'
import Pagos from './Pagos'
import ClienteDetalle from './ClienteDetalle'

const TABS = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard, Comp: Home },
  { id: 'clientes', label: 'Clientes', icon: Users, Comp: Clientes },
  { id: 'proyectos', label: 'Proyectos', icon: FolderKanban, Comp: Proyectos },
  { id: 'seguimientos', label: 'Seguimientos', icon: MessageSquare, Comp: Seguimientos },
  { id: 'facturacion', label: 'Facturación', icon: FileText, Comp: Facturacion },
  { id: 'pagos', label: 'Pagos', icon: Wallet, Comp: Pagos },
]

export default function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('inicio')
  const [ficha, setFicha] = useState(null) // cliente_id o null
  const Active = TABS.find((t) => t.id === tab).Comp

  const nav = {
    verCliente: (id) => setFicha(id),
    irA: (id) => { setFicha(null); setTab(id) },
  }

  return (
    <NavContext.Provider value={nav}>
      <div className="relative min-h-screen bg-[#0a0f0d] text-surface-200 font-sans">
        <div className="hero-glow absolute inset-0 pointer-events-none" />

        <header className="relative z-10 border-b border-primary-500/10 glass">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold gradient-text">Margon</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 ring-1 ring-primary-500/20">
                panel interno
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-sm text-surface-200/60 hover:text-red-400 transition"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>

          <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 -mb-px overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  tab === id
                    ? 'border-primary-400 text-white'
                    : 'border-transparent text-surface-200/50 hover:text-surface-200/80'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>
        </header>

        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Active />
        </main>

        {ficha && <ClienteDetalle id={ficha} onClose={() => setFicha(null)} />}
      </div>
    </NavContext.Provider>
  )
}
