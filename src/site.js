import { SECTIONS } from './content.js'

export function initSite({ onSection, onEmphasis } = {}) {
  const controller = new AbortController()
  const { signal } = controller
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const sections = SECTIONS.map(({ id }) => document.getElementById(id))
  const navLinks = [...document.querySelectorAll('[data-nav-link]')]
  const skillPanels = [...document.querySelectorAll('[data-skill-tools]')]
  const progressFill = document.getElementById('chapter-progress-fill')
  const visibility = SECTIONS.map(() => 0)
  let activeIndex = -1

  function emitSection(index) {
    const detail = { index }
    onSection?.(detail)
    window.dispatchEvent(new CustomEvent('portfolio:section', { detail }))
  }

  function setSkillPanel(index) {
    for (const panel of skillPanels) panel.hidden = Number(panel.dataset.skillTools) !== index
  }

  function setActive(index, force = false) {
    if (!Number.isInteger(index) || index < 0 || index >= SECTIONS.length) return
    if (index === activeIndex && !force) return
    activeIndex = index
    document.body.dataset.section = SECTIONS[index].id
    if (progressFill) progressFill.style.transform = `scaleX(${(index + 1) / SECTIONS.length})`
    for (const link of navLinks) {
      if (Number(link.dataset.navLink) === index) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    }
    emitSection(index)
  }

  function goTo(index) {
    const section = sections[index]
    if (!section) return
    setActive(index, true)
    section.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' })
  }

  for (const link of navLinks) {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      goTo(Number(link.dataset.navLink))
    }, { signal })
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const index = sections.indexOf(entry.target)
      if (index >= 0) visibility[index] = entry.isIntersecting ? entry.intersectionRatio : 0
    }
    let bestIndex = 0
    for (let index = 1; index < visibility.length; index += 1) {
      if (visibility[index] > visibility[bestIndex]) bestIndex = index
    }
    if (visibility[bestIndex] > 0) setActive(bestIndex)
  }, { threshold: [0.15, 0.35, 0.55, 0.75], rootMargin: '-12% 0px -28% 0px' })
  sections.forEach((section) => section && observer.observe(section))

  function bindEmphasis(selector, kind) {
    const items = [...document.querySelectorAll(selector)]
    items.forEach((item, index) => {
      item.addEventListener('click', () => {
        const group = kind === 'skill' ? '[data-skill-group]' : '.experience-select'
        for (const candidate of document.querySelectorAll(group)) {
          candidate.classList.toggle('is-active', candidate === item)
          candidate.setAttribute('aria-pressed', String(candidate === item))
          if (kind === 'experience') candidate.closest('.experience-item')?.classList.toggle('is-active', candidate === item)
        }
        if (kind === 'skill') setSkillPanel(index)
        const detail = { kind, index }
        onEmphasis?.(detail)
        window.dispatchEvent(new CustomEvent('portfolio:emphasis', { detail }))
      }, { signal })
    })
  }

  bindEmphasis('[data-skill-group]', 'skill')
  bindEmphasis('.experience-select', 'experience')
  setSkillPanel(0)
  document.documentElement.classList.add('js')
  const year = document.getElementById('current-year')
  if (year) year.textContent = String(new Date().getFullYear())
  setActive(0)

  return {
    goTo,
    dispose() {
      observer.disconnect()
      controller.abort()
      document.documentElement.classList.remove('js')
      for (const panel of skillPanels) panel.hidden = false
    },
  }
}
