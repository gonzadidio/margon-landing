import { useState, useEffect } from 'react'
import { Download, FileText } from 'lucide-react'
import { portalGet, portalDownload } from './portalApi'
import { fmtFecha } from '../admin/format'

const CAT = {
  contrato: 'Contrato', factura: 'Factura', comprobante: 'Comprobante',
  informe: 'Informe', presupuesto: 'Presupuesto', otro: 'Documento',
}
function tamano(b) {
  if (!b) return ''
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

export default function PortalArchivos() {
  const [archivos, setArchivos] = useState(null)
  const [bajando, setBajando] = useState(null)

  useEffect(() => { portalGet('/archivos').then(setArchivos).catch(() => setArchivos([])) }, [])

  async function descargar(a) {
    setBajando(a.id)
    try {
      const blob = await portalDownload(`/archivos/${a.id}`)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch { /* noop */ } finally { setBajando(null) }
  }

  if (!archivos) return <p className="ad-muted">Cargando…</p>
  if (archivos.length === 0) {
    return (
      <div className="ad-card p-10 text-center">
        <p className="ad-ink font-semibold">Todavía no hay archivos</p>
        <p className="ad-muted text-[13px] mt-1">Contratos, facturas, informes y acuerdos van a aparecer acá.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold ad-ink">Archivos y acuerdos</h1>
      <div className="ad-card divide-y divide-white/5">
        {archivos.map((a) => (
          <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: 'rgba(255,255,255,.04)' }}>
              <FileText className="h-5 w-5 ad-muted" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm ad-ink">{a.nombre}</p>
              <p className="ad-faint text-[12px]">
                {CAT[a.categoria] || 'Documento'} · {fmtFecha(a.created_at)}{a.tamano ? ` · ${tamano(a.tamano)}` : ''}
              </p>
            </div>
            <button onClick={() => descargar(a)} disabled={bajando === a.id}
              className="ad-btn ad-btn-ghost ad-btn-sm shrink-0">
              <Download className="h-4 w-4" /> {bajando === a.id ? '…' : 'Abrir'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
