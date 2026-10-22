import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, EyeOff, ImagePlus, LogOut, Star, Trash2, Tv } from 'lucide-react'
import './tele.css'
import * as api from './teleApi'

// /tele: el panel de la tele del living (Sansei Google TV). Lo que se guarda acá la tele
// lo toma sola en un par de minutos. Mismos usuarios que /casa.

const PESTANAS = [
  { id: 'fotos', label: 'Fotos' },
  { id: 'fondos', label: 'Fondos' },
  { id: 'apps', label: 'Apps' },
  { id: 'diseno', label: 'Diseño' },
  { id: 'protector', label: 'Protector' },
  { id: 'tele', label: 'Tele' },
]

const CIUDADES = {
  'Buenos Aires': [-34.61, -58.38], 'Pilar': [-34.46, -58.91], 'La Plata': [-34.92, -57.95], 'Córdoba': [-31.42, -64.18],
  'Rosario': [-32.95, -60.65], 'Mendoza': [-32.89, -68.84], 'Mar del Plata': [-38.0, -57.56], 'San Miguel de Tucumán': [-26.82, -65.22],
  'Salta': [-24.79, -65.41], 'Santa Fe': [-31.63, -60.7], 'Neuquén': [-38.95, -68.06], 'Bahía Blanca': [-38.72, -62.27],
  'San Carlos de Bariloche': [-41.13, -71.31], 'Corrientes': [-27.47, -58.83], 'Posadas': [-27.37, -55.9], 'Ushuaia': [-54.8, -68.3],
}

// Nombres lindos para cuando la tele todavía no mandó su lista de apps.
const NOMBRES = {
  'com.netflix.ninja': 'Netflix', 'com.google.android.youtube.tv': 'YouTube', 'com.disney.disneyplus': 'Disney+',
  'com.amazon.amazonvideo.livingroom': 'Prime Video', 'ar.com.flow.androidtv': 'Flow', 'com.spotify.tv.android': 'Spotify',
  'com.wbd.stream': 'Max', 'com.cbs.ott': 'Paramount+', 'com.android.vending': 'Google Play',
  'com.google.android.youtube.tvmusic': 'YouTube Music', 'tv.twitch.android.app': 'Twitch', 'com.vt.tv.tvcenter': 'TV en vivo',
  'tv.pluto.android': 'Pluto TV', 'com.crunchyroll.crunchyroid': 'Crunchyroll', 'com.mercadolibre.android.mplay_tv': 'Mercado Play',
  'com.hisense.odinbrowser': 'Navegador', 'com.vt.tv.mediacenter': 'Multimedia',
}

export default function TeleApp() {
  const [authed, setAuthed] = useState(() => !!api.getToken())
  useEffect(() => {
    document.title = 'Tu tele'
    api.setOnUnauthorized(() => setAuthed(false))
    // Outfit, la letra de la pantalla de la tele: solo se carga en /tele.
    if (!document.getElementById('tv-fonts')) {
      const l = document.createElement('link')
      l.id = 'tv-fonts'
      l.rel = 'stylesheet'
      l.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap'
      document.head.appendChild(l)
    }
  }, [])
  return (
    <div className="tv-app">
      {authed ? <Panel onSalir={() => { api.clearToken(); setAuthed(false) }} /> : <Login onOk={() => setAuthed(true)} />}
    </div>
  )
}

function Login({ onOk }) {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  async function enviar(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try { await api.login(usuario, password); onOk() } catch (err) { setError(err.message) } finally { setCargando(false) }
  }
  return (
    <div className="tv-login">
      <form onSubmit={enviar} className="tv-card tv-login-card">
        <Tv size={34} aria-hidden="true" />
        <h1>Tu tele</h1>
        <p className="tv-muted">Fotos, fondos y diseño de la pantalla de inicio. Entrá con tu usuario de /casa.</p>
        <label className="tv-field"><span>Usuario</span>
          <input autoComplete="username" autoCapitalize="none" required value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        </label>
        <label className="tv-field"><span>Contraseña</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="tv-error" role="alert">{error}</div>}
        <button className="tv-btn tv-btn-main" type="submit" disabled={cargando}>{cargando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </div>
  )
}

const pestanaDeHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '')
  return PESTANAS.some((p) => p.id === h) ? h : 'fotos'
}

function Panel({ onSalir }) {
  const [estado, setEstado] = useState(null)
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [pestana, setPestana] = useState(pestanaDeHash)

  const cargar = useCallback(async () => {
    try {
      const e = await api.getEstado()
      setEstado(e)
      setConfig(e.config)
    } catch (err) { setError(err.message) }
  }, [])
  useEffect(() => { cargar() }, [cargar])
  useEffect(() => {
    const t = setInterval(() => api.getEstado().then((e) => setEstado((v) => ({ ...e, fotos: v?.fotos ?? e.fotos }))).catch(() => {}), 60000)
    return () => clearInterval(t)
  }, [])

  const avisoT = useRef(null)
  const avisar = useCallback((texto) => {
    setAviso(texto)
    clearTimeout(avisoT.current)
    avisoT.current = setTimeout(() => setAviso(null), 3500)
  }, [])

  // Cada cambio de diseño se guarda solo, medio segundo después del último toque.
  const pendiente = useRef(null)
  const cambiar = useCallback((parche) => {
    setConfig((c) => {
      const nueva = { ...c, ...parche, screensaver: { ...c.screensaver, ...(parche.screensaver || {}) } }
      clearTimeout(pendiente.current)
      pendiente.current = setTimeout(async () => {
        try {
          const r = await api.guardarConfig(nueva)
          setConfig(r.config)
          avisar('Guardado. La tele lo toma en unos minutos.')
        } catch (err) { avisar(err.message) }
      }, 600)
      return nueva
    })
  }, [avisar])

  const irA = (id) => { setPestana(id); window.history.replaceState(null, '', `#${id}`) }
  const setFotos = (fn) => setEstado((e) => ({ ...e, fotos: fn(e.fotos) }))

  if (error) return <div className="tv-wrap"><div className="tv-error">{error}</div></div>
  if (!estado || !config) return <div className="tv-wrap tv-muted">Cargando…</div>

  return (
    <div className="tv-wrap">
      <header className="tv-header">
        <div>
          <h1>Tu tele</h1>
          <EstadoTele tv={estado.tv} />
        </div>
        <button className="tv-btn tv-btn-ghost" onClick={onSalir} aria-label="Salir"><LogOut size={18} /> Salir</button>
      </header>
      <nav className="tv-tabs" aria-label="Secciones">
        {PESTANAS.map((p) => (
          <button key={p.id} className={`tv-tab ${pestana === p.id ? 'on' : ''}`} onClick={() => irA(p.id)}>{p.label}</button>
        ))}
      </nav>

      {pestana === 'fotos' && <Fotos tipo="foto" fotos={estado.fotos} setFotos={setFotos} config={config} cambiar={cambiar} avisar={avisar} />}
      {pestana === 'fondos' && <Fotos tipo="fondo" fotos={estado.fotos} setFotos={setFotos} config={config} cambiar={cambiar} avisar={avisar} />}
      {pestana === 'apps' && <Apps config={config} cambiar={cambiar} apps={estado.tv.estado?.apps || []} />}
      {pestana === 'diseno' && <Diseno config={config} cambiar={cambiar} />}
      {pestana === 'protector' && <Protector config={config} cambiar={cambiar} />}
      {pestana === 'tele' && <Tele tv={estado.tv} onNuevaClave={(token) => setEstado((e) => ({ ...e, tv: { ...e.tv, token } }))} />}

      {aviso && <div className="tv-toast" role="status">{aviso}</div>}
    </div>
  )
}

