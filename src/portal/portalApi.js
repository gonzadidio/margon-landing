// Cliente de API del portal de clientes (base /api/portal, token propio).
const TK = 'margon_portal_token'

export const getToken = () => localStorage.getItem(TK)
export const setToken = (t) => localStorage.setItem(TK, t)
export const clearToken = () => localStorage.removeItem(TK)

let onUnauth = () => {}
export const setOnUnauthorized = (fn) => { onUnauth = fn }

async function req(path, opts = {}, auth = true) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (auth) { const t = getToken(); if (t) headers.Authorization = `Bearer ${t}` }
  const res = await fetch(`/api/portal${path}`, { ...opts, headers })
  if (auth && res.status === 401) { clearToken(); onUnauth(); throw new Error('No autorizado') }
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    throw new Error(d.error || `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const portalGet = (p) => req(p, {})
export const portalPost = (p, body) => req(p, { method: 'POST', body: JSON.stringify(body || {}) })
export const portalPatch = (p, body) => req(p, { method: 'PATCH', body: JSON.stringify(body || {}) })

// ---- Público ----
export const getInvite = (token) => req(`/invite/${token}`, {}, false)
export const activar = (token, password) =>
  req('/activar', { method: 'POST', body: JSON.stringify({ token, password }) }, false)
    .then((d) => { setToken(d.token); return d })
export const loginPortal = (email, password) =>
  req('/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false)
    .then((d) => { setToken(d.token); return d })

// ---- Descarga de archivos protegidos ----
export async function portalDownload(path) {
  const t = getToken()
  const res = await fetch(`/api/portal${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} })
  if (res.status === 401) { clearToken(); onUnauth(); throw new Error('No autorizado') }
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.blob()
}
