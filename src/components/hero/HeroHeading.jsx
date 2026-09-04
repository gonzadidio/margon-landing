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

/* Título principal debajo del logo. En prueba oculto: poner en true para restaurarlo. */
const SHOW_TITLE = false

export default function HeroHeading() {
  return (
    <div className="hero-heading relative text-center pt-6 pb-10 lg:pt-10 lg:pb-12">
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


      {/* Ventanas decorativas — esquina derecha */}
      <div className="hero-floating-windows hidden lg:block absolute right-0 top-0 w-[380px] h-[250px]" aria-hidden="true">
        <img src="/hero/ventanas.png" alt="" className="hero-floating-windows-img w-full h-full object-contain" />
      </div>

      {/* Ícono persona */}
      <div className="hero-symbol animate-fade-up mx-auto" aria-hidden="true">
        <img src="/hero/logo-hero.png" alt="" className="hero-symbol-img" />
      </div>

      {SHOW_TITLE && (
        <h1
          className="animate-fade-up relative z-10 mx-auto mt-4 max-w-3xl text-3xl sm:text-4xl lg:text-[52px] font-extrabold tracking-tight leading-[1.08]"
          style={{ animationDelay: '0.1s' }}
        >
          Transformamos <span className="gradient-text">ideas</span> en{' '}
          <br className="hidden sm:block" />
          <span className="gradient-text">soluciones digitales</span> reales
        </h1>
      )}
    </div>
  )
}
