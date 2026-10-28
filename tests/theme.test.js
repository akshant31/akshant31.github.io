import test from 'node:test'
import assert from 'node:assert/strict'
import { initTheme, normalizeTheme, readStoredTheme } from '../src/theme.js'

function harness(saved = null) {
  const events = []
  const clickListeners = new Set()
  const storage = {
    value: saved,
    getItem() { return this.value },
    setItem(key, value) { assert.equal(key, 'akshant-portfolio-theme'); this.value = value },
  }
  const label = { textContent: '' }, icon = { textContent: '' }
  const toggle = {
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value },
    querySelector(selector) { return selector === '[data-theme-label]' ? label : icon },
    addEventListener(type, listener) { if (type === 'click') clickListeners.add(listener) },
    click() { for (const listener of clickListeners) listener() },
  }
  const root = { dataset: {}, style: {} }
  const meta = { attributes: {}, setAttribute(name, value) { this.attributes[name] = value } }
  const pageDocument = {
    documentElement: root,
    querySelector(selector) { return selector === '#theme-toggle' ? toggle : meta },
  }
  const browserWindow = {
    localStorage: storage,
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail } },
    dispatchEvent(event) { events.push(event) },
  }
  return { storage, toggle, label, icon, root, meta, events, init: () => initTheme({ pageDocument, browserWindow }) }
}

test('theme defaults to dark and rejects invalid saved values', () => {
  assert.equal(normalizeTheme('light'), 'light')
  assert.equal(normalizeTheme('blue'), 'dark')
  assert.equal(readStoredTheme(null), 'dark')
  assert.equal(readStoredTheme({ getItem() { throw new Error('denied') } }), 'dark')
  const view = harness('invalid')
  const theme = view.init()
  assert.equal(theme.getTheme(), 'dark')
  assert.equal(view.root.dataset.theme, 'dark')
  assert.equal(view.meta.attributes.content, '#05070B')
  theme.dispose()
})

test('toggle persists light mode, updates accessible state, and returns to dark', () => {
  const view = harness()
  const theme = view.init()
  view.toggle.click()
  assert.equal(theme.getTheme(), 'light')
  assert.equal(view.storage.value, 'light')
  assert.equal(view.root.style.colorScheme, 'light')
  assert.equal(view.meta.attributes.content, '#F6F3EC')
  assert.equal(view.toggle.attributes['aria-pressed'], 'true')
  assert.equal(view.toggle.attributes['aria-label'], 'Switch to dark theme')
  assert.equal(view.label.textContent, 'Light')
  assert.ok(view.events.some((event) => event.type === 'portfolio:theme' && event.detail.theme === 'light'))
  view.toggle.click()
  assert.equal(theme.getTheme(), 'dark')
  theme.dispose()
})

test('storage write failure leaves a working in-memory toggle', () => {
  const view = harness()
  view.storage.setItem = () => { throw new Error('denied') }
  const theme = view.init()
  assert.doesNotThrow(() => view.toggle.click())
  assert.equal(theme.getTheme(), 'light')
  theme.dispose()
})
