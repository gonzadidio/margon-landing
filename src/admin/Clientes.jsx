import { useState } from 'react'
import { Search, Plus, ChevronRight, Users, KeyRound } from 'lucide-react'
import { apiGet } from './api'
import { Card, Btn, Pill, Avatar, Cargando, ErrorMsg, Empty, Segment, useCarga, useToast } from './ui'
import ClienteForm from './ClienteForm'
import { fmtMoney } from './format'
import { irCliente } from './nav'

export default function Clientes() {
  const toast = useToast()
  const { data, error, loading, recargar } = useCarga(() => apiGet('/clientes'))
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('activos')
  const [nuevo, setNuevo] = useState(false)

  const lista = (data || []).filter((c) => {
    if (filtro === 'activos' && c.estado !== 'activo') return false
    const s = q.trim().toLowerCase()
    return !s || [c.nombre, c.proyecto, c.email, c.telefono].some((v) => (v || '').toLowerCase().includes(s))
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold ad-ink tracking-tight">Clientes</h1>
          <p className="ad-muted text-sm mt-0.5">{data ? `${data.filter((c) => c.estado === 'activo').length} activos de ${data.length}` : ''}</p>
        </div>
        <Btn variant="primary" size="sm" icon={Plus} onClick={() => setNuevo(true)}>Nuevo cliente</Btn>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 ad-card px-3 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 ad-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, proyecto, mail o teléfono…" className="w-full bg-transparent py-2.5 text-sm outline-none ad-ink" />
        </label>
        <Segment size="sm" value={filtro} onChange={setFiltro} options={[{ v: 'activos', label: 'Activos' }, { v: 'todos', label: 'Todos' }]} />
      </div>

      {loading ? <Cargando /> : error ? <ErrorMsg>{error}</ErrorMsg> : (
        <Card flush>
          {lista.length === 0
            ? <Empty icon={Users} title={q ? 'Sin resultados' : 'Todavía no hay clientes'} action={!q && <Btn variant="soft" icon={Plus} onClick={() => setNuevo(true)}>Cargar el primero</Btn>} />
            : lista.map((c) => (
              <button key={c.id} onClick={() => irCliente(c.id)} className="ad-row w-full text-left">
                <Avatar nombre={c.nombre} tone={c.estado === 'activo' ? 'green' : 'gray'} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold ad-ink truncate flex items-center gap-2">
                    {c.nombre}
                    {c.estado !== 'activo' && <Pill tone="gray">inactivo</Pill>}
                    {c.portal_activo && <KeyRound className="w-3.5 h-3.5 text-primary-400" title="Portal activo" />}
                  </p>
                  <p className="text-[12px] ad-muted truncate">{[c.proyecto, c.email || c.telefono].filter(Boolean).join(' · ') || 'Sin datos de contacto'}</p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-[13px] ad-ink tabular-nums font-semibold">{Number(c.monto_mensual) > 0 ? `${fmtMoney(c.monto_mensual, c.moneda)}/mes` : <span className="ad-faint font-normal">sin abono</span>}</p>
                  {Number(c.deuda) > 0
                    ? <p className="text-[11.5px] text-amber-300 tabular-nums">debe {fmtMoney(c.deuda, c.moneda)}</p>
                    : <p className="text-[11.5px] ad-faint">al día</p>}
                </div>
                <ChevronRight className="w-4 h-4 ad-faint shrink-0" />
              </button>
            ))}
        </Card>
      )}

      {nuevo && <ClienteForm onClose={() => setNuevo(false)} onSaved={(c) => { setNuevo(false); toast('Cliente creado'); recargar(); irCliente(c.id) }} />}
    </div>
  )
}
