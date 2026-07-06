import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { login } from './api'

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
          <div className="grid place-items-center w-12 h-12 rounded-xl bg-primary-50 ring-1 ring-primary-200">
            <Lock className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold ad-ink">Margon · Panel interno</h1>
            <p className="text-sm ad-muted mt-1">Acceso restringido</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide ad-muted">Contraseña</label>
          <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className="ad-input" placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading || !password} className="ad-btn ad-btn-primary w-full py-2.5">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} Entrar
        </button>
      </form>
    </div>
  )
}
