// Cliente de API de /tele (base /api/tele, token propio).
const TK = 'margon_tele_token'

export const getToken = () => localStorage.getItem(TK)
export const setToken = (t) => localStorage.setItem(TK, t)
export const clearToken = () => localStorage.removeItem(TK)

let onUnauth = () => {}
export const setOnUnauthorized = (fn) => { onUnauth = fn }

async function req(path, opts = {}, auth = true) {
  const headers = { ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(opts.headers || {}) }
  if (auth) { const t = getToken(); if (t) headers.Authorization = `Bearer ${t}` }
  const res = await fetch(`/api/tele${path}`, { ...opts, headers })
  if (auth && res.status === 401) { clearToken(); onUnauth(); throw new Error('Tu sesión venció. Volvé a entrar.') }
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    throw new Error(d.error || `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return opts.blob ? res.blob() : res.json()
}

const body = (method, b) => ({ method, body: JSON.stringify(b || {}) })

export const login = (usuario, password) =>
  req('/login', body('POST', { usuario, password }), false).then((d) => { setToken(d.token); return d })

export const getEstado = () => req('/estado')
export const guardarConfig = (datos) => req('/config', body('PUT', { datos }))
export const editarFoto = (id, f) => req(`/fotos/${id}`, body('PATCH', f))
export const borrarFoto = (id) => req(`/fotos/${id}`, { method: 'DELETE' })
export const ordenar = (tipo, ids) => req('/orden', body('PUT', { tipo, ids }))
export const imagen = (id) => req(`/fotos/${id}/img`, { blob: true })
export const nuevaClaveTele = () => req('/clave-tele', { method: 'POST' })

export function subirFoto({ blob, tipo, ancho, alto, titulo, lugar }) {
  const fd = new FormData()
  fd.append('archivo', blob, 'foto.jpg')
  fd.append('tipo', tipo)
  fd.append('ancho', ancho)
  fd.append('alto', alto)
  if (titulo) fd.append('titulo', titulo)
  if (lugar) fd.append('lugar', lugar)
  return req('/fotos', { method: 'POST', body: fd })
}

// Achica la foto en el navegador antes de subirla: una foto de celular de 5 MB
// queda en ~300 KB y la tele la carga al toque. Respeta la rotación del celular.
export async function achicar(file, maxLado) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const escala = Math.min(1, maxLado / Math.max(bmp.width, bmp.height))
  const ancho = Math.round(bmp.width * escala), alto = Math.round(bmp.height * escala)
  const c = document.createElement('canvas')
  c.width = ancho
  c.height = alto
  c.getContext('2d').drawImage(bmp, 0, 0, ancho, alto)
  bmp.close?.()
  const blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.86))
  return { blob, ancho, alto }
}
