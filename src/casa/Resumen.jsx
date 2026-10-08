import { Kpi, Pill } from './ui'
import { ambas, ars, saludo, etiquetaMes, etiquetaMesLarga, fmt, mesesEntre, pct, sumarMeses, usd } from './calculos'

export default function Resumen({ cfg, calc: c, estado }) {
  const inicio = c.inicio || c.hoy
  const tramo = Math.max(1, mesesEntre(inicio, c.entrega) + c.prorroga)
  const hecho = Math.min(tramo, Math.max(0, mesesEntre(inicio, c.hoy)))
  const finProrroga = sumarMeses(c.entrega, c.prorroga)
  const falta = Math.max(0, c.costoCasa - c.juntadoEntrega)
  const pctTerreno = c.nCuotas ? c.cuotasPagas.size / c.nCuotas : 0
  const pctCasa = c.costoCasa ? Math.min(1, c.ahorroHoy / c.costoCasa) : 0
  const nombre = estado?.yo?.nombre

  let estadoAhorro = null
  if (c.ahorroMes > 0) {
    if (falta === 0) estadoAhorro = <Pill tone="ok">Llegamos al 100%</Pill>
    else if (c.juntadoProrroga >= c.costoCasa) estadoAhorro = <Pill tone="warn">Llegamos con la prórroga</Pill>
    else estadoAhorro = <Pill tone="no">Faltan {usd(falta)}</Pill>
  }

  return (
    <>
      <section className="lt-hero">
        <div className="lt-hero-ripple" aria-hidden="true" />
        <div style={{ position: 'relative' }}>
          <span className="lt-eyebrow">{saludo()}{nombre ? `, ${nombre}` : ''}</span>
          <h1 className="lt-h1" style={{ marginTop: 10 }}>Acá empieza<br />nuestra casa</h1>
          <p>
            {c.mesesEntrega > 0
              ? <>Faltan <b>{c.mesesEntrega} meses</b> para pisar nuestro terreno. Ya pagamos <b>{c.cuotasPagas.size} de {c.nCuotas}</b> cuotas y la casa nos espera con sus {fmt(cfg.m2)} m².</>
              : <>El terreno ya es nuestro. Ahora, a levantar los {fmt(cfg.m2)} m².</>}
          </p>
          <div className="lt-count" aria-live="polite" style={{ marginTop: 22 }}>
            <span className="lt-eyebrow">Entrega del terreno</span>
            <div className="lt-count-big lt-num">
              {c.mesesEntrega === 0 ? 'Este mes' : <>{c.mesesEntrega}<small>{c.mesesEntrega === 1 ? 'mes' : 'meses'}</small></>}
            </div>
            <div className="lt-track" role="img" aria-label={`Pasaron ${hecho} de ${tramo} meses`}>
              <i style={{ width: `${(hecho / tramo) * 100}%` }} />
              <b style={{ width: `${(c.prorroga / tramo) * 100}%` }} />
            </div>
            <div className="lt-count-foot">
              <span>{etiquetaMesLarga(c.entrega)}</span>
              <span>con prórroga: {etiquetaMesLarga(finProrroga)}</span>
            </div>
          </div>
        </div>
        <Casita terreno={pctTerreno} casa={pctCasa} />
      </section>

      <Camino c={c} />

      <section className="lt-section">
        <div className="lt-head">
          <h2 className="lt-h2">Dónde estamos</h2>
          <span className="lt-eyebrow">{c.tc ? `Dólar a ${ars(c.tc)}` : 'Sin cotización cargada'}</span>
        </div>
        <div className="lt-grid lt-g4">
          <Kpi label="Lo que ya pusimos" value={usd(c.pagado.usd)} sub={c.pagado.ars ? `+ ${ars(c.pagado.ars)} en pesos` : 'todo en dólares'} />
          <Kpi label="Cuotas del terreno" value={`${c.cuotasPagas.size} / ${c.nCuotas}`} sub={`quedan ${usd(c.saldoLote)}`} />
          <Kpi label="Nuestra casa terminada" value={usd(c.costoCasa)} sub={`${fmt(cfg.m2)} m² × ${usd(cfg.usdM2)} + ${fmt(cfg.adicionalesPct)}%`} />
          <Kpi label="Ahorro a la entrega" value={usd(c.juntadoEntrega)} accent
            sub={c.ahorroMes || c.cobrosEntrega.usd ? `${pct(c.juntadoEntrega, c.costoCasa)} de la casa${c.cobrosEntrega.usd ? ` · incluye ${usd(c.cobrosEntrega.usd)} de Margon` : ''}` : 'Cargá el ahorro mensual en “Nuestra casa”'}>
            {estadoAhorro && <div>{estadoAhorro}</div>}
          </Kpi>
        </div>
      </section>

      <section className="lt-section">
        <div className="lt-head">
          <h2 className="lt-h2">El ahorro hasta la entrega</h2>
          <span className="lt-small lt-muted">{c.sobra != null ? `Nos sobran ${usd(c.sobra)} por mes` : `Nos sobran ${ambas({ usd: c.sobraUsd, ars: c.sobraArs })} por mes`}</span>
        </div>
        <div className="lt-card">
          <Grafico c={c} />
          <p className="lt-small lt-muted" style={{ margin: '10px 0 0' }}>
            {c.ahorroMes
              ? `Ahorrando ${usd(c.ahorroMes)} por mes desde hoy${c.cobrosEntrega.usd ? ` y cobrando ${usd(c.cobrosEntrega.usd)} de Margon` : ''}, a la entrega tenemos ${usd(c.juntadoEntrega)} y con la prórroga ${usd(c.juntadoProrroga)}. La casa estimada cuesta ${usd(c.costoCasa)}. Los escalones son los cobros y las cuotas que terminan.`
              : 'Cargá cuánto podemos ahorrar por mes en “Nuestra casa” y acá aparece la curva.'}
          </p>
        </div>
      </section>
    </>
  )
}

