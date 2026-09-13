// "Hoy": todo lo que hay que atender, en una sola consulta. Lo usa la
// pantalla de inicio del panel y el resumen diario por mail.
import { pool } from './db.js'
import { hoyAR, sumarDias, fmtMoney, periodoLargo, fmtFecha } from './formato.js'

const PAGADO = `(SELECT COALESCE(SUM(monto),0) FROM pagos WHERE cobro_id = c.id)`
const ULTIMO_ENVIO = `(SELECT json_build_object('canal', e.canal, 'tipo', e.tipo, 'fecha', e.created_at)
                        FROM envios e WHERE e.cobro_id = c.id ORDER BY e.created_at DESC LIMIT 1)`

export async function resumenHoy() {
  const hoy = hoyAR()
  const periodo = hoy.slice(0, 7)
  const enUnaSemana = sumarDias(hoy, 7)

  const [pend, sinGenerar, recs, notas, opps, sols, presEnv, mes, mrr, cli] = await Promise.all([
    // Cobros con saldo, con cliente y último aviso
    pool.query(`
      SELECT c.id, c.cliente_id, c.periodo, c.tipo, c.concepto, c.monto, c.moneda, c.vencimiento,
             ${PAGADO} AS pagado, ${ULTIMO_ENVIO} AS ultimo_envio,
             cl.nombre AS cliente_nombre, cl.email AS cliente_email, cl.telefono AS cliente_telefono,
             cl.proyecto AS cliente_proyecto
        FROM cobros c JOIN clientes cl ON cl.id = c.cliente_id
       WHERE c.monto > ${PAGADO}
       ORDER BY (c.vencimiento IS NULL), c.vencimiento, c.periodo`),
    // Clientes activos con abono que todavía no tienen el cobro del mes
    pool.query(`
      SELECT id, nombre, monto_mensual, moneda, dia_cobro FROM clientes cl
       WHERE estado = 'activo' AND monto_mensual > 0
         AND NOT EXISTS (SELECT 1 FROM cobros c WHERE c.cliente_id = cl.id AND c.periodo = $1 AND c.tipo = 'mensual')
       ORDER BY nombre`, [periodo]),
    // Recordatorios propios pendientes (atrasados, hoy, próximos 7 días o sin fecha)
    pool.query(`
      SELECT r.*, cl.nombre AS cliente_nombre FROM recordatorios r
        LEFT JOIN clientes cl ON cl.id = r.cliente_id
       WHERE r.hecho = false AND (r.fecha IS NULL OR r.fecha <= $1)
       ORDER BY (r.fecha IS NULL), r.fecha, r.id`, [enUnaSemana]),
    // Notas de seguimiento con próxima acción
    pool.query(`
      SELECT s.id, s.cliente_id, s.titulo, s.proxima_accion, s.proxima_fecha, cl.nombre AS cliente_nombre
        FROM seguimientos s JOIN clientes cl ON cl.id = s.cliente_id
       WHERE s.completado = false AND s.proxima_fecha IS NOT NULL AND s.proxima_fecha <= $1
       ORDER BY s.proxima_fecha`, [enUnaSemana]),
    // Oportunidades abiertas con próxima acción
    pool.query(`
      SELECT id, nombre, tipo, etapa, proxima_accion, proxima_fecha FROM oportunidades
       WHERE etapa NOT IN ('ganado','perdido','terminado') AND proxima_fecha IS NOT NULL AND proxima_fecha <= $1
       ORDER BY proxima_fecha`, [enUnaSemana]),
    // Solicitudes del configurador web sin atender
    pool.query(`SELECT id, nombre, email, telefono, total, moneda, created_at
                  FROM solicitudes_presupuesto WHERE estado = 'nuevo' ORDER BY created_at DESC`),
    // Presupuestos enviados que el cliente todavía no respondió
    pool.query(`
      SELECT p.id, p.cliente_id, p.titulo, p.sent_at, cl.nombre AS cliente_nombre
        FROM presupuestos p JOIN clientes cl ON cl.id = p.cliente_id
       WHERE p.estado = 'enviado' ORDER BY p.sent_at`),
    // Cobrado / facturado del mes por moneda
    pool.query(`
      SELECT c.moneda, COALESCE(SUM(c.monto),0) AS facturado, COALESCE(SUM(${PAGADO}),0) AS cobrado
        FROM cobros c WHERE c.periodo = $1 GROUP BY c.moneda`, [periodo]),
    // Abonos mensuales de clientes activos por moneda
    pool.query(`SELECT moneda, COALESCE(SUM(monto_mensual),0) AS mrr FROM clientes
                 WHERE estado = 'activo' AND monto_mensual > 0 GROUP BY moneda`),
    pool.query(`SELECT COUNT(*) FILTER (WHERE estado='activo') AS activos, COUNT(*) AS total FROM clientes`),
  ])

  const saldo = (c) => Math.max(Number(c.monto) - Number(c.pagado), 0)
  const vencidos = [], porVencer = [], resto = []
  const porCobrar = {}
  for (const c of pend.rows) {
    c.saldo = saldo(c)
    porCobrar[c.moneda] = (porCobrar[c.moneda] || 0) + c.saldo
    const v = c.vencimiento ? String(c.vencimiento instanceof Date ? c.vencimiento.toISOString() : c.vencimiento).slice(0, 10) : null
    if (v && v < hoy) vencidos.push(c)
    else if (v && v <= enUnaSemana) porVencer.push(c)
    else resto.push(c)
  }
  // Del mes actual, pendientes y sin ningún aviso enviado
  const sinAvisar = resto.filter((c) => c.periodo === periodo && !c.ultimo_envio)

  return {
    hoy, periodo,
    kpis: {
      por_cobrar: porCobrar,
      cobrado_mes: Object.fromEntries(mes.rows.map((r) => [r.moneda, Number(r.cobrado)])),
      facturado_mes: Object.fromEntries(mes.rows.map((r) => [r.moneda, Number(r.facturado)])),
      mrr: Object.fromEntries(mrr.rows.map((r) => [r.moneda, Number(r.mrr)])),
      clientes_activos: Number(cli.rows[0].activos),
      clientes_total: Number(cli.rows[0].total),
    },
    vencidos, por_vencer: porVencer, sin_avisar: sinAvisar,
    pendientes_total: pend.rows.length,
    sin_generar: sinGenerar.rows,
    recordatorios: recs.rows,
    notas: notas.rows,
    oportunidades: opps.rows,
    solicitudes: sols.rows,
    presupuestos_enviados: presEnv.rows,
  }
}

