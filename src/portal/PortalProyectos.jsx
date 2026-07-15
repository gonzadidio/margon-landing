import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { portalGet } from './portalApi'
import { fmtFecha } from '../admin/format'

const ESTADO = {
  desarrollo: { label: 'En desarrollo', cls: 'ad-pill ad-pill-blue' },
  produccion: { label: 'En producción', cls: 'ad-pill ad-pill-green' },
  finalizado: { label: 'Finalizado', cls: 'ad-pill ad-pill-green' },
  pausado:    { label: 'Pausado', cls: 'ad-pill ad-pill-gray' },
}
const estadoMeta = (e) => ESTADO[e] || { label: e, cls: 'ad-pill ad-pill-gray' }

export default function PortalProyectos() {
  const [proyectos, setProyectos] = useState(null)
  useEffect(() => { portalGet('/proyectos').then(setProyectos).catch(() => setProyectos([])) }, [])

  if (!proyectos) return <p className="ad-muted">Cargando…</p>
  if (proyectos.length === 0) {
    return (
      <div className="ad-card p-10 text-center">
        <p className="ad-ink font-semibold">Todavía no hay proyectos cargados</p>
        <p className="ad-muted text-[13px] mt-1">Acá vas a ver tus proyectos y en qué estado están.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold ad-ink">Tus proyectos</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {proyectos.map((p) => {
          const m = estadoMeta(p.estado)
          return (
            <div key={p.id} className="ad-card p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h2 className="font-semibold ad-ink">{p.nombre}</h2>
                <span className={m.cls}>{m.label}</span>
              </div>
              {p.descripcion && <p className="ad-muted text-[13px] leading-relaxed">{p.descripcion}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span className="ad-faint text-[12px]">
                  {p.fecha_inicio ? `Desde ${fmtFecha(p.fecha_inicio)}` : ''}
                </span>
                {p.deploy_url && (
                  <a href={p.deploy_url} target="_blank" rel="noreferrer"
                    className="ad-btn ad-btn-soft ad-btn-sm">
                    Ver <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