// La casa dibujada: el terreno se pinta con las cuotas, la casa con el ahorro.
function Casita({ terreno, casa }) {
  const W = 320, suelo = 210
  const altoCasa = 120, topCasa = suelo - altoCasa
  const nivel = topCasa - 60 + (altoCasa + 60) * (1 - casa) // incluye el techo
  return (
    <figure className="lt-casita" aria-label={`Terreno ${Math.round(terreno * 100)}% pagado, casa ${Math.round(casa * 100)}% ahorrada`}>
      <svg viewBox={`0 0 ${W} 260`} role="img">
        <defs>
          <clipPath id="lt-clip-casa"><path d={`M70 ${suelo} V${topCasa} L160 ${topCasa - 60} L250 ${topCasa} V${suelo} Z`} /></clipPath>
          <linearGradient id="lt-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity="0" /><stop offset="1" stopColor="#ffffff" stopOpacity=".6" /></linearGradient>
        </defs>
        <circle cx="262" cy="52" r="20" fill="#f6e3b4" className="lt-sol" />
        {/* árboles */}
        <g fill="#c9d9a8"><circle cx="34" cy="176" r="22" /><circle cx="52" cy="160" r="18" /><circle cx="292" cy="182" r="18" /></g>
        <g stroke="#9db27a" strokeWidth="3"><line x1="40" y1="192" x2="40" y2={suelo} /><line x1="292" y1="196" x2="292" y2={suelo} /></g>
        {/* terreno */}
        <rect x="10" y={suelo} width={W - 20} height="22" rx="4" fill="#f6f1e7" stroke="#e8dfcd" />
        <rect x="10" y={suelo} width={(W - 20) * terreno} height="22" rx="4" fill="#3fa1ac" className="lt-fill" />
        {/* casa: relleno de ahorro */}
        <g clipPath="url(#lt-clip-casa)">
          <rect x="60" y={topCasa - 70} width="200" height={altoCasa + 80} fill="url(#lt-cielo)" />
          <rect x="60" y={nivel} width="200" height={suelo - nivel} fill="#c9d9a8" className="lt-fill" />
        </g>
        <path d={`M70 ${suelo} V${topCasa} L160 ${topCasa - 60} L250 ${topCasa} V${suelo}`} fill="none" stroke="#2b7a83" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={`M58 ${topCasa + 8} L160 ${topCasa - 70} L262 ${topCasa + 8}`} fill="none" stroke="#2b7a83" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="142" y={suelo - 52} width="36" height="52" rx="2" fill="none" stroke="#2b7a83" strokeWidth="2" />
        <circle cx="171" cy={suelo - 26} r="2" fill="#2b7a83" />
        <rect x="92" y={topCasa + 22} width="32" height="28" rx="2" fill="none" stroke="#2b7a83" strokeWidth="2" />
        <rect x="196" y={topCasa + 22} width="32" height="28" rx="2" fill="none" stroke="#2b7a83" strokeWidth="2" />
        <text x="10" y="252" className="lt-casita-l">TERRENO {Math.round(terreno * 100)}%</text>
        <text x={W - 10} y="252" textAnchor="end" className="lt-casita-l">CASA {Math.round(casa * 100)}%</text>
      </svg>
    </figure>
  )
}

