import { useState } from 'react'
import { LayoutDashboard, Users, Target, Wallet, FileText, LogOut, Menu, X } from 'lucide-react'
import { NavContext } from './nav'
import Logo from '../components/Logo'
import Home from './Home'
import Clientes from './Clientes'
import Oportunidades from './Oportunidades'
import Cobros from './Cobros'
import PresupuestosRecibidos from './PresupuestosRecibidos'
import ClienteDetalle from './ClienteDetalle'

const TABS = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard, Comp: Home },
  { id: 'clientes', label: 'Clientes', icon: Users, Comp: Clientes },
  { id: 'oportunidades', label: 'Oportunidades', icon: Target, Comp: Oportunidades },
  { id: 'presupuestos', label: 'Presupuestos web', icon: FileText, Comp: PresupuestosRecibidos },
  { id: 'cobros', label: 'Cobros', icon: Wallet, Comp: Cobros },
]

export default function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('inicio')
  const [ficha, setFicha] = useState(null) // cliente_id o null
  const [menu, setMenu] = useState(false)   // sidebar en mobile
  const Active = TABS.find((t) => t.id === tab).Comp

  const nav = {
    verCliente: (id) => { setTab('clientes'); setFicha(id); setMenu(false) },
    irA: (id) => { setFicha(null); setTab(id); setMenu(false) },
  }

  function go(id) {
    setFicha(null); setTab(id); setMenu(false)
  }

  return (
    <NavContext.Provider value={nav}>
      <div className="ad-app flex font-sans">
        {/* ===== Sidebar ===== */}
        <aside className={`ad-panel border-r ad-line w-60 shrink-0 flex-col p-3.5 gap-1 fixed inset-y-0 left-0 z-40 transition-transform lg:static lg:translate-x-0 ${menu ? 'flex translate-x-0' : 'flex -translate-x-full lg:translate-x-0'}`}>
          <div className="flex items-center gap-2.5 px-2 py-3">
            <Logo src="/logo.png" alt="Margon" className="h-8 w-auto" />
            <span className="text-[10px] ad-faint px-1.5 py-0.5 rounded bg-white/5 ring-1 ad-line">panel interno</span>
            <button onClick={() => setMenu(false)} className="ml-auto lg:hidden ad-muted p-1"><X className="w-5 h-5" /></button>
          </div>

          <nav className="flex flex-col gap-1 mt-1">
            {TABS.map(({ id, label, icon: Icon }) => {
              const on = tab === id
              return (
                <button key={id} onClick={() => go(id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${on ? 'bg-primary-500/15 text-primary-300' : 'ad-muted hover:bg-white/5 hover:ad-ink'}`}>
                  <Icon className="w-[18px] h-[18px]" /> {label}
                </button>
              )
            })}
          </nav>

          <button onClick={onLogout} className="mt-auto flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm ad-muted hover:bg-white/5 hover:text-red-400 transition border-t ad-line pt-3">
            <LogOut className="w-[18px] h-[18px]" /> Salir
          </button>
        </aside>

        {/* backdrop mobile */}
        {menu && <div onClick={() => setMenu(false)} className="fixed inset-0 z-30 bg-black/20 lg:hidden" />}

        {/* ===== Main ===== */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="ad-panel border-b ad-line h-14 flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-20">
            <button onClick={() => setMenu(true)} className="lg:hidden ad-muted p-1"><Menu className="w-5 h-5" /></button>
            <span className="text-sm font-semibold ad-ink capitalize">{ficha ? 'Cliente' : TABS.find((t) => t.id === tab)?.label}</span>
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-primary-500/15 text-primary-300 font-medium">margonsoftware.com</span>
          </header>

          <main className="flex-1 p-4 lg:p-7 max-w-6xl w-full mx-auto">
            {ficha
              ? <ClienteDetalle id={ficha} onClose={() => setFicha(null)} />
              : <Active />}
          </main>
        </div>
      </div>
    </NavContext.Provider>
  )
}
