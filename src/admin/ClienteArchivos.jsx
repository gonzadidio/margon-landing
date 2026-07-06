import { useRef, useState } from 'react'
import {
  Paperclip, Upload, Download, Trash2, Loader2, FileText, FileImage, File as FileIcon,
} from 'lucide-react'
import { apiUpload, apiDownload, apiFetch } from './api'
import { fmtFecha } from './format'

const CATEGORIAS = [
  { v: 'factura',     label: 'Factura',     cls: 'bg-primary-500/15 text-primary-300' },
  { v: 'informe',     label: 'Informe',     cls: 'bg-sky-500/15 text-sky-300' },
  { v: 'comprobante', label: 'Comprobante', cls: 'bg-violet-500/15 text-violet-300' },
  { v: 'contrato',    label: 'Contrato',    cls: 'bg-amber-500/15 text-amber-300' },
  { v: 'otro',        label: 'Otro',        cls: 'bg-surface-800 text-surface-200/60' },
]
const catMeta = (v) => CATEGORIAS.find((c) => c.v === v) || CATEGORIAS[4]

function fmtSize(bytes) {
  const n = Number(bytes) || 0
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function iconFor(mime = '') {
  if (mime.includes('pdf')) return FileText
  if (mime.startsWith('image/')) return FileImage
  return FileIcon
}

export default function ClienteArchivos({ clienteId, archivos = [], onChange }) {
  const [categoria, setCategoria] = useState('factura')
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const [bajando, setBajando] = useState(null)
  const inputRef = useRef(null)

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true); setError('')
    try {
      const fd = new FormData()
      fd.append('archivo', file)
      fd.append('categoria', categoria)
      await apiUpload(`/clientes/${clienteId}/archivos`, fd)
      onChange?.()
    } catch (err) { setError(err.message) }
    finally {
      setSubiendo(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function descargar(a) {
    setBajando(a.id)
    try {
      const blob = await apiDownload(`/archivos/${a.id}`)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = a.nombre
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) { setError(err.message) }
    finally { setBajando(null) }
  }

  async function borrar(a) {
    if (!confirm(`¿Eliminar "${a.nombre}"?`)) return
    try {
      await apiFetch(`/archivos/${a.id}`, { method: 'DELETE' })
      onChange?.()
    } catch (err) { setError(err.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Paperclip className="w-4 h-4 text-primary-300" /> Archivos
          <span className="text-xs font-normal text-surface-200/40">{archivos.length}</span>
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="text-xs rounded-lg bg-surface-900/60 border border-primary-500/15 px-2 py-1.5 text-surface-200/80 outline-none focus:border-primary-400/50"
          >
            {CATEGORIAS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
          </select>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="inline-flex items-center gap-1.5 text-xs rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-[#0a0f0d] font-semibold px-3 py-1.5 transition"
          >
            {subiendo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Subir
          </button>
          <input ref={inputRef} type="file" onChange={onFile} className="hidden" />
        </div>
      </div>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      {archivos.length === 0 ? (
        <p className="text-sm text-surface-200/40 py-2">
          Subí facturas, informes mensuales, contratos… (hasta 15 MB c/u).
        </p>
      ) : (
        <div className="space-y-1.5">
          {archivos.map((a) => {
            const Icon = iconFor(a.mime)
            const cm = catMeta(a.categoria)
            return (
              <div key={a.id} className="flex items-center gap-3 rounded-lg bg-surface-900/40 ring-1 ring-primary-500/10 px-3 py-2">
                <Icon className="w-4 h-4 text-surface-200/50 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white truncate">{a.nombre}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${cm.cls}`}>{cm.label}</span>
                  </div>
                  <p className="text-xs text-surface-200/40">{fmtSize(a.tamano)} · {fmtFecha(a.created_at)}</p>
                </div>
                <button onClick={() => descargar(a)} title="Descargar" className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-primary-300 transition">
                  {bajando === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                </button>
                <button onClick={() => borrar(a)} title="Eliminar" className="p-1.5 rounded hover:bg-surface-800 text-surface-200/60 hover:text-red-400 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
