import { useEffect, useRef } from 'react'

export default function Background() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let mouseX = -1000
    let mouseY = -1000

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function onMouseMove(e) {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', onMouseMove)

    function draw() {
      const w = canvas.width
      const h = canvas.height
      const gridSize = 40

      ctx.clearRect(0, 0, w, h)

      // Draw grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)'
      ctx.lineWidth = 1

      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Draw checkerboard subtle overlay
      for (let x = 0; x < w; x += gridSize) {
        for (let y = 0; y < h; y += gridSize) {
          const col = Math.floor(x / gridSize)
          const row = Math.floor(y / gridSize)
          if ((col + row) % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.008)'
            ctx.fillRect(x, y, gridSize, gridSize)
          }
        }
      }

      // Mouse glow on grid intersections
      const radius = 180
      for (let x = 0; x <= w; x += gridSize) {
        for (let y = 0; y <= h; y += gridSize) {
          const dx = x - mouseX
          const dy = y - (mouseY + window.scrollY)
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < radius) {
            const intensity = 1 - dist / radius
            const alpha = intensity * 0.5

            // Glow dot
            ctx.beginPath()
            ctx.arc(x, y, 1.5 + intensity * 2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`
            ctx.fill()

            // Highlight nearby grid lines
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.3})`
            ctx.lineWidth = 1
            // horizontal
            ctx.beginPath()
            ctx.moveTo(x - gridSize / 2, y)
            ctx.lineTo(x + gridSize / 2, y)
            ctx.stroke()
            // vertical
            ctx.beginPath()
            ctx.moveTo(x, y - gridSize / 2)
            ctx.lineTo(x, y + gridSize / 2)
            ctx.stroke()
          }
        }
      }

      // Ambient floating particles
      const time = Date.now() * 0.001
      for (let i = 0; i < 6; i++) {
        const px = (Math.sin(time * 0.3 + i * 2.1) * 0.5 + 0.5) * w
        const py = (Math.cos(time * 0.2 + i * 1.7) * 0.5 + 0.5) * h
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, 120)
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.03)')
        gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.015)')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fillRect(px - 120, py - 120, 240, 240)
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 1 }}
    />
  )
}
