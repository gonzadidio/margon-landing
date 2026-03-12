import { Github, Linkedin, Twitter, Instagram } from 'lucide-react'
import Logo from './Logo'

const footerLinks = {
  Servicios: [
    { label: 'Aplicaciones Web', href: '#servicios' },
    { label: 'Apps Mobile', href: '#servicios' },
    { label: 'E-Commerce', href: '#servicios' },
    { label: 'Sistemas a Medida', href: '#servicios' },
    { label: 'Automatizaciones', href: '#servicios' },
  ],
  Empresa: [
    { label: 'Sobre Nosotros', href: '#' },
    { label: 'Proceso', href: '#proceso' },
    { label: 'Blog', href: '#' },
    { label: 'Carreras', href: '#' },
    { label: 'Contacto', href: '#contacto' },
  ],
  Legal: [
    { label: 'Privacidad', href: '#' },
    { label: 'Términos', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
}

const socials = [
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="inline-block mb-5">
              <Logo src="/logo.png" alt="MarGon Software" className="h-10 w-auto" />
            </a>
            <p className="text-sm text-surface-200/40 leading-relaxed mb-6 max-w-xs">
              Transformamos ideas y procesos en soluciones digitales reales.
              Software de alto nivel para empresas que quieren crecer.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-surface-200/40 transition-all hover:text-primary-400 hover:border-primary-500/20 hover:bg-primary-500/5"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-surface-200/40 transition-colors hover:text-surface-200/80"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-200/30">
            &copy; {new Date().getFullYear()} Margon. Todos los derechos reservados.
          </p>
          <p className="text-xs text-surface-200/20">
            Hecho con dedicación en Argentina
          </p>
        </div>
      </div>
    </footer>
  )
}