function haceCuanto(fecha) {
  if (!fecha) return null
  const min = Math.round((Date.now() - new Date(fecha).getTime()) / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 48) return `hace ${h} h`
  return `hace ${Math.round(h / 24)} días`
}

function EstadoTele({ tv }) {
  const min = tv.visto ? (Date.now() - new Date(tv.visto).getTime()) / 60000 : Infinity
  const online = min < 6
  return (
    <p className={`tv-status ${online ? 'on' : ''}`}>
      <i aria-hidden="true" />
      {online ? 'La tele está conectada' : tv.visto ? `La tele no se conecta desde ${haceCuanto(tv.visto)}` : 'La tele todavía no se conectó'}
    </p>
  )
}

// ---------------- Fotos y fondos ----------------

const miniaturas = new Map()
function Miniatura({ id, alt }) {
  const [url, setUrl] = useState(() => miniaturas.get(id))
  useEffect(() => {
    if (url) return
    let vivo = true
    api.imagen(id).then((b) => {
      const u = URL.createObjectURL(b)
      miniaturas.set(id, u)
      if (vivo) setUrl(u)
    }).catch(() => {})
    return () => { vivo = false }
  }, [id, url])
  return url ? <img src={url} alt={alt} loading="lazy" /> : <span className="tv-thumb-wait" aria-hidden="true" />
}

