import { useState } from 'react'
import { Field, Kpi, NumInput, Pill } from './ui'
import { etiquetaMes, etiquetaMesLarga, sumarMeses, usd } from './calculos'

export default function Terreno({ cfg, calc: c, cambiarCfg, accion, api }) {
  const [ocupada, setOcupada] = useState(null)
  const [festejo, setFestejo] = useState(null)

  async function tocar(n) {
    setOcupada(n)
    if (c.cuotasPagas.has(n)) await accion(() => api.desmarcarCuota(n), `Cuota ${n} desmarcada`)
    else {
      const quedan = c.nCuotas - c.cuotasPagas.size - 1
      const ok = await accion(() => api.marcarCuota(n, {}), quedan ? `¡Una cuota menos! Faltan ${quedan}` : '¡Terreno pagado! Es nuestro')
      if (ok) { setFestejo(n); setTimeout(() => setFestejo(null), 1400) }
    }
    setOcupada(null)
  }

  const coincide = c.nCuotas * c.valorCuota === Number(cfg.precio)

  return (
    <section className="lt-section">
      <div className="lt-head">
        <div>
          <span className="lt-eyebrow">El terreno · Lote 137</span>
          <h2 className="lt-h2" style={{ marginTop: 4 }}>{c.nCuotas} cuotas de {usd(c.valorCuota)}</h2>
        </div>
        <Pill tone="ok">{c.cuotasPagas.size} de {c.nCuotas} pagadas</Pill>
      </div>

      <div className="lt-plan" role="group" aria-label="Cuotas del lote">
        {Array.from({ length: c.nCuotas }, (_, i) => i + 1).map((n) => {
          const paga = c.cuotasPagas.has(n)
          const mes = c.inicio ? etiquetaMes(sumarMeses(c.inicio, n - 1)) : null
          const cls = ['lt-lot', paga && 'is-paid', !paga && n === c.proxima && 'is-next', n === c.cuotaDeEntrega && 'is-entrega', n === festejo && 'is-festejo'].filter(Boolean).join(' ')
          return (
            <button key={n} type="button" className={cls} aria-pressed={paga} disabled={ocupada === n}
              title={`Cuota ${n}${mes ? ` · ${mes}` : ''}${paga ? ' · pagada' : ''}${n === c.cuotaDeEntrega ? ' · mes de entrega' : ''}`}
              onClick={() => tocar(n)}>
              {n}
            </button>
          )
        })}
      </div>
      <div className="lt-legend">
        <span><i style={{ background: '#3fa1ac', borderColor: '#2b7a83' }} />Pagada</span>
        <span><i style={{ background: '#fff', border: '2px dashed #3fa1ac' }} />Próxima</span>
        <span><i />Pendiente</span>
        <span><i style={{ background: '#c71d2a', borderColor: '#c71d2a', width: 8, height: 8, borderRadius: '50%' }} />Mes de entrega</span>
        <span>Tocá una cuota cuando la paguen: se pinta y se suma sola a “Lo que pusimos”.</span>
      </div>

      <div className="lt-grid lt-g3">
        <Kpi label="Lo que falta del terreno" value={usd(c.saldoLote)} sub={`${c.nCuotas - c.cuotasPagas.size} cuotas por pagar`} />
        <Kpi label="Última cuota" value={c.ultimaCuota ? etiquetaMesLarga(c.ultimaCuota) : '—'}
          sub={c.inicio ? `la entrega cae en la cuota ${c.cuotaDeEntrega}` : 'Cargá el mes de la cuota 1 para ver el calendario'} />
        <Kpi label="Plan contra precio" value={usd(c.nCuotas * c.valorCuota)}
          sub={coincide ? `coincide con el precio de ${usd(cfg.precio)}` : `no coincide con el precio de ${usd(cfg.precio)}: revisalo`} />
      </div>

      <div className="lt-card lt-card-sand">
        <h3 className="lt-h3" style={{ marginBottom: 14 }}>Datos del plan</h3>
        <div className="lt-grid lt-g4">
          <Field label="Precio del lote (USD)"><NumInput id="lt-precio" value={cfg.precio} onChange={(v) => cambiarCfg({ precio: v })} /></Field>
          <Field label="Cantidad de cuotas"><NumInput id="lt-cuotas" step="1" value={cfg.cuotas} onChange={(v) => cambiarCfg({ cuotas: v })} /></Field>
          <Field label="Valor de cuota (USD)"><NumInput id="lt-cuota" value={cfg.cuota} onChange={(v) => cambiarCfg({ cuota: v })} /></Field>
          <Field label="Mes de la cuota 1">
            <input id="lt-inicio" className="lt-input" type="month" value={cfg.inicioCuotas || ''} onChange={(e) => cambiarCfg({ inicioCuotas: e.target.value })} />
          </Field>
        </div>
      </div>
    </section>
  )
}
