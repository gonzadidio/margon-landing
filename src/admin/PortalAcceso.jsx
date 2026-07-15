import { useState } from 'react'
import { KeyRound, Copy, Check, Loader2, CheckCircle2 } from 'lucide-react'
import { apiFetch } from './api'
import { fmtFecha } from './format'

export default function PortalAcceso({ cliente }) {
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [err, setErr] = useState('')

  const activo = cliente.portal_activo

  async function generar() {
    setErr(''); setLoading(true)
    try {
      const r = await apiFetch(`/clientes/${cliente.id}/portal-invite`, { method: 'POST' })
      setLink(`${window.location.origin}/portal/activar?token=${r.token}`)
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }
  async function copiar() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* noop */ }
  }

  return (
    <div className="ad-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-primary-400" />
        <h3 className="font-semibold ad-ink text-sm">Acceso al portal del cliente</h3>
        {activo && <span className="ad-pill ad-pill-green ml-auto"><CheckCircle2 className="w-3 h-3" /> Activo</span>}
      </div>

      {activo ? (
        <p className="text-[13px] ad-muted">
          {cliente.nombre} ya activó su portal{cliente.portal_last_login ? ` · último ingreso ${fmtFecha(cliente.portal_last_login)}` : ''}.
          Podés regenerar un link nuevo si necesita restablecer la contraseña.
        </p>
      ) : (
        <p className="text-[13px] ad-muted">
          Generá un link de invitación y mandáselo a <b className="ad-ink">{cliente.email || 'el cliente'}</b>. Con ese link crea su contraseña y entra a ver pagos, proyectos, archivos y presupuestos.
        </p>
      )}

      {!link ? (
        <button onClick={generar} disabled={loading} className="ad-btn ad-btn-soft ad-btn-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          {activo ? 'Regenerar link' : 'Generar link de acceso'}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input readOnly value={link} onFocus={(e) => e.target.select()} className="ad-input flex-1 text-[12px]" />
            <button onClick={copiar} className="ad-btn ad-btn-primary ad-btn-sm shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-[11px] ad-faint">Válido por 14 días. Mandáselo por mail o WhatsApp — al abrirlo crea su contraseña.</p>
        </div>
      )}

      {err && <p className="text-[13px] text-red-400">{err}</p>}
    </div>
  )
}