function Fotos({ tipo, fotos, setFotos, config, cambiar, avisar }) {
  const esFondo = tipo === 'fondo'
  const lista = useMemo(() => fotos.filter((f) => f.tipo === tipo).sort((a, b) => a.orden - b.orden || a.id - b.id), [fotos, tipo])
  const [subiendo, setSubiendo] = useState(null)
  const input = useRef(null)

  async function subir(files) {
    const todos = [...files].filter((f) => f.type.startsWith('image/'))
    for (let i = 0; i < todos.length; i++) {
      setSubiendo(`Subiendo ${i + 1} de ${todos.length}…`)
      try {
        const chica = await api.achicar(todos[i], esFondo ? 1920 : 1600)
        const nueva = await api.subirFoto({ ...chica, tipo })
        setFotos((fs) => [...fs, nueva])
      } catch (err) { avisar(`No se pudo subir ${todos[i].name}: ${err.message}`) }
    }
    setSubiendo(null)
    avisar(`${todos.length === 1 ? 'Foto subida' : `${todos.length} fotos subidas`}. La tele las baja en unos minutos.`)
  }

  async function mover(i, d) {
    const ids = lista.map((f) => f.id)
    const j = i + d
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    setFotos((fs) => fs.map((f) => (f.tipo === tipo ? { ...f, orden: ids.indexOf(f.id) + 1 } : f)))
    try { await api.ordenar(tipo, ids) } catch (err) { avisar(err.message) }
  }

  async function borrar(f) {
    if (!window.confirm(esFondo ? `¿Sacar el fondo ${f.titulo || ''}?` : '¿Sacar esta foto de la tele?')) return
    try {
      await api.borrarFoto(f.id)
      setFotos((fs) => fs.filter((x) => x.id !== f.id))
    } catch (err) { avisar(err.message) }
  }

  async function renombrar(f, campo, valor) {
    if ((f[campo] || '') === valor) return
    try {
      const r = await api.editarFoto(f.id, { titulo: f.titulo, lugar: f.lugar, [campo]: valor })
      setFotos((fs) => fs.map((x) => (x.id === f.id ? { ...x, ...r } : x)))
    } catch (err) { avisar(err.message) }
  }

  return (
    <section className="tv-card">
      <div className="tv-card-head">
        <div>
          <h2>{esFondo ? 'Fondos de pantalla' : 'Fotos del cuadro'}</h2>
          <p className="tv-muted">{esFondo
            ? 'Van cambiando detrás de todo. Ponele a cada uno el nombre del lugar: sale en el protector.'
            : 'Pasan en el cuadro del inicio y caen como polaroids en el protector. Las verticales van de a dos.'}</p>
        </div>
        <button className="tv-btn tv-btn-main" onClick={() => input.current?.click()} disabled={!!subiendo}>
          <ImagePlus size={18} /> {subiendo || 'Subir fotos'}
        </button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { subir(e.target.files); e.target.value = '' }} />
      </div>

      {lista.length === 0 && <p className="tv-empty">Todavía no hay {esFondo ? 'fondos' : 'fotos'}. Subí las que quieras desde el celu o la compu.</p>}
      <div className={`tv-grid ${esFondo ? 'wide' : ''}`}>
        {lista.map((f, i) => (
          <figure key={f.id} className="tv-thumb">
            <div className="tv-thumb-img"><Miniatura id={f.id} alt={f.titulo || `Foto ${i + 1}`} /></div>
            {esFondo && (
              <div className="tv-thumb-fields">
                <input aria-label="Lugar" placeholder="Lugar (ej: Glaciar Perito Moreno)" defaultValue={f.titulo || ''} onBlur={(e) => renombrar(f, 'titulo', e.target.value.trim())} />
                <input aria-label="Dónde queda" placeholder="Dónde queda (ej: Santa Cruz)" defaultValue={f.lugar || ''} onBlur={(e) => renombrar(f, 'lugar', e.target.value.trim())} />
              </div>
            )}
            <figcaption>
              <button className="tv-icon" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Antes"><ArrowLeft size={16} /></button>
              <button className="tv-icon" onClick={() => mover(i, 1)} disabled={i === lista.length - 1} aria-label="Después"><ArrowRight size={16} /></button>
              <button className="tv-icon danger" onClick={() => borrar(f)} aria-label="Sacar"><Trash2 size={16} /></button>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="tv-row">
        {esFondo ? (
          <Seg label="Cambiar de fondo cada" value={config.wallpaper_rotate_minutes} onChange={(v) => cambiar({ wallpaper_rotate_minutes: v })}
            options={[[5, '5 min'], [10, '10 min'], [30, '30 min'], [60, '1 hora']]} />
        ) : (
          <>
            <Seg label="Cambiar de foto cada" value={config.photo_interval_seconds} onChange={(v) => cambiar({ photo_interval_seconds: v })}
              options={[[10, '10 s'], [30, '30 s'], [60, '1 min'], [300, '5 min']]} />
            <Seg label="Fotos verticales" value={config.vertical_photos} onChange={(v) => cambiar({ vertical_photos: v })}
              options={[['pair', 'De a dos'], ['single', 'Una, con fondo desenfocado']]} />
          </>
        )}
      </div>
    </section>
  )
}

// ---------------- Apps ----------------

function Apps({ config, cambiar, apps }) {
  const nombre = useMemo(() => {
    const m = { ...NOMBRES }
    apps.forEach((a) => { m[a.pkg] = a.label })
    return (p) => m[p] || p
  }, [apps])
  const todas = useMemo(() => {
    const s = new Set([...apps.map((a) => a.pkg), ...config.dock_apps, ...config.app_order, ...config.hidden_apps])
    return [...s]
  }, [apps, config])
  const ocultas = todas.filter((p) => config.hidden_apps.includes(p))
  const barra = config.dock_apps.filter((p) => !config.hidden_apps.includes(p))
  const resto = [
    ...config.app_order.filter((p) => !barra.includes(p) && !ocultas.includes(p)),
    ...todas.filter((p) => !barra.includes(p) && !ocultas.includes(p) && !config.app_order.includes(p))
      .sort((a, b) => nombre(a).localeCompare(nombre(b))),
  ]

  const mover = (arr, i, d) => { const a = [...arr]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a }
  const aBarra = (p) => {
    if (barra.length >= 6) return window.alert('La barra tiene lugar para 6 apps. Sacá una primero.')
    cambiar({ dock_apps: [...barra, p], app_order: resto.filter((x) => x !== p) })
  }
  const sacarDeBarra = (p) => cambiar({ dock_apps: barra.filter((x) => x !== p), app_order: [p, ...resto] })
  const ocultar = (p) => cambiar({ hidden_apps: [...config.hidden_apps, p], dock_apps: barra.filter((x) => x !== p), app_order: resto.filter((x) => x !== p) })
  const mostrar = (p) => cambiar({ hidden_apps: config.hidden_apps.filter((x) => x !== p), app_order: [...resto, p] })

  const Fila = ({ p, i, lista, enBarra }) => (
    <li className="tv-app-row">
      <span className="tv-app-name">{nombre(p)}<small>{p}</small></span>
      <button className="tv-icon" onClick={() => cambiar(enBarra ? { dock_apps: mover(lista, i, -1) } : { app_order: mover(lista, i, -1) })} disabled={i === 0} aria-label="Subir"><ArrowUp size={16} /></button>
      <button className="tv-icon" onClick={() => cambiar(enBarra ? { dock_apps: mover(lista, i, 1) } : { app_order: mover(lista, i, 1) })} disabled={i === lista.length - 1} aria-label="Bajar"><ArrowDown size={16} /></button>
      <button className={`tv-icon ${enBarra ? 'star' : ''}`} onClick={() => (enBarra ? sacarDeBarra(p) : aBarra(p))} aria-label={enBarra ? 'Sacar de la barra' : 'Pasar a la barra'}><Star size={16} /></button>
      <button className="tv-icon" onClick={() => ocultar(p)} aria-label="Ocultar"><EyeOff size={16} /></button>
    </li>
  )

  return (
    <section className="tv-card">
      <h2>Apps</h2>
      <p className="tv-muted">★ pasa una app a la barra de abajo (hasta 6). Las flechas cambian el orden. El ojo la oculta del inicio (no la desinstala).
        {apps.length === 0 && ' Cuando la tele se conecte vas a ver acá todas las apps que tiene instaladas.'}</p>
      <h3>En la barra</h3>
      <ul className="tv-apps">{barra.map((p, i) => <Fila key={p} p={p} i={i} lista={barra} enBarra />)}</ul>
      <h3>Al bajar con el control</h3>
      <ul className="tv-apps">{resto.map((p, i) => <Fila key={p} p={p} i={i} lista={resto} />)}</ul>
      {ocultas.length > 0 && <>
        <h3>Ocultas</h3>
        <ul className="tv-apps">{ocultas.map((p) => (
          <li key={p} className="tv-app-row off">
            <span className="tv-app-name">{nombre(p)}<small>{p}</small></span>
            <button className="tv-icon" onClick={() => mostrar(p)} aria-label="Mostrar"><Eye size={16} /></button>
          </li>
        ))}</ul>
      </>}
    </section>
  )
}

// ---------------- Diseño ----------------

function Diseno({ config, cambiar }) {
  const ciudad = CIUDADES[config.weather_city] ? config.weather_city : ''
  return (
    <section className="tv-card">
      <h2>Diseño del inicio</h2>
      <div className="tv-row">
        <Seg label="Logos de las apps" value={config.logo_style} onChange={(v) => cambiar({ logo_style: v })}
          options={[['color', 'A color'], ['white', 'Blancos']]} />
        <Rango label="Desenfoque del vidrio" min={0} max={40} value={config.glass_blur} onChange={(v) => cambiar({ glass_blur: v })} />
        <Rango label="Vidrio más oscuro ↔ más claro" min={-40} max={40} value={config.glass_tint} onChange={(v) => cambiar({ glass_tint: v })} />
        <Check label="Reloj de 24 horas" value={config.clock_24h} onChange={(v) => cambiar({ clock_24h: v })} />
        <Check label="Fecha debajo de la hora" value={config.show_date} onChange={(v) => cambiar({ show_date: v })} />
      </div>
      <h3>Clima</h3>
      <div className="tv-row">
        <Check label="Mostrar el clima" value={config.weather} onChange={(v) => cambiar({ weather: v })} />
        <Check label="Máxima y mínima del día" value={config.weather_min_max} onChange={(v) => cambiar({ weather_min_max: v })} />
        <label className="tv-field"><span>Ciudad</span>
          <select value={ciudad} onChange={(e) => {
            const [lat, lon] = CIUDADES[e.target.value]
            cambiar({ weather_city: e.target.value, weather_lat: lat, weather_lon: lon })
          }}>
            {!ciudad && <option value="">{config.weather_city}</option>}
            {Object.keys(CIUDADES).map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
    </section>
  )
}

function Protector({ config, cambiar }) {
  const ss = config.screensaver
  const set = (p) => cambiar({ screensaver: p })
  return (
    <section className="tv-card">
      <h2>Protector de pantalla</h2>
      <p className="tv-muted">Mesa de recuerdos: tus fotos caen como polaroids sobre los fondos. Arranca a los 10 minutos sin tocar el control.</p>
      <div className="tv-row">
        <Seg label="Velocidad" value={ss.speed} onChange={(v) => set({ speed: v })}
          options={[['tranquilo', 'Tranquilo'], ['normal', 'Normal'], ['rapido', 'Rápido']]} />
        <Check label="Frases escritas a mano en las polaroids" value={ss.captions} onChange={(v) => set({ captions: v })} />
        <Check label="Cinta adhesiva arriba de cada polaroid" value={ss.tape} onChange={(v) => set({ tape: v })} />
        <Check label="Clima en la tarjeta de la hora" value={ss.weather} onChange={(v) => set({ weather: v })} />
        <Check label="Cartel con el nombre del lugar del fondo" value={ss.place_chip} onChange={(v) => set({ place_chip: v })} />
      </div>
    </section>
  )
}

function Tele({ tv, onNuevaClave }) {
  const [ver, setVer] = useState(false)
  const e = tv.estado || {}
  async function rotar() {
    if (!window.confirm('La tele deja de sincronizarse hasta que le carguemos la clave nueva. ¿Seguro?')) return
    const r = await api.nuevaClaveTele()
    onNuevaClave(r.token)
  }
  return (
    <section className="tv-card">
      <h2>La tele</h2>
      <dl className="tv-dl">
        <dt>Última conexión</dt><dd>{tv.visto ? `${haceCuanto(tv.visto)} (${new Date(tv.visto).toLocaleString('es-AR')})` : 'Nunca'}</dd>
        <dt>Launcher</dt><dd>{e.version || '—'}</dd>
        <dt>Memoria libre</dt><dd>{e.memoria_libre_mb ? `${e.memoria_libre_mb} MB de ${e.memoria_total_mb} MB` : '—'}</dd>
        <dt>Apps instaladas</dt><dd>{e.apps?.length ?? '—'}</dd>
      </dl>
      <h3>Clave de la tele</h3>
      <p className="tv-muted">Con esta clave la tele baja las fotos y el diseño. No la compartas.</p>
      <div className="tv-key">
        <code>{ver ? tv.token : '•'.repeat(24)}</code>
        <button className="tv-btn tv-btn-ghost" onClick={() => setVer((v) => !v)}>{ver ? 'Ocultar' : 'Ver'}</button>
        <button className="tv-btn tv-btn-ghost danger" onClick={rotar}>Generar una nueva</button>
      </div>
    </section>
  )
}

// ---------------- Controles ----------------

function Seg({ label, value, onChange, options }) {
  return (
    <div className="tv-field"><span>{label}</span>
      <div className="tv-seg" role="group" aria-label={label}>
        {options.map(([v, t]) => <button key={v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>{t}</button>)}
      </div>
    </div>
  )
}

function Check({ label, value, onChange }) {
  return (
    <label className="tv-check"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {label}</label>
  )
}

function Rango({ label, value, onChange, min, max }) {
  return (
    <label className="tv-field"><span>{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}
