// Cobros por mes: generar el período, ver quién pagó y avisar a quien no.
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, Wallet } from 'lucide-react'
import { apiGet, apiPost } from './api'
import { Card, Btn, Cargando, ErrorMsg, Empty, Segment, useToast, useCarga } from './ui'
import CobroRow, { useAccionesCobro } from './CobroRow'
import CobroForm from './CobroForm'
import { fmtMoney, periodoActual, periodoLargo, capitalizar, sumarMeses, estadoPago } from './format'

export default function Cobros({ periodoInicial }) {
  const toast = useToast()
  const [periodo, setPeriodo] = useState(periodoInicial || periodoActual())
  const [modo, setModo] = useState('mes')          // 'mes' | 'pendientes'
  const [filtro, setFiltro] = useState('todos')    // todos | pendientes | pagados
  const [nuevo, setNuevo] = useState(false)
  const [generando, setGenerando] = useState(false)

  const { data, error, loading, recargar } = useCarga(
    () => modo === 'mes'
      ? Promise.all([apiGet('/cobros', { periodo }), apiGet('/cobros/resumen', { periodo })]).then(([cobros, resumen]) => ({ cobros, resumen }))
      : apiGet('/cobros', { pendientes: 1 }).then((cobros) => ({ cobros, resumen: null })),
    [periodo, modo])
  const acciones = useAccionesCobro(recargar)

  function irPeriodo(p) { if (!p) return; setPeriodo(p); window.location.hash = `#/cobros?p=${p}` }
  const cambiarMes = (n) => irPeriodo(sumarMeses(periodo, n))

  async function generar() {
    setGenerando(true)
    try {
      const r = await apiPost('/cobros/generar', { periodo })
      toast(r.creados ? `${r.creados} cobro${r.creados === 1 ? '' : 's'} generado${r.creados === 1 ? '' : 's'}` : 'No había nada para generar')
      recargar()
    } catch (e) { toast(e.message, 'error') } finally { setGenerando(false) }
  }

  const cobros = (data?.cobros || []).filter((c) => {
    const e = estadoPago(c)
    if (filtro === 'pendientes') return e !== 'pagado'
    if (filtro === 'pagados') return e === 'pagado'
    return true
  })
  const totales = data?.resumen?.totales || []
  const sinGenerar = data?.resumen?.sin_generar || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold ad-ink tracking-tight">Cobros</h1>
          <p className="ad-muted text-sm mt-0.5">Generá el mes, avisá y registrá los pagos.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Segment size="sm" value={modo} onChange={setModo} options={[{ v: 'mes', label: 'Por mes' }, { v: 'pendientes', label: 'Todo lo pendiente' }]} />
          <Btn variant="primary" size="sm" icon={Plus} onClick={() => setNuevo(true)}>Cobro manual</Btn>
        </div>
      </div>

      {modo === 'mes' && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center rounded-lg ring-1 ad-line bg-white/4">
            <button onClick={() => cambiarMes(-1)} className="ad-iconbtn" title="Mes anterior"><ChevronLeft className="w-4 h-4" /></button>
            <input type="month" value={periodo} onChange={(e) => irPeriodo(e.target.value)} className="bg-transparent text-[13.5px] font-semibold ad-ink text-center outline-none px-1 w-[176px]" />
            <button onClick={() => cambiarMes(1)} className="ad-iconbtn" title="Mes siguiente"><ChevronRight className="w-4 h-4" /></button>
          </div>
          {periodo !== periodoActual() && <button onClick={() => { setPeriodo(periodoActual()); window.location.hash = '#/cobros' }} className="text-xs text-primary-300 font-semibold">Ir a este mes</button>}
          <div className="ml-auto flex gap-2 flex-wrap">
            {totales.map((t) => (
              <div key={t.moneda} className="ad-card px-3 py-2 text-[12.5px] flex items-center gap-3">
                <span className="ad-faint font-semibold">{t.moneda}</span>
                <span className="ad-muted">Emitido <b className="ad-ink tabular-nums">{fmtMoney(t.facturado, t.moneda)}</b></span>
                <span className="ad-muted">Cobrado <b className="text-primary-300 tabular-nums">{fmtMoney(t.cobrado, t.moneda)}</b></span>
                {Number(t.facturado) - Number(t.cobrado) > 0 && <span className="ad-muted">Falta <b className="text-amber-300 tabular-nums">{fmtMoney(Number(t.facturado) - Number(t.cobrado), t.moneda)}</b></span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {modo === 'mes' && sinGenerar.length > 0 && (
        <div className="ad-banner">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <b>{sinGenerar.length} cliente{sinGenerar.length === 1 ? '' : 's'} sin cobro de {periodoLargo(periodo)}</b>: <span className="opacity-80">{sinGenerar.map((c) => `${c.nombre} (${fmtMoney(c.monto_mensual, c.moneda)})`).join(', ')}</span>
          </div>
          <Btn variant="primary" size="sm" loading={generando} onClick={generar}>Generar</Btn>
        </div>
      )}

      {loading ? <Cargando /> : error ? <ErrorMsg>{error}</ErrorMsg> : (
        <Card flush title={modo === 'mes' ? capitalizar(periodoLargo(periodo)) : 'Todo lo que falta cobrar'}
          extra={modo === 'mes' && <Segment size="sm" value={filtro} onChange={setFiltro} options={[{ v: 'todos', label: `Todos · ${data.cobros.length}` }, { v: 'pendientes', label: 'Pendientes' }, { v: 'pagados', label: 'Pagados' }]} />}>
          {cobros.length === 0
            ? <Empty icon={Wallet} title={modo === 'mes' ? 'No hay cobros en este mes' : 'No hay nada pendiente'} text={modo === 'mes' && data.cobros.length === 0 ? 'Generá los cobros mensuales o cargá uno manual.' : ''} />
            : cobros.map((c) => <CobroRow key={c.id} c={c} acciones={acciones} mostrarPeriodo={modo !== 'mes'} />)}
        </Card>
      )}

      {nuevo && <CobroForm onClose={() => setNuevo(false)} onSaved={() => { setNuevo(false); toast('Cobro creado'); recargar() }} />}
      {acciones.modales}
    </div>
  )
}
