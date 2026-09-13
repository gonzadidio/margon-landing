const TOKEN_KEY = 'margon_admin_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// Se dispara cuando una llamada devuelve 401, para que AdminApp vuelva al login.
let onUnauthorized = () => {}
export const setOnUnauthorized = (fn) => { onUnauthorized = fn }

async function manejar(res) {
  if (res.status === 401) {
    clearToken()
    onUnauthorized()
    throw new Error('No autorizado')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Error ${res.status}`)
  }
  return res
}

const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Query string a partir de un objeto (omite vacíos).
export function qs(params = {}) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') p.set(k, v)
  const s = p.toString()
  return s ? `?${s}` : ''
}

export async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...authHeaders(), ...(opts.headers || {}) }
  const res = await manejar(await fetch(`/api${path}`, { ...opts, headers }))
  if (res.status === 204) return null
  return res.json()
}
export const apiGet = (path, params) => apiFetch(`${path}${qs(params)}`)
export const apiPost = (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body || {}) })
export const apiPut = (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body || {}) })
export const apiDelete = (path) => apiFetch(path, { method: 'DELETE' })

// Subida multipart (FormData). El browser pone el Content-Type con el boundary.
export async function apiUpload(path, formData) {
  const res = await manejar(await fetch(`/api${path}`, { method: 'POST', headers: authHeaders(), body: formData }))
  return res.json()
}

// Descarga con auth: devuelve un Blob.
export async function apiDownload(path) {
  const res = await manejar(await fetch(`/api${path}`, { headers: authHeaders() }))
  return res.blob()
}

// Abre un archivo protegido en una pestaña nueva (evita el bloqueo de popups
// abriendo la pestaña antes de esperar la descarga).
export async function abrirEnPestana(path) {
  const w = window.open('', '_blank')
  try {
    const blob = await apiDownload(path)
    const url = URL.createObjectURL(blob)
    if (w) w.location = url; else window.open(url, '_blank')
  } catch (e) {
    if (w) w.close()
    throw e
  }
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
