import { useEffect, useState } from 'react'
import {
  Bell, Search, Plus, MoreHorizontal, FolderKanban, UserPlus,
  CheckSquare, TrendingUp, ArrowUpRight,
} from 'lucide-react'

function CountUp({ end, decimals = 0, duration = 2000 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const inc = end / (duration / 16)
    const timer = setInterval(() => {
      start += inc
      if (start >= end) { setVal(end); clearInterval(timer) }
      else setVal(decimals ? parseFloat(start.toFixed(decimals)) : Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, decimals])
  return decimals ? val.toFixed(decimals) : val
}

// Resumen por estado (las "tarjetas" de arriba)
const stats = [
  { label: 'En desarrollo', value: 5, color: 'from-emerald-500 to-cyan-500' },
  { label: 'En producción', value: 7, color: 'from-violet-500 to-indigo-500' },
]

// Actividad reciente: proyectos con su estado
const proyectos = [
  { name: 'Punto Bella Vista', cat: 'Concesionaria', estado: 'Producción', color: 'emerald', icon: '🚗' },
  { name: 'HandProX', cat: 'SaaS Deportivo', estado: 'Desarrollo', color: 'sky', icon: '🏆' },
  { name: 'Fleur & Co', cat: 'E-Commerce', estado: 'Entregado', color: 'violet', icon: '🌸' },
  { name: 'Celebria', cat: 'Invitaciones', estado: 'Propuesta', color: 'amber', icon: '💌' },
]

const PILL = {
  emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20',
  sky: 'bg-sky-500/15 text-sky-300 ring-sky-500/20',
  violet: 'bg-violet-500/15 text-violet-300 ring-violet-500/20',
  amber: 'bg-amber-500/15 text-amber-300 ring-amber-500/20',
}

export default function HeroVisual() {
  const [show, setShow] = useState(false)
  const [activeStat, setActiveStat] = useState(0)

  useEffect(() => { setTimeout(() => setShow(true), 300) }, [])

  return (
    <div className={`relative w-full max-w-[480px] mx-auto transition-all duration-1000 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Glow */}
      <div className="absolute -inset-10 bg-emerald-500/[0.03] blur-[60px] rounded-full" />

      {/* App frame */}
      <div className="relative rounded-2xl border border-white/[0.07] bg-[#0c1210]/90 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-[#0c1210]">M</div>
            <span className="text-[13px] font-semibold text-white">Margon CRM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <Search size={13} className="text-white/30" />
            </div>
            <div className="relative w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <Bell size={13} className="text-white/30" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* KPI principal */}
        <div className="px-5 pt-5 pb-4">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Proyectos activos</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white"><CountUp end={12} duration={1800} /></span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight size={11} />
              +2 este mes
            </span>
          </div>
        </div>

        {/* Tarjetas de estado */}
        <div className="px-5 pb-4">
          <div className="flex gap-3">
            {stats.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setActiveStat(i)}
                className={`flex-1 rounded-xl p-3.5 bg-gradient-to-br ${s.color} text-left transition-all duration-300 ${activeStat === i ? 'opacity-100 scale-100 shadow-lg' : 'opacity-40 scale-[0.97]'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <FolderKanban size={15} className="text-white/80" />
                  <MoreHorizontal size={14} className="text-white/50" />
                </div>
                <div className="text-2xl font-bold text-white leading-none">{s.value}</div>
                <div className="text-[10px] text-white/70 mt-1">{s.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="flex justify-center gap-6 px-5 pb-4">
          {[
            { icon: FolderKanban, label: 'Proyecto' },
            { icon: UserPlus, label: 'Cliente' },
            { icon: CheckSquare, label: 'Tarea' },
            { icon: TrendingUp, label: 'Reportes' },
          ].map((a) => (
            <div key={a.label} className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center">
                <a.icon size={15} className="text-emerald-400/80" />
              </div>
              <span className="text-[9px] text-white/30">{a.label}</span>
            </div>
          ))}
        </div>

        {/* Actividad reciente */}
        <div className="border-t border-white/[0.06]">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-[11px] font-medium text-white/40">Proyectos recientes</span>
            <span className="text-[10px] text-emerald-400/60">Ver todo</span>
          </div>
          <div className="pb-2">
            {proyectos.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-sm">
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-[12px] text-white/70 font-medium">{p.name}</p>
                    <p className="text-[10px] text-white/20">{p.cat}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ring-1 ${PILL[p.color]}`}>
                  {p.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notificación flotante */}
      <div
        className="absolute -top-3 -right-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-[#0c1210]/90 backdrop-blur-md px-3 py-2 shadow-xl shadow-black/30 animate-float"
        style={{ animationDuration: '5s' }}
      >
        <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center text-[10px]">✓</div>
        <div>
          <div className="text-[10px] font-semibold text-white">Proyecto entregado</div>
          <div className="text-[8px] text-white/25">HandProX v2.0</div>
        </div>
      </div>
    </div>
  )
}