// Nuestro camino: los hitos del plan, de la reserva a la mudanza.
function Camino({ c }) {
  const entregada = c.mesesEntrega === 0
  const hitos = [
    { t: 'Reservamos el lote 137', d: 'Openn Pilar', ok: true },
    { t: 'Firmamos y pagamos la cuota 1', d: c.inicio ? etiquetaMesLarga(c.inicio) : 'con la comisión', ok: c.cuotasPagas.has(1) },
    { t: 'Nos entregan el terreno', d: etiquetaMesLarga(c.entrega), ok: entregada },
    { t: 'Arrancamos la obra', d: c.ahorroMes ? `con ${usd(c.juntadoEntrega)} juntados` : 'cuando el ahorro lo permita', ok: false },
    { t: 'Nos mudamos', d: 'nuestra casa', ok: false, sueño: true },
  ]
  const actual = hitos.findIndex((h) => !h.ok)
  return (
    <section className="lt-section">
      <div className="lt-head"><h2 className="lt-h2">Nuestro camino</h2></div>
      <ol className="lt-camino">
        {hitos.map((h, i) => (
          <li key={h.t} className={`${h.ok ? 'is-ok' : ''}${i === actual ? ' is-now' : ''}${h.sueño ? ' is-dream' : ''}`}>
            <span className="lt-camino-dot" aria-hidden="true">{h.ok ? '✓' : i + 1}</span>
            <span className="lt-camino-t">{h.t}</span>
            <span className="lt-camino-d">{h.d}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function pasoLindo(max) {
  const r = max / 4, p = Math.pow(10, Math.floor(Math.log10(r || 1))), n = r / p
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p
}

function Grafico({ c }) {
  const meses = c.mesesProrroga
  if (meses <= 0) return null
  const W = 960, H = 280, L = 58, R = 18, T = 20, B = 34
  const max = Math.max(c.costoCasa, c.juntadoProrroga, 1) * 1.1
  const x = (i) => L + ((W - L - R) * i) / meses
  const y = (v) => T + (H - T - B) * (1 - v / max)
  const linea = c.serie.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${linea} L${x(meses)} ${y(0)} L${x(0)} ${y(0)} Z`
  const paso = pasoLindo(max)
  const ticks = []
  for (let v = 0; v <= max; v += paso) ticks.push(v)
  const cada = meses > 14 ? 3 : meses > 7 ? 2 : 1
  const xe = x(c.mesesEntrega)
  return (
    <svg className="lt-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Ahorro proyectado contra el costo de la casa">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#eeeeee" />
          <text x={L - 8} y={y(v) + 4} textAnchor="end">{v >= 1000 ? `${fmt(v / 1000)}k` : fmt(v)}</text>
        </g>
      ))}
      {Array.from({ length: Math.floor(meses / cada) + 1 }, (_, k) => k * cada).map((i) => (
        <text key={i} x={x(i)} y={H - 10} textAnchor="middle">{etiquetaMes(sumarMeses(c.hoy, i))}</text>
      ))}
      <rect x={xe} y={T} width={Math.max(0, x(meses) - xe)} height={H - T - B} fill="#e3f3f4" />
      <line x1={xe} x2={xe} y1={T} y2={H - B} stroke="#3fa1ac" strokeDasharray="4 4" />
      <text x={xe + 8} y={T + 14} style={{ fill: '#2b7a83', fontWeight: 600 }}>ENTREGA</text>
      <line x1={L} x2={W - R} y1={y(c.costoCasa)} y2={y(c.costoCasa)} stroke="#1c2526" strokeWidth="1.5" />
      <text x={W - R} y={y(c.costoCasa) - 8} textAnchor="end" style={{ fill: '#1c2526', fontWeight: 500 }}>Nuestra casa {usd(c.costoCasa)}</text>
      <path d={area} fill="#3fa1ac" opacity=".12" />
      <path d={linea} fill="none" stroke="#3fa1ac" strokeWidth="2.5" />
      <circle cx={xe} cy={y(c.juntadoEntrega)} r="5.5" fill="#3fa1ac" />
      <circle cx={x(meses)} cy={y(c.juntadoProrroga)} r="5.5" fill="#ffffff" stroke="#3fa1ac" strokeWidth="2" />
    </svg>
  )
}
