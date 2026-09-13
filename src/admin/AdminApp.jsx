import { useEffect, useState } from 'react'
import { Sun, Users, Wallet, Target, Settings, LogOut } from 'lucide-react'
import { getToken, clearToken, setOnUnauthorized } from './api'
import { useRuta, ir } from './nav'
import { ToastProvider } from './ui'
import Logo from '../components/Logo'
import Login from './Login'
import Hoy from './Hoy'
import Clientes from './Clientes'
import Cliente from './Cliente'
import Cobros from './Cobros'
import Ventas from './Ventas'
import Ajustes from './Ajustes'

const SECCIONES = [
  { id: 'hoy', label: 'Hoy', icon: Sun },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'cobros', label: 'Cobros', icon: Wallet },
  { id: 'ventas', label: 'Ventas', icon: Target },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
]

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => !!getToken())
  useEffect(() => { setOnUnauthorized(() => setAuthed(false)) }, [])

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />
  return (
    <ToastProvider>
      <Shell onLogout={() => { clearToken(); setAuthed(false) }} />
    </ToastProvider>
  )
}

function Shell({ onLogout }) {
  const ruta = useRuta()
  const seccion = SECCIONES.some((s) => s.id === ruta.seccion) ? ruta.seccion : 'hoy'

  useEffect(() => { window.scrollTo(0, 0) }, [ruta.seccion, ruta.id])

  let vista = null
  if (seccion === 'hoy') vista = <Hoy />
  else if (seccion === 'clientes') vista = ruta.id ? <Cliente id={ruta.id} key={ruta.id} /> : <Clientes />
  else if (seccion === 'cobros') vista = <Cobros periodoInicial={ruta.query.p} />
  else if (seccion === 'ventas') vista = <Ventas />
  else if (seccion === 'ajustes') vista = <Ajustes />

  return (
    <div className="ad-app font-sans">
      <header className="ad-panel border-b ad-line sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <a href="#/hoy" className="flex items-center gap-2.5 shrink-0">
            <Logo src="/logo.png" alt="Margon" className="h-7 w-auto" />
            <span className="hidden sm:inline text-[10px] ad-faint px-1.5 py-0.5 rounded bg-white/5 ring-1 ad-line">panel</span>
          </a>
          <nav className="flex items-center gap-0.5 ml-2 overflow-x-auto ad-nav">
            {SECCIONES.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => ir(id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap transition ${
                  seccion === id ? 'bg-primary-500/15 text-primary-300' : 'ad-muted hover:bg-white/5 hover:text-white'}`}>
                <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
          <button onClick={onLogout} title="Salir" className="ml-auto ad-iconbtn"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6 lg:py-8">{vista}</main>
    </div>
  )
}
