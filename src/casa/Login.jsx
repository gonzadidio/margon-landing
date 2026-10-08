import { useState } from 'react'
import { login } from './casaApi'
import { Field } from './ui'

export default function Login({ onOk }) {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try { await login(usuario, password); onOk() } catch (err) { setError(err.message) } finally { setCargando(false) }
  }

  return (
    <div className="lt-login">
      <div className="lt-login-art">
        <div className="lt-hero-ripple" aria-hidden="true" />
        <span className="lt-eyebrow" style={{ color: 'rgba(255,255,255,.8)' }}>Lote 137 · Openn Pilar</span>
        <div>
          <h1 className="lt-h1">Nuestro<br />hogar</h1>
          <p style={{ margin: '16px 0 0', maxWidth: '34ch', fontSize: 19, lineHeight: 1.45 }}>Gonza &amp; Martina. Un terreno, 180 m² por construir y un plan para llegar.</p>
        </div>
        <span className="lt-eyebrow" style={{ color: 'rgba(255,255,255,.8)', letterSpacing: '.3em' }}>Cada cuota es un ladrillo</span>
      </div>
      <div className="lt-login-form">
        <form onSubmit={enviar}>
          <div><span className="lt-eyebrow">Bienvenidos</span><h2 className="lt-h2" style={{ marginTop: 4 }}>Pasá, estás en casa</h2></div>
          <Field label="Usuario">
            <input id="lt-usuario" className="lt-input" autoComplete="username" autoCapitalize="none" required
              value={usuario} onChange={(e) => setUsuario(e.target.value)} />
          </Field>
          <Field label="Contraseña">
            <input id="lt-password" className="lt-input" type="password" autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <div className="lt-error" role="alert">{error}</div>}
          <button className="lt-btn" type="submit" disabled={cargando}>{cargando ? 'Abriendo…' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  )
}
