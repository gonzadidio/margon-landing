import { useState, useEffect } from 'react'
import { useDynamicFavicon } from './hooks/useDynamicFavicon'
import Background from './components/Background'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Benefits from './components/Benefits'
import Process from './components/Process'
import Projects from './components/Projects'
import Testimonials from './components/Testimonials'
import Solutions from './components/Solutions'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Footer from './components/Footer'
import BudgetBuilder from './components/BudgetBuilder'
import ProjectDetail from './components/ProjectDetail'
import AdminApp from './admin/AdminApp'

const path = window.location.pathname
// Zona interna oculta: /admin (no se enlaza desde la web pública)
const isAdmin = path.startsWith('/admin')
// Caso de estudio por proyecto: /proyecto/:slug
const projectMatch = path.match(/^\/proyecto\/([^/]+)/)

export default function App() {
  if (isAdmin) return <AdminApp />
  if (projectMatch) return <ProjectDetail slug={decodeURIComponent(projectMatch[1])} />

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
        <Testimonials />
        <Benefits />
        <Process />
        <Solutions />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      </div>
    </div>
  )
}
