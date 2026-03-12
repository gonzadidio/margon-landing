import { useEffect, useRef, useState } from 'react'

export default function Logo({ src, alt, className = '' }) {
  const canvasRef = useRef(null)
  const [dataUrl, setDataUrl] = useState(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Remove dark background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        if (r < 55 && g < 55 && b < 55) {
          data[i + 3] = 0
        }
      }

      ctx.putImageData(imageData, 0, 0)

      // Trim transparent pixels
      const w = canvas.width
      const h = canvas.height
      const trimmed = ctx.getImageData(0, 0, w, h)
      const td = trimmed.data
      let top = h, bottom = 0, left = w, right = 0

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const alpha = td[(y * w + x) * 4 + 3]
          if (alpha > 0) {
            if (y < top) top = y
            if (y > bottom) bottom = y
            if (x < left) left = x
            if (x > right) right = x
          }
        }
      }

      const trimW = right - left + 1
      const trimH = bottom - top + 1
      const trimCanvas = document.createElement('canvas')
      trimCanvas.width = trimW
      trimCanvas.height = trimH
      const trimCtx = trimCanvas.getContext('2d')
      trimCtx.putImageData(
        ctx.getImageData(left, top, trimW, trimH),
        0, 0
      )

      setDataUrl(trimCanvas.toDataURL('image/png'))
    }
    img.src = src
  }, [src])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {dataUrl ? (
        <img src={dataUrl} alt={alt} className={className} />
      ) : (
        <img src={src} alt={alt} className={className} style={{ opacity: 0 }} />
      )}
    </>
  )
}
