import { X, Pencil, Trash2, Github, ExternalLink, Calendar, Layers, Wallet } from 'lucide-react'
import { fmtMoney, fmtFecha } from './format'

const PROY_LBL = { propuesta: 'Propuesta', desarrollo: 'Desarrollo', produccion: 'Producción', mantenimiento: 'Mantenimiento', pausado: 'Pausado', finalizado: 'Finalizado' }
const PROY_PILL = { produccion: 'ad-pill-green', finalizado: 'ad-pill-green', desarrollo: 'ad-pill-blue', mantenimiento: 'ad-pill-violet', pausado: 'ad-pill-gray', propuesta: 'ad-pill-amber' }

export default function ProyectoDetalle({ proyecto: p, onClose, onEdit, onEliminar }) {
  return (
    <div className="ad-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="ad-card w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="border-b ad-line px-6 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold ad-ink truncate">{p.nombre}</h3>
              <span className={`ad-pill ${PROY_PILL[p.estado] || 'ad-pill-gray'}`}>{PROY_LBL[p.estado] || p.estado}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 ad-muted shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {p.descripcion && <p className="text-sm ad-muted leading-relaxed whitespace-pre-wrap">{p.descripcion}</p>}

          <div className="grid sm:grid-cols-2 gap-3">
            <Info icon={Layers} label="Stack" value={p.stack || '—'} />
            <Info icon={Wallet} label="Monto" value={Number(p.monto) > 0 ? fmtMoney(p.monto, p.moneda) : '—'} />
            <Info icon={Calendar} label="Inicio" value={p.fecha_inicio ? fmtFecha(p.fecha_inicio) : '—'} />
            <Info icon={Calendar} label="Fin" value={p.fecha_fin ? fmtFecha(p.fecha_fin) : '—'} />
          </div>

          {/* Links */}
          {(p.repo_url || p.deploy_url) && (
            <div className="flex flex-wrap gap-2">
              {p.deploy_url && <a href={p.deploy_url} target="_blank" rel="noreferrer" className="ad-btn ad-btn-soft ad-btn-sm"><ExternalLink className="w-4 h-4" /> Ver en vivo</a>}
              {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="ad-btn ad-btn-ghost ad-btn-sm"><Github className="w-4 h-4" /> Repositorio</a>}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="border-t ad-line px-6 py-3.5 flex items-center justify-between gap-2">
          <button onClick={() => onEliminar(p)} className="ad-btn ad-btn-ghost ad-btn-sm !text-red-300 hover:!bg-red-500/10"><Trash2 className="w-4 h-4" /> Eliminar</button>
          <button onClick={() => onEdit(p)} className="ad-btn ad-btn-primary ad-btn-sm"><Pencil className="w-4 h-4" /> Editar</button>
        </div>
      </div>
    </div>
  )
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl ad-line border p-3 bg-white/[0.015]">
      <p className="text-[11px] uppercase tracking-wide ad-faint flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" /> {label}</p>
      <p className="text-sm ad-ink mt-1 font-medium break-words">{value}</p>
    </div>
  )
}
