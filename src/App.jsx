import { useDynamicFavicon } from './hooks/useDynamicFavicon'
import Background from './components/Background'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Benefits from './components/Benefits'
import Process from './components/Process'
import Solutions from './components/Solutions'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function App() {
  useDynamicFavicon('/logo2.png')

  return (
    <div className="relative min-h-screen bg-[#0a0f0d] text-surface-200 font-sans">
      <Background />
      <div className="relative z-10">
      <Navbar />
      <main>
        <Hero />
        <Services />
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
