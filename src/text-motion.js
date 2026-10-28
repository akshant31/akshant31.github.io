export function getTextMotionStates(current, next, count, reduced = false) {
  return Array.from({ length: count }, (_, index) => {
    if (reduced || index === next) return 'active'
    return index === current ? 'exit' : 'pending'
  })
}

export function initTextMotion({ browserWindow = window, pageDocument = document } = {}) {
  const root = pageDocument.documentElement
  const sections = [...pageDocument.querySelectorAll('.section[data-morph]')]
  const reducedMotion = browserWindow.matchMedia('(prefers-reduced-motion: reduce)')
  const controller = new AbortController()
  const { signal } = controller
  let current = -1
  let frame = 0

  for (const section of sections) {
    section.querySelectorAll('[data-reveal]').forEach((item, index) => item.style.setProperty('--reveal-order', index))
  }
  function activate(next) {
    if (!Number.isInteger(next) || next < 0 || next >= sections.length) return
    const states = getTextMotionStates(current, next, sections.length, reducedMotion.matches)
    sections.forEach((section, index) => { section.dataset.textMotion = states[index] })
    current = next
  }
  function onSection(event) { activate(event.detail?.index) }
  function syncMotion() {
    browserWindow.cancelAnimationFrame(frame)
    root.classList.toggle('text-motion-ready', !reducedMotion.matches)
    current = -1
    const active = Math.max(0, sections.findIndex((section) => section.id === pageDocument.body.dataset.section))
    sections.forEach((section) => { section.dataset.textMotion = reducedMotion.matches ? 'active' : 'pending' })
    if (!reducedMotion.matches) frame = browserWindow.requestAnimationFrame(() => activate(active))
  }

  browserWindow.addEventListener('portfolio:section', onSection, { signal })
  reducedMotion.addEventListener('change', syncMotion, { signal })
  syncMotion()
  return {
    dispose() {
      controller.abort()
      browserWindow.cancelAnimationFrame(frame)
      root.classList.remove('text-motion-ready')
      for (const section of sections) {
        delete section.dataset.textMotion
        section.querySelectorAll('[data-reveal]').forEach((item) => item.style.removeProperty('--reveal-order'))
      }
    },
  }
}
