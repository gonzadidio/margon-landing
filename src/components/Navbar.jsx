import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import LanguageToggle from './LanguageToggle'
import { useI18n } from '../i18n'

export default function Navbar() {
  const { t } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = t('nav.links')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-18">
          {/* Logo */}
          <a href="#" className="group transition-transform hover:scale-[1.02]">
            <Logo
              src="/logo.png"
              alt="MarGon Software"
              className="h-10 lg:h-11 w-auto"
            />
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.highlight
                    ? 'gradient-text hover:brightness-125'
                    : 'text-surface-200/80 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Idioma + CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageToggle size="sm" />
            <a
              href="#contacto"
              className="btn-outline-gradient inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary-500/25"
            >
              {t('nav.cta')}
            </a>
          </div>

          {/* Idioma + toggle mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageToggle size="sm" />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white p-2"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? t('nav.cerrarMenu') : t('nav.abrirMenu')}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass border-t border-white/5 animate-fade-in">
          <div className="px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-base font-medium text-surface-200 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contacto"
              onClick={() => setMobileOpen(false)}
              className="btn-outline-gradient mt-4 block w-full text-center rounded-lg px-5 py-3 text-sm font-semibold text-white"
            >
              {t('nav.cta')}
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
