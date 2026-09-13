// Primitivas de UI del panel. Todo lo visual sale de acá para que las
// pantallas queden cortas y consistentes.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { iniciales, fmtMoneyMap } from './format'

export const Spinner = ({ className = '' }) => <Loader2 className={`w-4 h-4 animate-spin ${className}`} />

export const Cargando = ({ texto = 'Cargando…' }) => (
  <div className="flex items-center gap-2 ad-muted text-sm py-16 justify-center"><Spinner /> {texto}</div>
)

export const ErrorMsg = ({ children }) => (children
  ? <p className="text-[13px] text-red-400 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {children}</p>
  : null)

export function Pill({ tone = 'gray', children, className = '' }) {
  return <span className={`ad-pill ad-pill-${tone} ${className}`}>{children}</span>
}

export function Btn({ variant = 'ghost', size, icon: Icon, loading, children, className = '', ...props }) {
  return (
    <button type="button" {...props} disabled={props.disabled || loading}
      className={`ad-btn ad-btn-${variant} ${size === 'sm' ? 'ad-btn-sm' : ''} ${className}`}>
      {loading ? <Spinner /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </button>
  )
}

// Botón sólo ícono (acciones de fila)
export function IconBtn({ icon: Icon, title, tone = '', className = '', ...props }) {
  return (
    <button type="button" title={title} aria-label={title} {...props}
      className={`ad-iconbtn ${tone ? `ad-iconbtn-${tone}` : ''} ${className}`}>
      <Icon className="w-4 h-4" />
    </button>
  )
}

export function Modal({ title, subtitle, onClose, children, footer, width = 'max-w-lg' }) {
  useEffect(() => {
    const f = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', f)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', f); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="ad-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className={`ad-card w-full ${width} max-h-[92vh] flex flex-col`} role="dialog" aria-modal="true">
        <div className="flex items-start gap-3 px-5 pt-4 pb-3 border-b ad-line">
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-bold ad-ink leading-tight">{title}</h2>
            {subtitle && <p className="text-xs ad-muted mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="ad-iconbtn -mr-1" aria-label="Cerrar"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 py-3 border-t ad-line flex items-center justify-end gap-2 flex-wrap">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, hint, full, children, className = '' }) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''} ${className}`}>
      <span className="block text-[11px] font-semibold uppercase tracking-wide ad-muted mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] ad-faint mt-1">{hint}</span>}
    </label>
  )
}

export function Card({ title, extra, children, className = '', flush }) {
  return (
    <section className={`ad-card ${className}`}>
      {(title || extra) && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b ad-line">
          <h3 className="text-[13px] font-bold ad-ink">{title}</h3>
          {extra}
        </div>
      )}
      <div className={flush ? '' : 'p-4'}>{children}</div>
    </section>
  )
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="text-center py-10 px-4">
      {Icon && <Icon className="w-7 h-7 mx-auto ad-faint" />}
      <p className="text-sm font-semibold ad-ink mt-3">{title}</p>
      {text && <p className="text-[13px] ad-muted mt-1 max-w-sm mx-auto">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Avatar({ nombre, size = 'md', tone = 'green' }) {
  const s = size === 'lg' ? 'w-14 h-14 text-lg rounded-2xl' : size === 'sm' ? 'w-7 h-7 text-[10px] rounded-lg' : 'w-9 h-9 text-xs rounded-lg'
  const t = tone === 'green' ? 'bg-primary-500/15 text-primary-300' : 'bg-white/5 ad-muted'
  return <div className={`${s} ${t} grid place-items-center font-bold shrink-0`}>{iniciales(nombre)}</div>
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-1 border-b ad-line overflow-x-auto -mx-1 px-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`px-3.5 py-2.5 text-[13px] font-semibold border-b-2 -mb-px whitespace-nowrap transition flex items-center gap-1.5 ${
            value === t.id ? 'text-primary-300 border-primary-500' : 'ad-muted border-transparent hover:text-white'}`}>
          {t.label}
          {t.count > 0 && <span className={`text-[10px] px-1.5 py-px rounded-full ${value === t.id ? 'bg-primary-500/20' : 'bg-white/8'}`}>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Kpi({ label, value, tone = '', icon: Icon, hint }) {
  const val = tone === 'amber' ? 'text-amber-300' : tone === 'green' ? 'text-primary-300' : tone === 'red' ? 'text-red-300' : 'ad-ink'
  return (
    <div className="ad-card p-4 min-w-0">
      <div className="flex items-center gap-1.5 ad-muted text-[11.5px] font-medium">{Icon && <Icon className="w-3.5 h-3.5" />} {label}</div>
      <p className={`text-lg lg:text-[22px] font-extrabold mt-1.5 tabular-nums tracking-tight leading-tight break-words ${val}`}>{value}</p>
      {hint && <p className="text-[11px] ad-faint mt-1">{hint}</p>}
    </div>
  )
}

export const Money = ({ map }) => <>{fmtMoneyMap(map)}</>

// Segmento (toggle de opciones)
export function Segment({ options, value, onChange, size }) {
  return (
    <div className="inline-flex p-0.5 rounded-lg bg-white/5 ring-1 ad-line">
      {options.map((o) => (
        <button key={o.v} type="button" onClick={() => !o.disabled && onChange(o.v)} disabled={o.disabled}
          className={`px-3 ${size === 'sm' ? 'py-1 text-[12px]' : 'py-1.5 text-[13px]'} rounded-md font-semibold transition flex items-center gap-1.5 disabled:opacity-40 ${
            value === o.v ? 'bg-primary-500/20 text-primary-200' : 'ad-muted hover:text-white'}`}>
          {o.icon && <o.icon className="w-3.5 h-3.5" />}{o.label}
        </button>
      ))}
    </div>
  )
}

// ---------- Toasts ----------
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const toast = useCallback((texto, tone = 'ok') => {
    const id = Date.now() + Math.random()
    setItems((xs) => [...xs, { id, texto, tone }])
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3500)
  }, [])
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] flex flex-col gap-2 items-center pointer-events-none px-4">
        {items.map((t) => (
          <div key={t.id} className={`ad-toast ${t.tone === 'error' ? 'ad-toast-error' : ''}`}>
            {t.tone === 'error' ? <AlertCircle className="w-4 h-4 text-red-300" /> : <CheckCircle2 className="w-4 h-4 text-primary-300" />}
            {t.texto}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

// Hook chiquito para cargar datos con estado de carga/error.
export function useCarga(fn, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const recargar = useCallback((silencioso = true) => {
    if (!silencioso) setLoading(true)
    return fn().then((d) => { setData(d); setError('') }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { recargar(false) }, [recargar])
  return { data, error, loading, recargar, setData }
}
