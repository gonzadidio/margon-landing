import { useEffect, useState } from 'react'

// Rutas por hash: #/hoy, #/clientes, #/clientes/12, #/cobros?p=2026-09, #/ventas, #/ajustes
export function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '')
  const [path, query = ''] = h.split('?')
  const partes = path.split('/').filter(Boolean)
  return {
    seccion: partes[0] || 'hoy',
    id: partes[1] || null,
    query: Object.fromEntries(new URLSearchParams(query)),
  }
}

export function useRuta() {
  const [ruta, setRuta] = useState(parseHash)
  useEffect(() => {
    const f = () => setRuta(parseHash())
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return ruta
}

export const ir = (path) => { window.location.hash = `#/${String(path).replace(/^[#/]+/, '')}` }
export const irCliente = (id) => ir(`clientes/${id}`)
export const hrefCliente = (id) => `#/clientes/${id}`
