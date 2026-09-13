import { useState } from 'react'
import { login } from './api'
import { Btn, ErrorMsg } from './ui'
import Logo from '../components/Logo'

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(password); onSuccess() }
    catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="ad-app flex items-center justify-center px-4 font-sans">
      <form onSubmit={handleSubmit} className="ad-card w-full max-w-sm p-8 space-y-6">
        <div className="flex flex-col items-center text-center gap-3">
          <Logo src="/logo.png" alt="Margon" className="h-11 w-auto" />
          <div>
            <h1 className="text-lg font-bold ad-ink">Panel de Margon</h1>
            <p className="text-sm ad-muted mt-1">Clientes, cobros y recordatorios</p>
          </div>
        </div>
        <label className="block space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide ad-muted">Contraseña</span>
          <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className="ad-input" placeholder="••••••••" />
        </label>
        <ErrorMsg>{error}</ErrorMsg>
        <Btn type="submit" variant="primary" loading={loading} disabled={!password} className="w-full py-2.5">Entrar</Btn>
      </form>
    </div>
  )
}
