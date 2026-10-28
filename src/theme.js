export const THEME_STORAGE_KEY = 'akshant-portfolio-theme'

export function normalizeTheme(value) {
  return value === 'light' ? 'light' : 'dark'
}

export function readStoredTheme(storage) {
  try { return normalizeTheme(storage?.getItem(THEME_STORAGE_KEY)) } catch { return 'dark' }
}

export function initTheme({ pageDocument = document, browserWindow = window, storage } = {}) {
  if (storage === undefined) {
    try { storage = browserWindow.localStorage } catch { storage = null }
  }
  const root = pageDocument.documentElement
  const toggle = pageDocument.querySelector('#theme-toggle')
  const themeColor = pageDocument.querySelector('meta[name="theme-color"]')
  const controller = new AbortController()
  let theme = readStoredTheme(storage)

  function setTheme(value, persist = true) {
    theme = normalizeTheme(value)
    root.dataset.theme = theme
    root.style.colorScheme = theme
    themeColor?.setAttribute('content', theme === 'light' ? '#F6F3EC' : '#05070B')
    if (toggle) {
      const next = theme === 'light' ? 'dark' : 'light'
      toggle.setAttribute('aria-pressed', String(theme === 'light'))
      toggle.setAttribute('aria-label', `Switch to ${next} theme`)
      const label = toggle.querySelector('[data-theme-label]')
      const icon = toggle.querySelector('[data-theme-icon]')
      if (label) label.textContent = theme === 'light' ? 'Light' : 'Dark'
      if (icon) icon.textContent = theme === 'light' ? '☀' : '☾'
    }
    if (persist) {
      try { storage?.setItem(THEME_STORAGE_KEY, theme) } catch { /* in-memory theme remains available */ }
    }
    browserWindow.dispatchEvent(new browserWindow.CustomEvent('portfolio:theme', { detail: { theme } }))
    return theme
  }

  toggle?.addEventListener('click', () => setTheme(theme === 'light' ? 'dark' : 'light'), { signal: controller.signal })
  setTheme(theme, false)
  return { getTheme: () => theme, setTheme, dispose: () => controller.abort() }
}
