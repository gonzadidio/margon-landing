import { useEffect, useState } from 'react'
import { getToken, clearToken, setOnUnauthorized } from './api'
import Login from './Login'
import Dashboard from './Dashboard'

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => !!getToken())

  useEffect(() => {
    // Si cualquier llamada devuelve 401, volvemos al login.
    setOnUnauthorized(() => setAuthed(false))
  }, [])

  function logout() {
    clearToken()
    setAuthed(false)
  }

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />
  return <Dashboard onLogout={logout} />
}
