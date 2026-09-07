import { useState, useEffect } from 'react'
import { useDynamicFavicon } from './hooks/useDynamicFavicon'
import Background from './components/Background'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Projects from './components/Projects'
import CTA from './components/CTA'
import Footer from './components/Footer'
import BudgetBuilder from './components/BudgetBuilder'
import ProjectDetail from './components/ProjectDetail'
import OrbexCase from './components/orbex/OrbexCase'
import PuntoBellaVistaCase from './components/pbv/PuntoBellaVistaCase'
import AdminApp from './admin/AdminApp'
import PortalApp from './portal/PortalApp'
import { getPresupuestoConfig, defaultConfig } from './config/presupuestos'

const path = window.location.pathname
// Zona interna oculta: /admin (no se enlaza desde la web pública)
const isAdmin = path.startsWith('/admin')
// Portal de clientes: /portal
const isPortal = path.startsWith('/portal')
// Caso de estudio por proyecto: /proyecto/:slug
const projectMatch = path.match(/^\/proyecto\/([^/]+)/)
// Presupuesto interactivo: /presupuesto (genérico) o /p/:slug (por cliente, no listado)
const isPresupuesto = path === '/presupuesto' || path === '/presupuesto/'
const presMatch = path.match(/^\/p\/([^/]+)/)

export default function App() {
  if (isAdmin) return <AdminApp />
  if (isPortal) return <PortalApp />

  if (projectMatch) {
    const slug = decodeURIComponent(projectMatch[1])
    // Casos con página propia; el resto usa la genérica.
    if (slug === 'orbex') return <OrbexCase />
    if (slug === 'punto-bella-vista') return <PuntoBellaVistaCase />
    return <ProjectDetail slug={slug} />
  }

  if (presMatch) return <BudgetBuilder config={getPresupuestoConfig(decodeURIComponent(presMatch[1]))} />
  if (isPresupuesto) return <BudgetBuilder config={defaultConfig} />

  return <LandingApp />
}

function LandingApp() {
  useDynamicFavicon('/logo2.png')

  const [page, setPage] = useState(window.location.hash)

  useEffect(() => {
    const onHash = () => setPage(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // if (page === '#presupuesto') {
  //   return <BudgetBuilder />
  // }

  return (
    <div className="relative min-h-screen bg-[#0a0f0d] text-surface-200 font-sans">
      <Background />
      <div className="relative z-10">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Projects />
        <CTA />
      </main>
      <Footer />
      </div>
    </div>
  )
}
