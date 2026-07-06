const TOKEN_KEY = 'margon_admin_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// Se dispara cuando una llamada devuelve 401, para que AdminApp vuelva al login.
let onUnauthorized = () => {}
export const setOnUnauthorized = (fn) => { onUnauthorized = fn }

export async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, { ...opts, headers })

  if (res.status === 401) {
    clearToken()
    onUnauthorized()
    throw new Error('No autorizado')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// Subida multipart (FormData). No seteamos Content-Type: lo pone el browser con el boundary.
export async function apiUpload(path, formData) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, { method: 'POST', headers, body: formData })
  if (res.status === 401) { clearToken(); onUnauthorized(); throw new Error('No autorizado') }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Error ${res.status}`)
  }
  return res.json()
}

// Descarga con auth: devuelve un Blob (para archivos protegidos por token).
export async function apiDownload(path) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, { headers })
  if (res.status === 401) { clearToken(); onUnauthorized(); throw new Error('No autorizado') }
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.blob()
}

export async function login(password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'No se pudo iniciar sesión')
  }
  const { token } = await res.json()
  setToken(token)
  return token
}
