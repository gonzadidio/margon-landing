import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LogOut } from 'lucide-react'
import './casa.css'
import * as api from './casaApi'
import { DEFAULT_CONFIG, calcular, saludo } from './calculos'
import { ToastProvider, useToast } from './ui'
import Login from './Login'
import Resumen from './Resumen'
import Terreno from './Terreno'
import Gastos from './Gastos'
import Flujo from './Flujo'
import Obra from './Obra'

const SECCIONES = [
  { id: 'resumen', label: 'Inicio', C: Resumen },
  { id: 'terreno', label: 'El terreno', C: Terreno },
  { id: 'gastos', label: 'Lo que pusimos', C: Gastos },
  { id: 'mes', label: 'Mes a mes', C: Flujo },
  { id: 'casa', label: 'Nuestra casa', C: Obra },
]

// Fuentes del estilo Openn Pilar: solo se cargan en /casa.
function useFuentes() {
  useEffect(() => {
    const id = 'lt-fonts'
    if (document.getElementById(id)) return
    const l = document.createElement('link')
    l.id = id
    l.rel = 'stylesheet'
    l.href = 'https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@300;400;500;600&display=swap'
    document.head.appendChild(l)
  }, [])
}

export default function CasaApp() {
  useFuentes()
  const [authed, setAuthed] = useState(() => !!api.getToken())
  useEffect(() => {
    document.title = 'Nuestro hogar · Gonza & Martina'
    api.setOnUnauthorized(() => setAuthed(false))
  }, [])
  return (
    <div className="lt-app">
      <ToastProvider>
        {authed ? <Shell onSalir={() => { api.clearToken(); setAuthed(false) }} /> : <Login onOk={() => setAuthed(true)} />}
      </ToastProvider>
    </div>
  )
}

const seccionDeHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '')
  return SECCIONES.some((s) => s.id === h) ? h : 'resumen'
}

function Shell({ onSalir }) {
  const toast = useToast()
  const [estado, setEstado] = useState(null)
  const [error, setError] = useState(null)
  const [seccion, setSeccion] = useState(seccionDeHash)
  const [cfg, setCfg] = useState(null)
  const guardando = useRef(null)

  const cargar = useCallback(async () => {
    try {
      const e = await api.getEstado()
      setEstado(e)
      setError(null)
      // No pisar la config mientras alguien la está editando acá.
      if (!guardando.current) setCfg({ ...DEFAULT_CONFIG, ...(e.config?.datos || {}) })
    } catch (e) { setError(e.message) }
  }, [])

  useEffect(() => {
    cargar()
    // Lo que carga el otro aparece solo: refresco al volver a la pestaña y cada 30 s.
    const onFocus = () => document.visibilityState === 'visible' && cargar()
    document.addEventListener('visibilitychange', onFocus)
    const t = setInterval(() => document.visibilityState === 'visible' && cargar(), 30000)
    return () => { document.removeEventListener('visibilitychange', onFocus); clearInterval(t) }
  }, [cargar])

  useEffect(() => {
    const onHash = () => { setSeccion(seccionDeHash()); window.scrollTo({ top: 0 }) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Cambios de config: se ven al instante y se guardan tras una pausa.
  const cfgRef = useRef(null)
  cfgRef.current = cfg
  const cambiarCfg = useCallback((patch) => {
    const next = { ...cfgRef.current, ...patch }
    cfgRef.current = next
    setCfg(next)
    clearTimeout(guardando.current)
    const timer = setTimeout(async () => {
      try { await api.guardarConfig(next); toast('Guardado') } catch (e) { toast(e.message, true) }
      if (guardando.current === timer) guardando.current = null
    }, 700)
    guardando.current = timer
  }, [toast])

  // Ejecuta un cambio en el servidor y recarga el estado.
  const accion = useCallback(async (fn, ok) => {
    try { await fn(); if (ok) toast(ok); await cargar(); return true } catch (e) { toast(e.message, true); return false }
  }, [cargar, toast])

  const calc = useMemo(() => (cfg && estado ? calcular(cfg, estado.movimientos, estado.flujo, estado.porCobrar) : null), [cfg, estado])
  const Actual = SECCIONES.find((s) => s.id === seccion).C

  return (
    <>
      <header className="lt-top">
        <div className="lt-top-in">
          <a className="lt-mark" href="#/resumen" aria-label="Nuestro hogar, inicio">
            <em className="lt-mono">G<i>&amp;</i>M</em>
            <span className="lt-mark-txt"><b>Nuestro hogar</b><span>Lote 137 · Openn Pilar</span></span>
          </a>
          <nav className="lt-nav" aria-label="Secciones">
            {SECCIONES.map((s) => (
              <a key={s.id} href={`#/${s.id}`} aria-current={s.id === seccion ? 'page' : undefined}>{s.label}</a>
            ))}
          </nav>
          <div className="lt-user">
            {estado?.yo && <span>{saludo()}, {estado.yo.nombre}</span>}
            <button type="button" className="lt-icon" onClick={onSalir} aria-label="Salir" title="Salir"><LogOut size={18} /></button>
          </div>
        </div>
      </header>
      <main className="lt-main">
        {error && !estado && <div className="lt-error">No se pudieron traer los datos: {error}</div>}
        {!calc ? <div className="lt-empty">Abriendo la puerta…</div> : (
          <Actual cfg={cfg} calc={calc} estado={estado} cambiarCfg={cambiarCfg} accion={accion} api={api} />
        )}
      </main>
    </>
  )
}
