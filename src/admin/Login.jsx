import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { login } from './api'

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(password)
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0f0d] text-surface-200 font-sans px-4">
      <div className="hero-glow absolute inset-0" />
      <form
        onSubmit={handleSubmit}
        className="glass glow relative z-10 w-full max-w-sm rounded-2xl p-8 space-y-6"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="grid place-items-center w-12 h-12 rounded-xl bg-primary-500/10 ring-1 ring-primary-500/20">
            <Lock className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Margon · Panel interno</h1>
            <p className="text-sm text-surface-200/60 mt-1">Acceso restringido</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide text-surface-200/50">
            Contraseña
          </label>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-surface-900/60 border border-primary-500/15 px-4 py-2.5 text-white outline-none focus:border-primary-400/50 focus:ring-1 focus:ring-primary-400/30 transition"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0f0d] font-semibold py-2.5 transition"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Entrar
        </button>
      </form>
    </div>
  )
}
