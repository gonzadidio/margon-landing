import { useEffect } from 'react'

export function useDynamicFavicon(src) {
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        if (r < 55 && g < 55 && b < 55) {
          data[i + 3] = 0
        }
      }

      ctx.putImageData(imageData, 0, 0)

      const link = document.querySelector("link[rel='icon']") || document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/png'
      link.href = canvas.toDataURL('image/png')
      document.head.appendChild(link)
    }
    img.src = src
  }, [src])
}
