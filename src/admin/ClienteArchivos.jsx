import { useRef, useState } from 'react'
import { Upload, Download, Trash2, Loader2, FileText, FileImage, File as FileIcon } from 'lucide-react'
import { apiUpload, apiDownload, apiFetch } from './api'
import { fmtFecha } from './format'

const CATEGORIAS = [
  { v: 'factura', label: 'Factura', cls: 'ad-pill-green' },
  { v: 'informe', label: 'Informe', cls: 'ad-pill-blue' },
  { v: 'comprobante', label: 'Comprobante', cls: 'ad-pill-violet' },
  { v: 'contrato', label: 'Contrato', cls: 'ad-pill-amber' },
  { v: 'otro', label: 'Otro', cls: 'ad-pill-gray' },
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
      const fd = new FormData(); fd.append('archivo', file); fd.append('categoria', categoria)
      await apiUpload(`/clientes/${clienteId}/archivos`, fd); onChange?.()
    } catch (err) { setError(err.message) }
    finally { setSubiendo(false); if (inputRef.current) inputRef.current.value = '' }
  }

  async function descargar(a) {
    setBajando(a.id)
    try {
      const blob = await apiDownload(`/archivos/${a.id}`)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a'); link.href = url; link.download = a.nombre
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url)
    } catch (err) { setError(err.message) } finally { setBajando(null) }
  }

  async function borrar(a) {
    if (!confirm(`¿Eliminar "${a.nombre}"?`)) return
    try { await apiFetch(`/archivos/${a.id}`, { method: 'DELETE' }); onChange?.() }
    catch (err) { setError(err.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <p className="text-sm ad-muted">Facturas, informes mensuales, contratos… (hasta 15 MB c/u).</p>
        <div className="flex items-center gap-2">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="ad-input !w-auto !py-1.5 text-xs">
            {CATEGORIAS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
          </select>
          <button onClick={() => inputRef.current?.click()} disabled={subiendo} className="ad-btn ad-btn-primary ad-btn-sm">
            {subiendo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Subir
          </button>
          <input ref={inputRef} type="file" onChange={onFile} className="hidden" />
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {archivos.length === 0 ? (
        <p className="text-sm ad-faint py-6 text-center">Todavía no subiste archivos.</p>
      ) : (
        <div className="space-y-1.5">
          {archivos.map((a) => {
            const Icon = iconFor(a.mime); const cm = catMeta(a.categoria)
            return (
              <div key={a.id} className="flex items-center gap-3 rounded-lg border ad-line px-3 py-2">
                <Icon className="w-4 h-4 ad-faint shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="text-sm ad-ink truncate">{a.nombre}</span><span className={`ad-pill ${cm.cls}`}>{cm.label}</span></div>
                  <p className="text-xs ad-faint">{fmtSize(a.tamano)} · {fmtFecha(a.created_at)}</p>
                </div>
                <button onClick={() => descargar(a)} className="p-1.5 rounded-lg hover:bg-[#eef1ef] ad-muted hover:text-primary-700 transition">{bajando === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}</button>
                <button onClick={() => borrar(a)} className="p-1.5 rounded-lg hover:bg-[#eef1ef] ad-muted hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
