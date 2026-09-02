/**
 * Encabezado del hero: código decorativo (izq), ventanas decorativas (der),
 * ícono de persona y titular principal.
 */
const codeLines = [
  { n: '01', html: <><span className="text-cyan-400">const</span> {'{ '}<span className="text-primary-300">idea</span>{' }'} = <span className="text-accent-300">negocio</span>;</> },
  { n: '02', html: <><span className="text-cyan-400">const</span> desafio = <span className="text-accent-300">detectar</span>(idea);</> },
  { n: '03', html: <><span className="text-cyan-400">const</span> estrategia = <span className="text-accent-300">diseñar</span>(desafio);</> },
  { n: '04', html: <>&nbsp;</> },
  { n: '05', html: <><span className="text-cyan-400">function</span> <span className="text-accent-300">desarrollar</span>(estrategia) {'{'}</> },
  { n: '06', html: <>&nbsp;&nbsp;<span className="text-cyan-400">return</span> tecnologia</> },
  { n: '07', html: <>&nbsp;&nbsp;&nbsp;&nbsp;.<span className="text-fuchsia-300">escalable</span>()</> },
  { n: '08', html: <>&nbsp;&nbsp;&nbsp;&nbsp;.<span className="text-fuchsia-300">segura</span>()</> },
  { n: '09', html: <>&nbsp;&nbsp;&nbsp;&nbsp;.<span className="text-fuchsia-300">eficiente</span>()</> },
  { n: '10', html: <>&nbsp;&nbsp;&nbsp;&nbsp;.<span className="text-fuchsia-300">conectada</span>();{'}'}</> },
  { n: '11', html: <>{'}'}</> },
  { n: '12', html: <><span className="text-cyan-400">const</span> sistema = <span className="text-accent-300">implementar</span>();</> },
  { n: '13', html: <>console.<span className="text-accent-300">log</span>( resultados_reales );</> },
]

export default function HeroHeading() {
  return (
    <div className="relative text-center pt-6 pb-10 lg:pt-10 lg:pb-12">
      {/* Código decorativo — izquierda */}
      <div
        className="hero-floating-code hidden lg:flex absolute left-0 top-0 flex-col text-left font-mono text-[12px] leading-[1.65] text-[#6c8b80] select-none"
        aria-hidden="true"
      >
        {codeLines.map((l) => (
          <span key={l.n} className="whitespace-nowrap">
            <span className="inline-block w-8 text-surface-200/25">{l.n}</span>
            {l.html}
          </span>
        ))}
      </div>

      {/* Ventanas decorativas — derecha */}
      <div className="hero-floating-windows hidden lg:block absolute right-0 top-0 w-[340px] h-[210px]" aria-hidden="true">
        <div className="hero-mini-window w-[170px] h-[160px] right-[175px] top-0">
          {[80, 50, 70, 60, 75, 45, 65].map((w, i) => (
            <span key={i} style={{ width: `${w}%` }} className={i % 3 === 1 ? 'bg-primary-400/30' : ''} />
          ))}
        </div>
        <div className="hero-mini-window w-[60px] h-[45px] right-[110px] top-0" />
        <div className="hero-mini-window w-[165px] h-[135px] right-0 top-[55px]">
          {[80, 50, 70, 60, 75].map((w, i) => (
            <span key={i} style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="absolute right-[40px] bottom-0 hero-dots-grid" />
      </div>

      {/* Ícono persona */}
      <div className="hero-symbol animate-fade-up mx-auto" aria-hidden="true">
        <div className="hero-symbol-head" />
        <div className="hero-symbol-body" />
      </div>

      <h1
        className="animate-fade-up relative z-10 mx-auto mt-4 max-w-3xl text-3xl sm:text-4xl lg:text-[52px] font-extrabold tracking-tight leading-[1.08]"
        style={{ animationDelay: '0.1s' }}
      >
        Transformamos <span className="text-accent-300">ideas</span> en{' '}
        <br className="hidden sm:block" />
        <span className="text-cyan-400">soluciones digitales</span> reales
      </h1>
    </div>
  )
}
