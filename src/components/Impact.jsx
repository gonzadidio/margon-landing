import AnimatedSection from './AnimatedSection'
import { useInView } from '../hooks/useInView'
import { useState, useEffect } from 'react'

function Counter({ end, suffix = '', duration = 2000 }) {
  const [ref, isInView] = useInView()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, end, duration])

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  )
}

const stats = [
  { value: 50, suffix: '+', label: 'Proyectos entregados' },
  { value: 98, suffix: '%', label: 'Clientes satisfechos' },
  { value: 30, suffix: '+', label: 'Empresas confían en nosotros' },
  { value: 5, suffix: '+', label: 'Años de experiencia' },
]

export default function Impact() {
  return (
    <section className="relative py-24 lg:py-32">
      {/* Full-width gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-950/50 via-surface-950 to-primary-950/50" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Números que{' '}
            <span className="gradient-text">hablan por sí solos</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.12}>
              <div className="text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold gradient-text mb-2">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm md:text-base text-surface-200/50 font-medium">
                  {stat.label}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Visual impact bar */}
        <AnimatedSection delay={0.4}>
          <div className="mt-20 rounded-2xl border border-white/5 bg-white/[0.02] p-8 md:p-12 text-center glow">
            <p className="text-lg md:text-xl lg:text-2xl font-semibold text-white leading-relaxed max-w-3xl mx-auto">
              "No construimos software para que funcione.{' '}
              <span className="gradient-text">Construimos software para que transforme.</span>"
            </p>
            <p className="mt-4 text-sm text-surface-200/40 font-medium">
              — Filosofía Margon
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
