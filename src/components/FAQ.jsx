import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

const faqs = [
  {
    q: '¿Cuánto tiempo tarda un proyecto típico?',
    a: 'Depende de la complejidad. Un MVP puede estar listo entre 5 a 15 días. Siempre trabajamos con entregas incrementales para que veas avances constantes.',
  },
  {
    q: '¿Qué tecnologías utilizan?',
    a: 'Elegimos el stack según tu proyecto: React, Next.js, Node.js, Python, Flutter, React Native, PostgreSQL, MongoDB, AWS, entre otras. Siempre priorizamos rendimiento, seguridad y escalabilidad.',
  },
  {
    q: '¿Puedo escalar el equipo durante el proyecto?',
    a: 'Sí. Nuestro modelo es flexible. Podemos agregar desarrolladores especializados según la etapa del proyecto y las necesidades que surjan.',
  },
  {
    q: '¿Qué pasa después del lanzamiento?',
    a: 'Ofrecemos planes de mantenimiento y soporte continuo. Tu software sigue evolucionando con actualizaciones, mejoras y soporte técnico dedicado.',
  },
  {
    q: '¿Trabajan con startups o solo con empresas grandes?',
    a: 'Trabajamos con ambos. Desde startups que necesitan su primer MVP hasta corporaciones que requieren sistemas complejos. Adaptamos nuestro enfoque a cada contexto.',
  },
  {
    q: '¿El código es de mi propiedad?',
    a: 'Absolutamente. Todo el código fuente, diseños y documentación son de tu propiedad desde el día uno. Sin cláusulas de lock-in ni dependencias con nosotros.',
  },
]

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-primary-300"
      >
        <span className="text-base font-medium text-white pr-4">{faq.q}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-surface-200/40 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-primary-400' : ''
          }`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? '200px' : '0', opacity: isOpen ? 1 : 0 }}
      >
        <p className="pb-5 text-sm text-surface-200/50 leading-relaxed">
          {faq.a}
        </p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary-400 mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Preguntas{' '}
            <span className="gradient-text">frecuentes</span>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-6 lg:px-8">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
