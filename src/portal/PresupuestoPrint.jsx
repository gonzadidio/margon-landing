import { Printer, X } from 'lucide-react'
import { fmtMoney, fmtFecha } from '../admin/format'

// Documento claro e imprimible del presupuesto (constancia / respaldo en PDF).
export default function PresupuestoPrint({ p, items, clienteNombre, onClose }) {
  const firmado = p.estado === 'aprobado'
  const incluidos = items.filter((i) => i.seleccionado)
  const excluidos = items.filter((i) => !i.seleccionado)
  const total = firmado ? Number(p.firma_total || 0) : incluidos.reduce((s, i) => s + Number(i.costo || 0), 0)

  // Agrupar los incluidos por grupo/fase
  const grupos = []
  for (const it of incluidos) {
    const g = it.grupo || 'Ítems'
    let b = grupos.find((x) => x.g === g)
    if (!b) { b = { g, items: [] }; grupos.push(b) }
    b.items.push(it)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm overflow-auto">
      {/* Barra de acciones (no se imprime) */}
      <div className="no-print sticky top-0 flex items-center justify-end gap-2 px-4 py-3" style={{ background: 'rgba(10,15,13,.92)', borderBottom: '1px solid rgba(16,185,129,.15)' }}>
        <button onClick={() => window.print()} className="ad-btn ad-btn-primary ad-btn-sm"><Printer className="w-4 h-4" /> Imprimir / Guardar PDF</button>
        <button onClick={onClose} className="ad-btn ad-btn-ghost ad-btn-sm"><X className="w-4 h-4" /> Cerrar</button>
      </div>

      {/* Hoja */}
      <div className="flex-1 flex justify-center p-4 sm:p-8">
        <div id="presupuesto-doc" className="bg-white text-zinc-800 w-full max-w-[800px] h-fit rounded-lg shadow-2xl p-10 sm:p-12">
          {/* Encabezado */}
          <div className="flex items-start justify-between border-b-2 border-zinc-800 pb-5">
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-zinc-900 leading-none">MARGON</div>
              <div className="text-[11px] font-semibold tracking-[0.25em] text-emerald-700 mt-1">SOFTWARE HOUSE</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-zinc-900">PRESUPUESTO</div>
              <div className="text-sm text-zinc-500 mt-0.5">N° {String(p.id).padStart(4, '0')}</div>
              <div className="text-sm text-zinc-500">{fmtFecha(p.created_at)}</div>
            </div>
          </div>

          {/* Cliente y título */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Cliente</div>
              <div className="text-base font-semibold text-zinc-900 mt-1">{clienteNombre || p.firma_nombre || '—'}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Proyecto</div>
              <div className="text-base font-semibold text-zinc-900 mt-1">{p.titulo}</div>
            </div>
          </div>
          {p.descripcion && <p className="text-sm text-zinc-500 mt-3 leading-relaxed">{p.descripcion}</p>}

          {/* Detalle de ítems incluidos */}
          <table className="w-full mt-8 text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400">
                <th className="text-left font-semibold uppercase text-[11px] tracking-wide py-2">Detalle</th>
                <th className="text-right font-semibold uppercase text-[11px] tracking-wide py-2">Importe</th>
              </tr>
            </thead>
            <tbody>
              {grupos.flatMap((grp, gi) => [
                grp.g && grupos.length > 1 ? (
                  <tr key={`g${gi}`}>
                    <td colSpan={2} className="pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">{grp.g}</td>
                  </tr>
                ) : null,
                ...grp.items.map((it) => (
                  <tr key={it.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 text-zinc-700">
                      {it.concepto}
                      {it.descripcion && <span className="block text-[12px] text-zinc-400">{it.descripcion}</span>}
                    </td>
                    <td className="py-3 text-right font-medium text-zinc-900 tabular-nums whitespace-nowrap">{fmtMoney(it.costo, p.moneda)}</td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>

          {/* Total */}
          <div className="flex justify-end mt-4">
            <div className="w-72">
              <div className="flex items-center justify-between border-t-2 border-zinc-800 pt-3">
                <span className="font-bold text-zinc-900">TOTAL</span>
                <span className="text-xl font-extrabold text-zinc-900 tabular-nums">{fmtMoney(total, p.moneda)}</span>
              </div>
            </div>
          </div>

          {/* Opcionales no incluidos */}
          {excluidos.length > 0 && (
            <div className="mt-6 text-[12px] text-zinc-500">
              <span className="font-semibold text-zinc-600">Opcionales no incluidos:</span>{' '}
              {excluidos.map((it) => it.concepto).join(' · ')}
            </div>
          )}

          {/* Firma */}
          {firmado ? (
            <div className="mt-8 rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
              <span className="font-semibold">✓ Aprobado y firmado</span> por <b>{p.firma_nombre}</b> el {fmtFecha(p.firma_fecha)}.
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-10">
              <div>
                <div className="border-t border-zinc-300 pt-2 text-[12px] text-zinc-400">Firma del cliente</div>
              </div>
              <div>
                <div className="border-t border-zinc-300 pt-2 text-[12px] text-zinc-400">Aclaración y fecha</div>
              </div>
            </div>
          )}

          {/* Aclaración */}
          <div className="mt-8 rounded-md bg-zinc-50 border border-zinc-200 px-4 py-3 text-[12px] leading-relaxed text-zinc-500">
            <strong className="text-zinc-600">Nota:</strong> Este presupuesto refleja los ítems seleccionados y su valor total. Los valores pueden estar sujetos a actualización según vigencia. No constituye una factura ni comprobante fiscal.
          </div>

          {/* Pie */}
          <div className="mt-8 pt-5 border-t border-zinc-200 flex items-center justify-between text-[12px] text-zinc-400">
            <span>Margon · Software House</span>
            <span>margonsoftware.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}
