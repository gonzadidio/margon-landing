// Cliente de API de /casa (base /api/casa, token propio).
const TK = 'margon_casa_token'

export const getToken = () => localStorage.getItem(TK)
export const setToken = (t) => localStorage.setItem(TK, t)
export const clearToken = () => localStorage.removeItem(TK)

let onUnauth = () => {}
export const setOnUnauthorized = (fn) => { onUnauth = fn }

async function req(path, opts = {}, auth = true) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (auth) { const t = getToken(); if (t) headers.Authorization = `Bearer ${t}` }
  const res = await fetch(`/api/casa${path}`, { ...opts, headers })
  if (auth && res.status === 401) { clearToken(); onUnauth(); throw new Error('Tu sesión venció. Volvé a entrar.') }
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    throw new Error(d.error || `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

const body = (method, b) => ({ method, body: JSON.stringify(b || {}) })

export const login = (usuario, password) =>
  req('/login', body('POST', { usuario, password }), false).then((d) => { setToken(d.token); return d })

export const getEstado = () => req('/estado')
export const guardarConfig = (datos) => req('/config', body('PUT', { datos }))
export const crearMovimiento = (m) => req('/movimientos', body('POST', m))
export const editarMovimiento = (id, m) => req(`/movimientos/${id}`, body('PUT', m))
export const borrarMovimiento = (id) => req(`/movimientos/${id}`, { method: 'DELETE' })
export const marcarCuota = (n, extra) => req(`/cuotas/${n}`, body('POST', extra))
export const desmarcarCuota = (n) => req(`/cuotas/${n}`, { method: 'DELETE' })
export const crearFlujo = (f) => req('/flujo', body('POST', f))
export const editarFlujo = (id, f) => req(`/flujo/${id}`, body('PUT', f))
export const borrarFlujo = (id) => req(`/flujo/${id}`, { method: 'DELETE' })
export const crearPorCobrar = (p) => req('/por-cobrar', body('POST', p))
export const editarPorCobrar = (id, p) => req(`/por-cobrar/${id}`, body('PUT', p))
export const marcarCobrado = (id, cobrado) => req(`/por-cobrar/${id}/cobrado`, body('PATCH', { cobrado }))
export const borrarPorCobrar = (id) => req(`/por-cobrar/${id}`, { method: 'DELETE' })
