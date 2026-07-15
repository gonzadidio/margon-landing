import { useState, useEffect } from 'react'
import { getToken, clearToken, setOnUnauthorized } from './portalApi'
import PortalAuth from './PortalAuth'
import PortalShell from './PortalShell'

export default function PortalApp() {
  const [authed, setAuthed] = useState(() => !!getToken())

  useEffect(() => { setOnUnauthorized(() => setAuthed(false)) }, [])

  const path = window.location.pathname
  const params = new URLSearchParams(window.location.search)
  const activarToken = path.startsWith('/portal/activar') ? params.get('token') : null

  function logout() {
    clearToken()
    setAuthed(false)
    window.history.pushState({}, '', '/portal')
  }

  // Link de activación (crear contraseña) — tiene prioridad
  if (activarToken && !authed) {
    return (
      <PortalAuth
        activarToken={activarToken}
        onSuccess={() => { window.history.replaceState({}, '', '/portal'); setAuthed(true) }}
      />
    )
  }
  if (!authed) return <PortalAuth onSuccess={() => setAuthed(true)} />
  return <PortalShell onLogout={logout} />
}
