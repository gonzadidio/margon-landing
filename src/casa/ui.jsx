import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'

export function Kpi({ label, value, sub, accent, children }) {
  return (
    <div className={`lt-kpi${accent ? ' lt-kpi-accent' : ''}`}>
      <span className="lt-eyebrow">{label}</span>
      <span className="lt-kpi-v">{value}</span>
      {sub && <span className="lt-kpi-s">{sub}</span>}
      {children}
    </div>
  )
}

export function Field({ label, className = '', children }) {
  return <label className={`lt-field ${className}`}>{label}{children}</label>
}

// Input numérico que edita un campo de la config y guarda con pausa.
export function NumInput({ id, value, onChange, step = 'any', placeholder }) {
  return (
    <input
      id={id} className="lt-input lt-num" type="number" inputMode="decimal" step={step}
      value={value ?? ''} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
    />
  )
}

export function Pill({ tone = 'ok', children }) {
  return <span className={`lt-pill lt-pill-${tone}`}>{children}</span>
}

// Borrar en dos toques: el primero pide confirmación, el segundo borra.
export function BorrarBtn({ onConfirm, label = 'Borrar' }) {
  const [armado, setArmado] = useState(false)
  const t = useRef()
  useEffect(() => () => clearTimeout(t.current), [])
  if (armado) {
    return <button type="button" className="lt-icon is-danger" onClick={() => { setArmado(false); onConfirm() }}>¿Borrar?</button>
  }
  return (
    <button type="button" className="lt-icon" aria-label={label} title={label}
      onClick={() => { setArmado(true); t.current = setTimeout(() => setArmado(false), 3000) }}>
      <Trash2 size={16} />
    </button>
  )
}

// ---------- Toast ----------
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const t = useRef()
  const show = useCallback((msg, error = false) => {
    clearTimeout(t.current)
    setToast({ msg, error })
    t.current = setTimeout(() => setToast(null), error ? 5000 : 2200)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && <div role="status" className={`lt-toast${toast.error ? ' is-error' : ''}`}>{toast.msg}</div>}
    </ToastCtx.Provider>
  )
}
