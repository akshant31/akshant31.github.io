export function supportsComet(finePointer, reducedMotion) {
  return finePointer && !reducedMotion
}

export function trimCometTrail(points, now, maxAge = 280, maxPoints = 24) {
  return points.filter((point) => now - point.time < maxAge).slice(-maxPoints)
}

export function initCometCursor({ browserWindow = window, pageDocument = document } = {}) {
  const finePointer = browserWindow.matchMedia('(pointer: fine)')
  const reducedMotion = browserWindow.matchMedia('(prefers-reduced-motion: reduce)')
  const controller = new AbortController()
  const { signal } = controller
  const root = pageDocument.documentElement
  let canvas = null, context = null, frame = 0, width = 0, height = 0
  let points = []
  let color = '#B8F3FF'

  function clearTrail() {
    points = []
    browserWindow.cancelAnimationFrame(frame)
    frame = 0
    if (context) context.clearRect(0, 0, width, height)
  }
  function disable() {
    clearTrail()
    root.classList.remove('comet-cursor-active')
    canvas?.remove()
    canvas = null
    context = null
  }
  function resize() {
    if (!canvas || !context) return
    width = browserWindow.innerWidth
    height = browserWindow.innerHeight
    const ratio = Math.min(2, browserWindow.devicePixelRatio || 1)
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
  }
  function readColor() {
    color = browserWindow.getComputedStyle(root).getPropertyValue('--comet').trim() || '#B8F3FF'
  }
  function render(now) {
    frame = 0
    if (!context) return
    points = trimCometTrail(points, now)
    context.clearRect(0, 0, width, height)
    context.lineCap = 'round'
    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1], point = points[index]
      context.globalAlpha = Math.max(0, 1 - (now - point.time) / 280) * (index / points.length) * 0.7
      context.strokeStyle = color
      context.lineWidth = 0.5 + index / points.length * 2
      context.beginPath()
      context.moveTo(previous.x, previous.y)
      context.lineTo(point.x, point.y)
      context.stroke()
    }
    const head = points.at(-1)
    if (head) {
      context.save()
      context.translate(head.x, head.y)
      context.rotate(Math.PI / 4)
      context.globalAlpha = Math.max(0, 1 - (now - head.time) / 280)
      context.fillStyle = color
      context.shadowColor = color
      context.shadowBlur = 12
      context.fillRect(-2.5, -2.5, 5, 5)
      context.restore()
    }
    context.globalAlpha = 1
    if (points.length) frame = browserWindow.requestAnimationFrame(render)
  }
  function onPointerMove(event) {
    if (!context || event.pointerType === 'touch') return
    points.push({ x: event.clientX, y: event.clientY, time: browserWindow.performance.now() })
    points = points.slice(-24)
    if (!frame) frame = browserWindow.requestAnimationFrame(render)
  }
  function onVisibility() { if (pageDocument.hidden) clearTrail() }
  function sync() {
    disable()
    if (!supportsComet(finePointer.matches, reducedMotion.matches)) return
    canvas = pageDocument.createElement('canvas')
    canvas.className = 'comet-cursor'
    canvas.setAttribute('aria-hidden', 'true')
    context = canvas.getContext('2d')
    if (!context) { canvas = null; return }
    pageDocument.body.append(canvas)
    root.classList.add('comet-cursor-active')
    resize()
    readColor()
  }

  browserWindow.addEventListener('pointermove', onPointerMove, { signal, passive: true })
  browserWindow.addEventListener('pointerleave', clearTrail, { signal })
  browserWindow.addEventListener('resize', resize, { signal, passive: true })
  browserWindow.addEventListener('portfolio:theme', readColor, { signal })
  pageDocument.addEventListener('visibilitychange', onVisibility, { signal })
  finePointer.addEventListener('change', sync, { signal })
  reducedMotion.addEventListener('change', sync, { signal })
  sync()
  return { dispose() { controller.abort(); disable() } }
}
