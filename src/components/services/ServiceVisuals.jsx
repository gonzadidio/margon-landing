import { ArrowUpRight, ArrowRight, ArrowLeftRight, Share2, Settings, Circle } from 'lucide-react'

/**
 * Visuales de cada tarjeta de servicios. Son mockups en CSS a modo de
 * placeholder: cada uno se puede reemplazar por una imagen sin tocar la tarjeta.
 * Cada visual acepta `img` (ruta en /public); si viene, se muestra la imagen.
 */

function WithImage({ img, alt, children }) {
  if (img) return <img src={img} alt={alt || ''} className="svc-visual-img" />
  return children
}

/** Producto & Diseño: pantalla clara con menú, modal flotante y botón */
export function VisualProduct({ img }) {
  return (
    <WithImage img={img}>
      <div className="svc-dashboard">
        <div className="svc-dashboard-head">
          <span className="w-11 h-1.5 rounded bg-[#26312f]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#26312f]" />
        </div>
        <div className="flex flex-col gap-3">
          {[60, 45, 70, 40].map((w, i) => (
            <i key={i} className="block h-1.5 rounded bg-[#162823]/35" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="svc-dashboard-modal">
          <span className="block w-11 h-1.5 mb-2.5 rounded bg-white/20" />
          <span className="block w-8 h-1.5 rounded bg-white/20" />
        </div>
        <div className="svc-dashboard-btn">
          Publicar proyecto <ArrowUpRight size={9} />
        </div>
      </div>
    </WithImage>
  )
}

/** Desarrollo Web & Mobile: dos teléfonos superpuestos */
export function VisualPhone({ img }) {
  return (
    <WithImage img={img}>
      <div className="svc-phones">
        <div className="svc-phone svc-phone-back" />
        <div className="svc-phone svc-phone-front">
          <div className="svc-phone-image" />
          <span className="block mx-2 mb-1.5 text-[9px] font-semibold text-white">Discover ideas</span>
          <small className="block mx-2 text-[6px] text-white/55">Diseño pensado para vos.</small>
        </div>
      </div>
    </WithImage>
  )
}

/** Backend & APIs: caja de código con respuesta JSON */
export function VisualCode({ img }) {
  return (
    <WithImage img={img}>
      <div className="svc-code">
        <div>
          <span className="text-[#28fa81]">GET</span> <span className="text-white">/api/products</span>
        </div>
        <div className="mt-3 text-[#28fa81]">200 OK</div>
        <pre className="mt-4 whitespace-pre-wrap font-[inherit] text-white">{`{\n  `}<span className="text-[#64ef8d]">&quot;status&quot;</span>{`: `}<b className="font-normal text-[#9dfd65]">&quot;success&quot;</b>{`,\n  `}<span className="text-[#64ef8d]">&quot;data&quot;</span>{`: [ ... ]\n}`}</pre>
        <ArrowRight size={20} className="absolute right-3.5 bottom-3 text-[#00e98e]" />
      </div>
    </WithImage>
  )
}

/** Datos & Analytics: gráfico de barras */
export function VisualChart({ img }) {
  const bars = [
    { h: 48, label: 'Ene' },
    { h: 33, label: 'Feb' },
    { h: 68, label: 'Abr' },
    { h: 86, label: 'May' },
  ]
  return (
    <WithImage img={img}>
      <div className="svc-chart">
        <div className="svc-chart-axis">
          {['100%', '75%', '50%', '25%', '0%'].map((v) => <span key={v}>{v}</span>)}
        </div>
        <div className="svc-chart-bars">
          {bars.map((b) => (
            <div key={b.label} className="svc-chart-group">
              <div className="svc-chart-bar" style={{ height: `${b.h}%` }} />
              <small>{b.label}</small>
            </div>
          ))}
        </div>
        <ArrowUpRight size={14} className="absolute right-3 bottom-2.5 text-[#00e98e]" />
      </div>
    </WithImage>
  )
}

/** Automatizaciones: flujo Lead → CRM → Venta / Factura ↔ Reporte */
export function VisualAutomation({ img }) {
  return (
    <WithImage img={img}>
      <div className="svc-flow">
        <div className="svc-flow-row">
          <div className="svc-flow-node">Lead</div>
          <ArrowRight size={14} className="svc-flow-arrow" />
          <div className="svc-flow-node">CRM</div>
          <ArrowRight size={14} className="svc-flow-arrow" />
          <div className="svc-flow-node">Venta</div>
        </div>
        <div className="svc-flow-row ml-7">
          <div className="svc-flow-node">Factura</div>
          <ArrowLeftRight size={14} className="svc-flow-arrow" />
          <div className="svc-flow-node">Reporte</div>
        </div>
      </div>
    </WithImage>
  )
}

/** Integraciones & Cloud: nube con tres servicios conectados */
export function VisualCloud({ img }) {
  return (
    <WithImage img={img}>
      <div className="svc-cloud">
        <div className="svc-cloud-shape">
          <Share2 size={26} />
        </div>
        <div className="svc-cloud-line" />
        <div className="flex gap-3">
          <div className="svc-cloud-item text-[13px] font-bold tracking-tight">aws</div>
          <div className="svc-cloud-item"><Settings size={20} /></div>
          <div className="svc-cloud-item"><Circle size={20} /></div>
        </div>
      </div>
    </WithImage>
  )
}