// Versión en texto plano del resumen (para el mail diario).
export function resumenTexto(r) {
  const L = []
  const dinero = (map) => Object.entries(map).filter(([, v]) => v > 0).map(([m, v]) => fmtMoney(v, m)).join(' · ') || '—'
  L.push(`Resumen del ${fmtFecha(r.hoy)}`)
  L.push('')
  L.push(`Por cobrar: ${dinero(r.kpis.por_cobrar)}`)
  L.push(`Cobrado este mes: ${dinero(r.kpis.cobrado_mes)}`)
  L.push('')
  const bloque = (titulo, items, fmt) => {
    if (!items.length) return
    L.push(`${titulo} (${items.length})`)
    for (const it of items) L.push(`  - ${fmt(it)}`)
    L.push('')
  }
  const cobro = (c) => `${c.cliente_nombre}: ${fmtMoney(c.saldo, c.moneda)} · ${periodoLargo(c.periodo)}${c.vencimiento ? ` · vence ${fmtFecha(c.vencimiento)}` : ''}`
  bloque('Cobros vencidos', r.vencidos, cobro)
  bloque('Vencen esta semana', r.por_vencer, cobro)
  bloque('Del mes, todavía sin avisar', r.sin_avisar, cobro)
  bloque(`Falta generar el cobro de ${periodoLargo(r.periodo)}`, r.sin_generar, (c) => `${c.nombre} (${fmtMoney(c.monto_mensual, c.moneda)})`)
  bloque('Recordatorios', r.recordatorios, (x) => `${x.titulo}${x.cliente_nombre ? ` · ${x.cliente_nombre}` : ''}${x.fecha ? ` · ${fmtFecha(x.fecha)}` : ''}`)
  bloque('Seguimientos', r.notas, (n) => `${n.cliente_nombre}: ${n.proxima_accion || n.titulo} · ${fmtFecha(n.proxima_fecha)}`)
  bloque('Oportunidades', r.oportunidades, (o) => `${o.nombre}: ${o.proxima_accion || o.etapa} · ${fmtFecha(o.proxima_fecha)}`)
  bloque('Solicitudes web sin responder', r.solicitudes, (s) => `${s.nombre || 'Sin nombre'} · ${fmtMoney(s.total, s.moneda)}`)
  bloque('Presupuestos esperando respuesta', r.presupuestos_enviados, (p) => `${p.cliente_nombre}: ${p.titulo}`)
  if (L.length <= 5) L.push('Nada pendiente. Todo al día.')
  L.push('')
  L.push('Entrar al panel: https://www.margonsoftware.com/admin')
  return L.join('\n')
}

export const hayPendientes = (r) =>
  r.vencidos.length + r.por_vencer.length + r.sin_avisar.length + r.sin_generar.length +
  r.recordatorios.length + r.notas.length + r.oportunidades.length + r.solicitudes.length +
  r.presupuestos_enviados.length > 0
