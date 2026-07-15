import { useState, useEffect } from 'react'
import Logo from '../components/Logo'
import { getInvite, activar, loginPortal } from './portalApi'

export default function PortalAuth({ activarToken, onSuccess }) {
  return (
    <div className="ad-app flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <Logo src="/logo.png" alt="Margon" className="h-11 w-auto" />
          <p className="ad-muted text-sm">Portal de clientes</p>
        </div>
        {activarToken
          ? <Activar token={activarToken} onSuccess={onSuccess} />
          : <LoginForm onSuccess={onSuccess} />}
      </div>
    </div>
  )
}

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try { await loginPortal(email, password); onSuccess() }
    catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="ad-card p-6 space-y-4">
      <h1 className="text-lg font-bold ad-ink">Ingresá a tu portal</h1>
      <div>
        <label className="ad-muted mb-1.5 block text-[12px] font-medium">Email</label>
        <input type="email" className="ad-input" value={email} autoFocus
          onChange={(e) => setEmail(e.target.value)} placeholder="tu-correo@empresa.com" />
      </div>
      <div>
        <label className="ad-muted mb-1.5 block text-[12px] font-medium">Contraseña</label>
        <input type="password" className="ad-input" value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {err && <p className="text-[13px] text-red-400">{err}</p>}
      <button type="submit" disabled={loading} className="ad-btn ad-btn-primary w-full">
        {loading ? 'Entrando…' : 'Ingresar'}
      </button>
      <p className="ad-faint text-center text-[12px]">
        ¿No tenés acceso todavía? Pedile a Margon el link para crear tu contraseña.
      </p>
    </form>
  )
}

function Activar({ token, onSuccess }) {
  const [info, setInfo] = useState(null)
  const [invalid, setInvalid] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getInvite(token).then(setInfo).catch((e) => setInvalid(e.message))
  }, [token])

  async function submit(e) {
    e.preventDefault()
    setErr('')
    if (password.length < 8) return setErr('La contraseña debe tener al menos 8 caracteres.')
    if (password !== confirmar) return setErr('Las contraseñas no coinciden.')
    setLoading(true)
    try { await activar(token, password); onSuccess() }
    catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  if (invalid) {
    return (
      <div className="ad-card p-6 text-center space-y-2">
        <p className="ad-ink font-semibold">Link no válido</p>
        <p className="ad-muted text-[13px]">{invalid}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="ad-card p-6 space-y-4">
      <div>
        <h1 className="text-lg font-bold ad-ink">Creá tu contraseña</h1>
        {info && <p className="ad-muted text-[13px] mt-1">¡Hola, {info.nombre}! Definí una contraseña para entrar a tu portal.</p>}
      </div>
      <div>
        <label className="ad-muted mb-1.5 block text-[12px] font-medium">Contraseña</label>
        <input type="password" className="ad-input" value={password} autoFocus
          onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
      </div>
      <div>
        <label className="ad-muted mb-1.5 block text-[12px] font-medium">Repetir contraseña</label>
        <input type="password" className="ad-input" value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)} placeholder="••••••••" />
      </div>
      {err && <p className="text-[13px] text-red-400">{err}</p>}
      <button type="submit" disabled={loading || !info} className="ad-btn ad-btn-primary w-full">
        {loading ? 'Creando…' : 'Crear contraseña y entrar'}
      </button>
    </form>
  )
}
