import { useEffect, useState } from 'react'
import {
  CreditCard, Send, ArrowDownLeft, ArrowUpRight,
  Bell, Search, Plus, MoreHorizontal
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

const transactions = [
  { name: 'Spotify Premium', amount: '-4.99', type: 'out', icon: '🎵', time: 'Hoy, 14:30' },
  { name: 'Transfer de Juan M.', amount: '+1,250.00', type: 'in', icon: '👤', time: 'Hoy, 11:15' },
  { name: 'Amazon Web Services', amount: '-89.50', type: 'out', icon: '☁️', time: 'Ayer, 09:00' },
  { name: 'Pago cliente #4821', amount: '+3,400.00', type: 'in', icon: '💼', time: 'Ayer, 08:22' },
]

const cards = [
  { type: 'Visa', last4: '4291', balance: '12,847', color: 'from-emerald-500 to-cyan-500' },
  { type: 'Mastercard', last4: '8103', balance: '5,320', color: 'from-violet-500 to-indigo-500' },
]

export default function HeroVisual() {
  const [show, setShow] = useState(false)
  const [activeCard, setActiveCard] = useState(0)

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
            <span className="text-[13px] font-semibold text-white">MarGon Pay</span>
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

        {/* Balance */}
        <div className="px-5 pt-5 pb-4">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Balance total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">$<CountUp end={18167} duration={2500} /></span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight size={11} />
              +8.2%
            </span>
          </div>
        </div>

        {/* Cards carousel */}
        <div className="px-5 pb-4">
          <div className="flex gap-3">
            {cards.map((card, i) => (
              <button
                key={card.last4}
                onClick={() => setActiveCard(i)}
                className={`flex-1 rounded-xl p-3.5 bg-gradient-to-br ${card.color} transition-all duration-300 ${activeCard === i ? 'opacity-100 scale-100 shadow-lg' : 'opacity-40 scale-[0.97]'}`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="text-[9px] font-bold text-white/80 uppercase tracking-wider">{card.type}</div>
                  <MoreHorizontal size={14} className="text-white/50" />
                </div>
                <div className="text-[11px] text-white/60 font-mono tracking-widest mb-1">•••• {card.last4}</div>
                <div className="text-sm font-bold text-white">${card.balance}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex justify-center gap-6 px-5 pb-4">
          {[
            { icon: Send, label: 'Enviar' },
            { icon: ArrowDownLeft, label: 'Recibir' },
            { icon: CreditCard, label: 'Tarjetas' },
            { icon: Plus, label: 'Más' },
          ].map((a) => (
            <div key={a.label} className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center">
                <a.icon size={15} className="text-emerald-400/80" />
              </div>
              <span className="text-[9px] text-white/30">{a.label}</span>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div className="border-t border-white/[0.06]">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-[11px] font-medium text-white/40">Movimientos recientes</span>
            <span className="text-[10px] text-emerald-400/60">Ver todo</span>
          </div>
          <div className="pb-2">
            {transactions.map((tx, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.02] transition-colors"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-sm">
                    {tx.icon}
                  </div>
                  <div>
                    <p className="text-[12px] text-white/70 font-medium">{tx.name}</p>
                    <p className="text-[10px] text-white/20">{tx.time}</p>
                  </div>
                </div>
                <span className={`text-[12px] font-semibold ${tx.type === 'in' ? 'text-emerald-400' : 'text-white/50'}`}>
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div
        className="absolute -top-3 -right-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-[#0c1210]/90 backdrop-blur-md px-3 py-2 shadow-xl shadow-black/30 animate-float"
        style={{ animationDuration: '5s' }}
      >
        <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center text-[10px]">✓</div>
        <div>
          <div className="text-[10px] font-semibold text-white">Pago recibido</div>
          <div className="text-[8px] text-white/25">+$3,400.00</div>
        </div>
      </div>
    </div>
  )
}
