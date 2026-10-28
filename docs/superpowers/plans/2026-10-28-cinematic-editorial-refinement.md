# Cinematic Editorial Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the existing four-chapter particle portfolio with a PDF-faithful India outline, cinematic typography and chapter reveals, dark/light themes, collision-free responsive compositions, and a desktop comet pointer.

**Architecture:** Preserve the existing single 20,000-point morph buffer, 1,200-point ambient field, native scrolling, and editable scene. Add small DOM-only modules for theme preference, text motion, and the comet; update scene materials in place; keep the India correction reproducible through its existing SVG-to-JavaScript generator.

**Tech Stack:** Native JavaScript modules, Three.js 0.186.0, CSS, Node.js `node:test`, Python/Pillow map generator, existing Edit3D SDK and owned-process Chrome/CDP review harness.

## Global Constraints

- Work only on `feature/3d-data-portfolio`; never merge, deploy, change GitHub Pages, or modify `master`.
- Preserve exactly four chapters (`hero`, `experience`, `skills`, `contact`), morph indices `0`–`3`, and shortcuts `1`–`4`.
- Preserve exactly 20,000 main particles in one Points draw call and at most 1,200 ambient particles in one additional draw call.
- Preserve project id `akshant-data-universe`, artifact id `d655609d-2886-476c-9abe-f9dda9200f2a`, all professional facts/contact links, the half-body portrait, top-centered name, native scroll, keyboard/touch navigation, reduced motion, WebGL fallback, and editable scene.
- Keep the India source at `2807 × 3974`, with one closed `path#india-mainland`, absolute `M`/`L`/`Z`, one normalized ring, and the attribution `Derived from the user-supplied Indiamap.pdf; source rights were not independently established.` The PDF remains local and ignored.
- Dark is the default; the explicit choice persists under `akshant-portfolio-theme`. Light mode uses ivory `#F6F3EC`, normal particle blending, and deterministic cyan/violet/coral/gold particles without changing positions or draw calls.
- Use Bodoni Moda for display, Caveat only for accents such as `India.` and `next.`, Inter for body copy, and Fira Code for technical labels.
- Do not add scroll hijacking, internal Indian borders, map labels, an inset, third-party map geometry, cursive body copy, or a custom cursor for coarse pointers/reduced motion.
- Review both themes at `1440 × 900` and `390 × 844`, and every chapter at `320 × 740` and `768 × 1024`, using actual pixels and measured bounds. Stop every owned validation server/browser.
- Do not commit review scratch, the PDF, or generated comparison evidence not intended for the repository.

## File Structure

- `docs/reference/india-mainland-trace.svg`: manually reviewed source-space outer contour; the only hand-edited map geometry.
- `scripts/prepare-india-map.py`: existing deterministic validator/normalizer and preview generator.
- `src/data/india-outline.js`, `docs/reference/india-outline-preview.{svg,png}`: generated map outputs.
- `src/theme.js`: DOM theme preference, toggle state, storage failures, and `portfolio:theme` notifications; no Three.js import.
- `src/scene.js`: in-place dark/light palette, opacity, dust, background, and blending changes; exposes `setTheme(theme)`.
- `src/play.js`: forwards theme events and preserves light-mode opacity during animation.
- `src/text-motion.js`: chapter reveal state, stagger order, reduced-motion behavior, and cleanup.
- `src/comet-cursor.js`: fine-pointer gating, bounded 2D trail, visibility handling, and disposal.
- `src/site.js`: initializes and disposes the three DOM enhancements alongside existing navigation/selection.
- `src/framing.js`: normalized mobile/tablet subject safe zones; no particle-buffer changes.
- `index.html`, `src/styles.css`: theme control, fonts, accent markup, reveal hooks, safe-zone layouts, and comet overlay styling.
- `tests/*.test.js`: focused regression contracts plus preservation of the existing suite.
- `.superpowers/sdd/final-review/review.mjs`: uncommitted owned-process visual/interaction evidence harness.

---

### Task 1: Correct Northern Ladakh Without Redrawing India

**Files:**
- Modify: `docs/reference/india-mainland-trace.svg:3-48`
- Modify: `tests/india.test.js`
- Generate: `src/data/india-outline.js`, `docs/reference/india-outline-preview.svg`, `docs/reference/india-outline-preview.png`
- Review: `.superpowers/sdd/revision-map-trace/north-west-grid.jpg`, `.superpowers/sdd/revision-map-trace/review-arunachal.jpg`

**Interfaces:**
- Consumes: existing `read_trace()`, `normalize(points)`, and `write_outputs(ring)` in `scripts/prepare-india-map.py`.
- Produces: unchanged `INDIA_RINGS` export with one closed ring; no public API change.

- [ ] **Step 1: Add failing source-space boundary contracts**

Append to `tests/india.test.js`:

```js
test('northern Ladakh reaches the reviewed outer PDF stroke without changing the map contract', () => {
  const trace = readFileSync(new URL('../docs/reference/india-mainland-trace.svg', import.meta.url), 'utf8')
  const points = [...trace.matchAll(/[ML] (\d+) (\d+)/g)].map((match) => [Number(match[1]), Number(match[2])])
  const northern = points.filter(([x, y]) => x >= 500 && x <= 1230 && y <= 820)
  const ladakhEdge = points.filter(([x, y]) => x >= 1150 && x <= 1220 && y >= 540 && y <= 660)
  assert.ok(Math.min(...northern.map((point) => point[1])) <= 350, 'northern edge remains trimmed')
  assert.ok(Math.max(...ladakhEdge.map((point) => point[0])) >= 1210, 'right Ladakh edge remains trimmed')
  assert.ok(trace.includes('viewBox="0 0 2807 3974"'))
  assert.equal((trace.match(/id="india-mainland"/g) || []).length, 1)
  assert.ok(Math.max(...mainRing.map((point) => point[0])) >= 3.51, 'far-northeastern extent regressed')
})
```

- [ ] **Step 2: Verify the new contracts fail for the current trace**

Run: `node --test tests/india.test.js`
Expected: the existing ring tests pass; the new test fails with `northern edge remains trimmed` because the current minimum is `355`.

- [ ] **Step 3: Apply only the reviewed northern/right-edge point corrections**

In `docs/reference/india-mainland-trace.svg`, replace these exact source-space points at the outer dark PDF stroke; do not alter any other points:

```diff
-L 668 356
-L 700 355
-L 731 358
+L 668 351
+L 700 350
+L 731 353
```

```diff
-L 1200 567
-L 1195 587
-L 1204 604
-L 1199 627
-L 1186 648
+L 1207 567
+L 1204 587
+L 1210 604
+L 1208 627
+L 1195 648
```

Save the baseline outside the commit and verify locality:

```bash
git show HEAD:docs/reference/india-mainland-trace.svg > .superpowers/sdd/revision-map-trace/before-ladakh.svg
diff -u .superpowers/sdd/revision-map-trace/before-ladakh.svg docs/reference/india-mainland-trace.svg
```

Expected: only the eight listed `L` pairs differ; no inset, labels, internal boundaries, or new path appears.

- [ ] **Step 4: Regenerate and test the deterministic outputs**

Run: `python scripts/prepare-india-map.py && node --test tests/india.test.js`
Expected: `India: 1 manually reviewed ring, 570 points`; all India tests pass. If the source crop contradicts a proposed point, stop and report the PDF limitation rather than extending beyond the visible source.

- [ ] **Step 5: Inspect actual northern and northeastern pixels**

Run the existing overlay renderer:

```bash
python .superpowers/sdd/revision-map-trace/review_trace.py
```

Check `docs/reference/india-outline-preview.png` and `.superpowers/sdd/revision-map-trace/review-overview.jpg` at native crop resolution. Confirm the north/right Ladakh edge follows the supplied main-map outline and the far northeast remains closed and untrimmed. Read the generated images before accepting this step.

- [ ] **Step 6: Commit the isolated map correction**

```bash
git add docs/reference/india-mainland-trace.svg docs/reference/india-outline-preview.svg docs/reference/india-outline-preview.png src/data/india-outline.js tests/india.test.js
git commit -m "fix: restore northern India particle contour"
```

---

### Task 2: Add Persistent, Accessible Dark/Light Theme Control

**Files:**
- Create: `src/theme.js`, `tests/theme.test.js`
- Modify: `index.html:9-33`, `src/site.js:1-99`, `src/styles.css:1-43`, `tests/content.test.js`

**Interfaces:**
- Consumes: existing `initSite()` lifecycle and `#theme-toggle` markup.
- Produces: `normalizeTheme(value) → 'dark' | 'light'`, `readStoredTheme(storage) → 'dark' | 'light'`, `initTheme({ pageDocument, browserWindow, storage }) → { getTheme, setTheme, dispose }`; dispatches `portfolio:theme` with `{ detail: { theme } }`.

- [ ] **Step 1: Write failing preference and toggle tests**

Create `tests/theme.test.js`:

```js
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
```

Run: `node --test tests/theme.test.js`
Expected: FAIL because `../src/theme.js` does not exist.

- [ ] **Step 2: Implement the DOM-only theme module**

Create `src/theme.js`:

```js
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
```

Run: `node --test tests/theme.test.js`
Expected: three tests pass.

- [ ] **Step 3: Add the toggle markup and theme tokens**

Set `<html lang="en" data-theme="dark">`. Add after the navigation inside `.site-header`:

```html
<button class="theme-toggle" id="theme-toggle" type="button" aria-label="Switch to light theme" aria-pressed="false">
  <span data-theme-icon aria-hidden="true">☾</span><span data-theme-label>Dark</span>
</button>
```

Add Bodoni Moda and Caveat to the existing Google Fonts URL with `display=swap`; retain Inter and Fira Code. Add these root tokens and light overrides, preserving the existing dark values:

```css
:root {
  --display: 'Bodoni Moda', Georgia, serif;
  --cursive: 'Caveat', 'Segoe Print', cursive;
  --outline: rgba(237, 242, 244, 0.72);
  --edge-shade: linear-gradient(90deg, rgba(5, 7, 11, 0.82), transparent 28%, transparent 72%, rgba(5, 7, 11, 0.82)), linear-gradient(180deg, rgba(5, 7, 11, 0.55), transparent 22%, transparent 76%, rgba(5, 7, 11, 0.65));
  --scene-shade: radial-gradient(circle at 50% 46%, transparent 20%, rgba(5, 7, 11, 0.08) 55%, rgba(5, 7, 11, 0.38) 100%);
  --control-surface: rgba(5, 7, 11, 0.88);
  --comet: #b8f3ff;
}
:root[data-theme='light'] {
  color-scheme: light;
  --background: #f6f3ec;
  --text: #202a33;
  --muted: #4f5c65;
  --faint: #5c6870;
  --line: rgba(31, 49, 62, 0.24);
  --cyan: #006c80;
  --violet: #7135a7;
  --green: #0a6b42;
  --outline: rgba(32, 42, 51, 0.76);
  --edge-shade: linear-gradient(90deg, rgba(246, 243, 236, 0.78), transparent 28%, transparent 72%, rgba(246, 243, 236, 0.78)), linear-gradient(180deg, rgba(246, 243, 236, 0.42), transparent 22%, transparent 76%, rgba(246, 243, 236, 0.58));
  --scene-shade: radial-gradient(circle at 50% 46%, transparent 20%, rgba(246, 243, 236, 0.03) 55%, rgba(246, 243, 236, 0.22) 100%);
  --control-surface: rgba(246, 243, 236, 0.92);
  --comet: #6f358f;
}
```

Use `background: var(--edge-shade)` for `body::before`, `background: var(--scene-shade)` for `.scene-shade`, and `background: var(--control-surface)` for embedded controls. Add:

```css
.site-header { gap: 16px; }
.site-header button { pointer-events: auto; }
.theme-toggle { display: inline-flex; min-width: 78px; align-items: center; justify-content: center; gap: 8px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 999px; background: var(--control-surface); color: var(--text); font: 9px var(--mono); cursor: pointer; }
.theme-toggle [data-theme-icon] { color: var(--cyan); font-size: 16px; line-height: 1; }
.hero-name span:last-child, .location-heading h2 span { -webkit-text-stroke-color: var(--outline); }
```

- [ ] **Step 4: Initialize and dispose the theme with the site**

In `src/site.js`, import `initTheme` from `./theme.js`, create `const theme = initTheme()` beside `reducedMotion`, and call `theme.dispose()` in the returned `dispose()` before removing the `js` class. Add static checks in `tests/content.test.js` for `#theme-toggle`, `aria-pressed="false"`, `[data-theme-label]`, and `:root[data-theme='light']`.

- [ ] **Step 5: Verify theme unit tests and existing markup regressions**

Run: `node --test tests/theme.test.js tests/content.test.js`
Expected: all tests pass before the commit; the existing `760px` and hero-markup assertions still match at this stage.

- [ ] **Step 6: Commit the theme preference boundary**

```bash
git add index.html src/theme.js src/site.js src/styles.css tests/theme.test.js tests/content.test.js
git commit -m "feat: add persistent portfolio theme control"
```

---

### Task 3: Recolor the Existing Particle Scene In Place

**Files:**
- Modify: `src/scene.js:45-137`, `src/play.js:99-103,135-141,163-181,281-283`
- Create: `tests/scene-theme.test.js`

**Interfaces:**
- Consumes: `portfolio:theme` from Task 2; existing `createScene({ asset })` and `playPortfolio(context, objects, settings)`.
- Produces: `createScene({ asset, theme })` and `result.setTheme(theme)`; the scene, geometry, positions, settings object, and parameter groups retain identity.

- [ ] **Step 1: Write the failing no-recreation palette test**

Create `tests/scene-theme.test.js` with the existing `makeAsset()` pattern from `tests/scene.test.js` and:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { createScene } from '../src/scene.js'

function makeAsset() {
  const listeners = new Set()
  return {
    params: new Map(),
    register() {},
    registerParams(id, settings, schema) { this.params.set(id, { settings, schema }) },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
  }
}

test('light theme recolors and reblends the same buffers, then restores dark exactly', () => {
  const asset = makeAsset()
  const result = createScene({ asset })
  const particles = result.scene.getObjectByName('Particle Field')
  const dust = result.scene.getObjectByName('Ambient Dust')
  const geometry = particles.geometry
  const positions = geometry.attributes.position.array
  const darkColors = geometry.attributes.color.array.slice()
  result.setTheme('light')
  assert.equal(result.scene.getObjectByName('Particle Field'), particles)
  assert.equal(particles.geometry, geometry)
  assert.equal(particles.geometry.attributes.position.array, positions)
  assert.equal(particles.geometry.attributes.position.count, 20000)
  assert.equal(dust.geometry.attributes.position.count, 1200)
  assert.equal(particles.material.blending, THREE.NormalBlending)
  assert.equal(dust.material.blending, THREE.NormalBlending)
  assert.equal(result.scene.background.getHexString(), 'f6f3ec')
  assert.equal(particles.userData.baseOpacity, 0.88)
  assert.notDeepEqual(geometry.attributes.color.array, darkColors)
  assert.equal(asset.params.get('dataPalette').settings.cyan, '#00D4FF')
  assert.equal(asset.params.get('dataPalette').settings.violet, '#9D4EDD')
  result.setTheme('dark')
  assert.equal(particles.material.blending, THREE.AdditiveBlending)
  assert.deepEqual(geometry.attributes.color.array, darkColors)
  result.dispose()
})

test('invalid theme input falls back to dark without adding renderables', () => {
  const result = createScene({ asset: makeAsset(), theme: 'light' })
  result.setTheme('invalid')
  assert.equal(result.scene.background.getHexString(), '05070b')
  let renderables = 0
  result.scene.traverse((object) => { if (object.material) renderables += 1 })
  assert.equal(renderables, 2)
  result.dispose()
})
```

Run: `node --test tests/scene-theme.test.js`
Expected: FAIL because `result.setTheme` is not a function.

- [ ] **Step 2: Add the scene palette controller**

Change the signature to `createScene({ asset, theme = globalThis.document?.documentElement?.dataset?.theme || 'dark' })`. After the existing color declarations, add:

```js
const coralColor = new THREE.Color('#C64A33')
const goldColor = new THREE.Color('#A66A00')
let activeTheme = theme === 'light' ? 'light' : 'dark'
```

Replace `applyParams()` with:

```js
function applyParams() {
  const light = activeTheme === 'light'
  particleMaterial.size = settings.particleSize
  particleMaterial.color.set('#FFFFFF')
  particleMaterial.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending
  particleMaterial.opacity = light ? 0.88 : 0.94
  particleMaterial.needsUpdate = true
  particles.userData.theme = activeTheme
  particles.userData.baseOpacity = particleMaterial.opacity
  dust.material.blending = particleMaterial.blending
  dust.material.color.set(light ? '#657780' : '#6B8798')
  dust.material.opacity = light ? 0.30 : 0.22
  dust.material.needsUpdate = true
  scene.background.set(light ? '#F6F3EC' : '#05070B')
  baseColor.set(light ? '#344250' : '#E4EBF0')
  cyanColor.set(settings.cyan)
  violetColor.set(settings.violet)
  if (light) { cyanColor.multiplyScalar(0.50); violetColor.multiplyScalar(0.65) }
  const colors = particleGeometry.attributes.color
  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    let color
    if (light) {
      const band = index % 20
      color = band < 6 ? baseColor : band < 10 ? cyanColor : band < 14 ? violetColor : band < 18 ? coralColor : goldColor
    } else if (index < subject.indiaOutlineCount) {
      color = index % 5 === 0 ? cyanColor : baseColor
    } else {
      const band = index % 17
      color = band < 10 ? baseColor : band < 14 ? cyanColor : violetColor
    }
    colors.setXYZ(index, color.r, color.g, color.b)
  }
  colors.needsUpdate = true
}
function setTheme(nextTheme) {
  activeTheme = nextTheme === 'light' ? 'light' : 'dark'
  applyParams()
}
```

Return `setTheme` beside `scene`, `camera`, `play`, and `dispose`, and pass `setTheme` in the object supplied to `playPortfolio`. No new colors are allocated in the loop and no settings values are rewritten.

- [ ] **Step 3: Keep Play animation theme-aware**

In `src/play.js`:

```js
function onTheme(event) { objects.setTheme?.(event.detail?.theme) }
```

Register `browserWindow.addEventListener('portfolio:theme', onTheme, { signal })` with the other listeners. Replace the hard-coded animation base opacity with:

```js
const baseOpacity = particles.userData.baseOpacity ?? 0.94
particles.material.opacity = emphasisKind === 'experience' && mapWeight > 0 && !reducedMotion.matches
  ? baseOpacity - 0.04 + (Math.sin(time * 3) + 1) * 0.04 * mapWeight
  : baseOpacity
```

In `setEmphasis`, use the white multiplier in light mode so the darker multicolor particles are not washed out:

```js
particles.material.color.set(particles.userData.theme === 'light' ? '#FFFFFF' : emphasisKind ? '#E9FBFF' : '#FFFFFF')
```

- [ ] **Step 4: Run scene and motion regressions**

Run: `node --test tests/scene-theme.test.js tests/scene.test.js tests/visual-review.test.js tests/play.test.js`
Expected: all pass; existing dark colors, draw calls, counts, motion, and reduced-motion contracts remain intact.

- [ ] **Step 5: Commit the in-place scene theming**

```bash
git add src/scene.js src/play.js tests/scene-theme.test.js
git commit -m "feat: add vibrant light particle palette"
```

---

### Task 4: Add Cinematic Typography and Chapter Text Motion

**Files:**
- Modify: `index.html:13,40-100`, `src/styles.css`, `src/site.js`
- Create: `src/text-motion.js`, `tests/text-motion.test.js`
- Modify: `tests/content.test.js`

**Interfaces:**
- Consumes: existing `portfolio:section` events and `[data-reveal]` markup.
- Produces: `getTextMotionStates(current, next, count, reduced) → string[]`, `initTextMotion({ browserWindow, pageDocument }) → { dispose }`; section states are `pending`, `active`, or `exit`.

- [ ] **Step 1: Write failing reveal-state contracts**

Create `tests/text-motion.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { getTextMotionStates } from '../src/text-motion.js'

test('chapter activation enters once, recedes only the outgoing chapter, and hides inactive copies', () => {
  assert.deepEqual(getTextMotionStates(-1, 0, 4, false), ['active', 'pending', 'pending', 'pending'])
  assert.deepEqual(getTextMotionStates(0, 1, 4, false), ['exit', 'active', 'pending', 'pending'])
  assert.deepEqual(getTextMotionStates(1, 1, 4, false), ['pending', 'active', 'pending', 'pending'])
})

test('reduced motion makes every chapter immediately readable', () => {
  assert.deepEqual(getTextMotionStates(0, 2, 4, true), ['active', 'active', 'active', 'active'])
})
```

Run: `node --test tests/text-motion.test.js`
Expected: FAIL because the module does not exist.

- [ ] **Step 2: Implement reveal initialization, transitions, and cleanup**

Create `src/text-motion.js`:

```js
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
```

Run: `node --test tests/text-motion.test.js`
Expected: both tests pass.

- [ ] **Step 3: Add semantic reveal hooks and restrained accent markup**

Add `data-reveal` to the visible chapter tags, hero name/role/scroll cue, location heading, experience total and four experience articles, skills tag/groups/tool panel container, contact heading/links/footer. Do not add it to the `sr-only` skills heading. Change only the two accents:

```html
<header class="location-heading" data-reveal><p class="chapter-tag">02 / Coordinates</p><h2 id="experience-title">Based in<br><span class="accent-word">India.</span></h2></header>
```

```html
<header class="section-heading" data-reveal><p class="chapter-tag">04 / Meaningful output</p><h2 id="contact-title">Let's build<br>what's <span class="accent-word">next.</span></h2></header>
```

For the location and contact headers, mark the header element itself and do not separately mark its nested chapter tag; each visible element must be marked at most once. Initialize `const textMotion = initTextMotion()` after `setActive(0)` in `initSite`, import it, and call `textMotion.dispose()` in site cleanup.

- [ ] **Step 4: Add display type and non-conflicting reveal CSS**

Add:

```css
.hero-name, .location-heading h2, .contact .section-heading h2 {
  font-family: var(--display);
  font-weight: 500;
  letter-spacing: -0.045em;
}
.accent-word {
  color: var(--violet);
  -webkit-text-stroke: 0;
  font-family: var(--cursive);
  font-size: 1.12em;
  font-weight: 500;
  letter-spacing: -0.025em;
}
.text-motion-ready [data-reveal] {
  opacity: 1;
  translate: 0 0;
  clip-path: inset(-15% -5% -15% -5%);
  transition: opacity 420ms ease, translate 520ms cubic-bezier(0.22, 1, 0.36, 1), clip-path 520ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--reveal-order, 0) * 55ms);
}
.text-motion-ready .section[data-text-motion='pending'] [data-reveal] { opacity: 0; translate: 0 22px; clip-path: inset(0 0 100% 0); }
.text-motion-ready .section[data-text-motion='exit'] [data-reveal] { opacity: 0; translate: 0 -12px; clip-path: inset(0 0 100% 0); }
.text-motion-ready .section[data-text-motion='active'] [data-reveal] { opacity: 1; translate: 0 0; clip-path: inset(-15% -5% -15% -5%); }
@media (max-width: 820px) {
  .text-motion-ready [data-reveal] { transition-delay: calc(var(--reveal-order, 0) * 35ms); }
  .text-motion-ready .section[data-text-motion='pending'] [data-reveal] { translate: 0 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .text-motion-ready [data-reveal] { opacity: 1; translate: none; clip-path: none; transition: none; }
}
```

Using the separate `translate` property preserves the existing centered `transform` on the name and other elements. Default/no-JS CSS contains no hidden reveal state.

- [ ] **Step 5: Update content and contrast assertions**

In `tests/content.test.js`, update the exact hero assertion to `<h1 class="hero-name" id="hero-title" data-reveal><span>Akshant</span><span>Kumar</span></h1>`. Add assertions that Bodoni Moda/Caveat are loaded, `accent-word` occurs exactly twice, essential professional facts remain unchanged, and no `data-reveal` element has a `hidden` attribute. Extend the existing WCAG luminance helper to evaluate both root and `[data-theme='light']` blocks: require `4.5:1` for `text`, `muted`, `faint`, and `cyan`; require `3:1` for `violet` only because it is used for qualifying large display accents, never normal body text.

Run: `node --test tests/text-motion.test.js tests/content.test.js`
Expected: all tests pass; the unchanged `760px` assertions still match until Task 5 updates the implementation and tests together.

- [ ] **Step 6: Commit typography and reveal behavior**

```bash
git add index.html src/styles.css src/site.js src/text-motion.js tests/text-motion.test.js tests/content.test.js
git commit -m "feat: add cinematic typography and chapter reveals"
```

---

### Task 5: Separate Mobile Text and Particle Safe Zones

**Files:**
- Modify: `src/framing.js:8-13`, `src/play.js:40-65`, `src/styles.css:107-150`, `tests/framing.test.js`, `tests/content.test.js`

**Interfaces:**
- Consumes: existing `createChapterFrames(targets, options)` and theme/reveal markup.
- Produces: unchanged frame objects `{ x, y, scale }`; mobile/tablet layouts apply at widths `<= 820px`.

- [ ] **Step 1: Add failing normalized safe-zone tests**

In `tests/framing.test.js`, pass `mobile: viewport.width <= 820` in viewport-specific frame calls. Replace the directional `mobile[1].y > desktop[1].y` assertion with `assert.notEqual(mobile[1].y, desktop[1].y)`. Append:

```js
test('mobile subjects fit reserved vertical stages at narrow and tablet sizes', () => {
  for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 1024 }]) {
    const frames = createChapterFrames(targets, { ...viewport, mobile: true })
    const view = getViewSize(viewport)
    assert.ok(projectedY(frames[0], targets[0], 'max') <= view.halfHeight * 0.26 + 0.001, `hero enters text zone at ${viewport.width}`)
    const stages = [{ top: 0.32, bottom: -0.34 }, { top: 0.28, bottom: -0.40 }, { top: 0.24, bottom: -0.26 }]
    stages.forEach((stage, index) => {
      const top = projectedY(frames[index + 1], targets[index + 1], 'max')
      const bottom = projectedY(frames[index + 1], targets[index + 1], 'min')
      assert.ok(top <= stage.top * view.halfHeight + 0.001, `chapter ${index + 1} top escaped stage`)
      assert.ok(bottom >= stage.bottom * view.halfHeight - 0.001, `chapter ${index + 1} bottom escaped stage`)
    })
  }
})
```

Run: `node --test tests/framing.test.js`
Expected: FAIL because current mobile frames intrude into the reserved text zones.

- [ ] **Step 2: Replace only the mobile frame profiles and breakpoint**

Use:

```js
const MOBILE = Object.freeze([
  Object.freeze({ bottom: -1.08, top: 0.26, width: 0.98 }),
  Object.freeze({ bottom: -0.34, top: 0.32, width: 0.94 }),
  Object.freeze({ bottom: -0.40, top: 0.28, width: 0.94 }),
  Object.freeze({ bottom: -0.26, top: 0.24, width: 0.94 }),
])
```

Change both responsive checks in `src/play.js` from `width <= 760` to `width <= 820`. Desktop profiles and target geometry remain unchanged.

Run: `node --test tests/framing.test.js`
Expected: all framing tests pass.

- [ ] **Step 3: Replace the old mobile CSS with explicit text zones**

Change the `1080px` rule to hide `.nav-label` at `1080px` as before, then replace the entire `max-width: 760px` block with:

```css
@media (max-width: 820px) {
  :root { --page-padding: 20px; }
  body::before { background: var(--edge-shade); }
  .site-header { gap: 12px; padding-top: 14px; padding-bottom: 14px; }
  .brand-copy, .nav-label, .theme-toggle [data-theme-label] { display: none; }
  .section-nav { gap: 6px; }
  .section-nav a { min-width: 24px; justify-content: center; }
  .theme-toggle { min-width: 44px; width: 44px; padding: 0; }
  .scene-status { display: none; }
  .section { min-height: 100svh; padding: 84px var(--page-padding) 28px; }
  .section-inner { min-height: calc(100svh - 112px); }
  .hero-name { top: 0; left: 50%; flex-direction: column; gap: 0; transform: translateX(-50%); font-size: clamp(3.1rem, 12vw, 4.2rem); line-height: 0.88; white-space: normal; }
  .hero-tag { top: clamp(102px, 17vw, 130px); left: 0; }
  .hero-role { top: calc(clamp(102px, 17vw, 130px) + 34px); right: auto; bottom: auto; left: 0; font-size: 9px; }
  .scroll-cue { top: calc(clamp(102px, 17vw, 130px) + 68px); bottom: auto; left: 0; transform: none; }
  .scroll-cue span:last-child { display: none; }
  .location-heading { top: 0; max-width: 68%; }
  .location-heading h2, .contact .section-heading h2 { margin-top: 12px; font-size: clamp(2.8rem, 11vw, 4.6rem); }
  .experience-total { top: 1%; max-width: 32%; gap: 7px; }
  .experience-total strong { font-size: 2.8rem; }
  .experience-total span { max-width: 62px; font-size: 6px; }
  .experience-list { position: absolute; right: 0; bottom: 0; left: 0; display: grid; grid-template-columns: 1fr; }
  .experience-item { position: static; width: 100%; }
  .experience-select { display: grid; min-height: 54px; padding: 6px 0; grid-template-columns: minmax(0, 1fr) auto; align-items: center; column-gap: 10px; }
  .experience-company { font-size: 16px; }
  .experience-role { margin: 0; grid-column: 1; font-size: 8px; }
  .experience-date { margin: 0; grid-column: 2; grid-row: 1 / span 2; max-width: 94px; font-size: 7px; text-align: right; }
  .skills-tag { top: 0; }
  .skill-group { width: 44%; min-height: 48px; font-size: 15px; }
  .skill-group[data-skill-group='0'], .skill-group[data-skill-group='1'] { top: 36px; bottom: auto; }
  .skill-group[data-skill-group='2'], .skill-group[data-skill-group='3'] { top: auto; bottom: 96px; }
  .skill-tool-panels { bottom: 0; width: 100%; }
  .skill-tools { gap: 6px; }
  .skill-tools li { padding: 5px 7px; font-size: 8px; }
  .contact .section-heading { top: 0; }
  .contact-links { bottom: 82px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .contact-email { font-size: clamp(1.35rem, 6.5vw, 2rem); }
  .site-footer { flex-direction: column; gap: 6px; font-size: 6px; }
  .embedded-mode .scene-play-controls { right: 10px; bottom: 10px; left: 10px; flex-wrap: wrap; }
}
```

Update old `760px` assertions in `tests/content.test.js` and the review harness to `820px`. Do not claim overlap correction from these static rules alone.

- [ ] **Step 4: Run layout and content unit tests**

Run: `node --test tests/framing.test.js tests/content.test.js tests/theme.test.js tests/text-motion.test.js`
Expected: all pass.

- [ ] **Step 5: Commit responsive safe zones**

```bash
git add src/framing.js src/play.js src/styles.css tests/framing.test.js tests/content.test.js
git commit -m "fix: separate mobile text and particle stages"
```

---

### Task 6: Add a Fine-Pointer Falling-Star Comet

**Files:**
- Create: `src/comet-cursor.js`, `tests/comet-cursor.test.js`
- Modify: `src/site.js`, `src/styles.css`

**Interfaces:**
- Consumes: `(pointer: fine)`, `(prefers-reduced-motion: reduce)`, `--comet`, and the existing site lifecycle.
- Produces: `trimCometTrail(points, now, maxAge = 280, maxPoints = 24) → points[]`, `initCometCursor({ browserWindow, pageDocument }) → { dispose }`; one `.comet-cursor` canvas, no Three.js objects.

- [ ] **Step 1: Write failing trail and gating contracts**

Create `tests/comet-cursor.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { supportsComet, trimCometTrail } from '../src/comet-cursor.js'

test('trail removes expired points and bounds history to 24', () => {
  const points = Array.from({ length: 40 }, (_, index) => ({ x: index, y: index, time: index * 10 }))
  const trail = trimCometTrail(points, 400)
  assert.equal(trail.length, 24)
  assert.deepEqual(trail.at(-1), points.at(-1))
  assert.ok(trail.every((point) => 400 - point.time < 280))
  assert.equal(points.length, 40, 'caller history is not mutated')
})

test('comet requires fine pointer and no reduced-motion preference', () => {
  assert.equal(supportsComet(true, false), true)
  assert.equal(supportsComet(false, false), false)
  assert.equal(supportsComet(true, true), false)
})
```

Run: `node --test tests/comet-cursor.test.js`
Expected: FAIL because the module does not exist.

- [ ] **Step 2: Implement bounded drawing and complete lifecycle cleanup**

Create `src/comet-cursor.js`:

```js
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
```

Add to `src/styles.css`:

```css
.comet-cursor { position: fixed; inset: 0; z-index: 90; width: 100vw; height: 100vh; pointer-events: none; }
@media (pointer: fine) and (prefers-reduced-motion: no-preference) {
  html.comet-cursor-active body, html.comet-cursor-active a, html.comet-cursor-active button, html.comet-cursor-active canvas { cursor: none; }
}
```

Import and initialize `const cometCursor = initCometCursor()` beside the other site enhancements; call `cometCursor.dispose()` during site cleanup. The native cursor is hidden only after a working 2D context exists.

- [ ] **Step 3: Run pointer and navigation regressions**

Run: `node --test tests/comet-cursor.test.js tests/play.test.js tests/content.test.js`
Expected: all pass; existing pointer dissolution tests are unchanged.

- [ ] **Step 4: Commit the isolated comet enhancement**

```bash
git add src/comet-cursor.js src/site.js src/styles.css tests/comet-cursor.test.js
git commit -m "feat: add desktop falling-star pointer"
```

---

### Task 7: Verify Both Themes, All Viewports, Interactions, and Delivery

**Files:**
- Modify: `.superpowers/sdd/final-review/review.mjs` (review scratch; do not commit)
- Modify: `src/review.js` only with evidence actually observed
- Create: `.superpowers/sdd/cinematic-review/` evidence files (do not commit)

**Interfaces:**
- Consumes: all previous public contracts, `preview/` launcher, and the existing owned-process CDP harness.
- Produces: measured review evidence, a clean final gate, and matching local/remote feature-branch commit ids.

- [ ] **Step 1: Extend the owned-process review matrix**

Copy the existing harness to `.superpowers/sdd/cinematic-review/review.mjs` and adjust its `here`/`root` resolution and screenshot paths for the new directory. Preserve its `finally` cleanup and owned-process termination. Configure:

```js
const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
  narrow: { width: 320, height: 740 },
  tablet: { width: 768, height: 1024 },
}
const mobileBreakpoint = 820
```

Replace every `<= 760` expected-frame calculation with `<= mobileBreakpoint`. For `desktop` and `mobile`, capture every chapter first in dark and then light; for `narrow` and `tablet`, capture every chapter in dark. Before light captures, click `#theme-toggle`; assert `document.documentElement.dataset.theme === 'light'`, `matchMedia('(color-scheme: light)').matches`, `NormalBlending` numeric value `1`, identical scene/geometry object references, and 20,000/1,200 counts. Capture actual PNGs named by viewport/theme/chapter.

- [ ] **Step 2: Measure text/particle separation instead of accepting static CSS**

Extend `measureChapter()` to record `getBoundingClientRect()` for every visible `[data-reveal]`, the theme toggle, scroll cue, footer, and `subjectBounds`. For each viewport/chapter assert:

```js
const intersects = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
const particleRect = measurement.subjectBounds
const collisions = measurement.elements.filter(({ rect }) => rect && rect.opacity !== '0' && intersects(rect, particleRect))
check(`${viewportName}/${theme}/${chapter}: essential text clears particle subject`, collisions.length === 0, collisions)
check(`${viewportName}/${theme}/${chapter}: no horizontal overflow`, measurement.horizontalOverflow <= 0, measurement.horizontalOverflow)
check(`${viewportName}/${theme}/${chapter}: theme control is reachable`, measurement.themeToggle.withinViewport && measurement.themeToggle.centerReachable, measurement.themeToggle)
```

Because existing desktop editorial layouts intentionally place side text beside—not over—the subject, use the same intersection assertion for every chapter; if a desktop side element collides, adjust only its safe zone rather than exempting it. Also record pairwise text-rectangle intersections for header/name/role/cue, India heading/total/rows, skills controls/tools, and contact heading/actions/footer. Read every generated image; measured zero intersections alone is not visual approval.

- [ ] **Step 3: Verify theme persistence, storage failure, and keyboard operation**

In a real page:

```js
const beforeReload = await page.evaluate(`(() => { const scene = document.getElementById('app').edit3dPreview.getScene(); window.__themeScene = scene; return document.documentElement.dataset.theme })()`)
if (beforeReload !== 'light') await page.click('#theme-toggle')
await page.navigate(pageUrl(owned.serverPort))
await page.waitFor("document.documentElement.dataset.theme === 'light'")
check('Explicit light theme persists across reload', true)
await page.evaluate(`document.getElementById('theme-toggle').focus({ preventScroll: true }); true`)
const beforeKey = await page.evaluate(`({ theme: document.documentElement.dataset.theme, scrollY, url: location.href, focused: document.activeElement.id })`)
await page.key(' ', 'Space', 32)
const afterKey = await page.evaluate(`({ theme: document.documentElement.dataset.theme, scrollY, url: location.href, focused: document.activeElement.id })`)
check('Space operates the focused theme toggle without navigation or scroll jump', beforeKey.focused === 'theme-toggle' && afterKey.focused === 'theme-toggle' && beforeKey.theme !== afterKey.theme && beforeKey.scrollY === afterKey.scrollY && beforeKey.url === afterKey.url, { beforeKey, afterKey })
```

Create another page with this initialization script, then verify the toggle still switches root state:

```js
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  get() { throw new DOMException('Storage denied', 'SecurityError') },
})
```

Expected: dark default remains usable, explicit light survives reload, storage denial does not produce an uncaught error, and focus stays visible.

- [ ] **Step 4: Verify text reveals, reduced motion, no-JS, and WebGL fallback**

At each chapter, assert active reveal items reach computed opacity `1` and inactive sections do not restart on small scroll fluctuations. Under `prefers-reduced-motion: reduce`, assert all `[data-reveal]` computed opacity values are `1`, transition duration is `0s`, `.comet-cursor` is absent, and the existing exact particle-buffer/static-rig checks still pass. Disable script execution before a fresh navigation and confirm all four chapters and professional/contact text are present and visible; re-enable scripts afterward. Repeat the existing WebGL-disabled test in both themes and confirm the theme toggle still works.

- [ ] **Step 5: Verify comet pixels, gating, and disposal**

On a fine-pointer desktop, move through at least 12 diagonal points over 250 ms and capture the comet. Assert exactly one `.comet-cursor`, `pointer-events: none`, canvas dimensions no greater than twice CSS dimensions, and computed `cursor: none` on body. Stop moving for 350 ms and assert its 2D pixels are cleared. Emulate coarse pointer and reduced motion separately; assert no overlay and native cursor restoration. In a review page, dynamically import the module, create a second owned cursor, call its `dispose()`, and confirm its canvas/listeners/frame are removed; dispose that owned instance before continuing. Confirm existing pointer dissolution and damped return still pass.

- [ ] **Step 6: Reinspect the India scene and editable project**

Compare the actual India chapter at desktop/mobile against the northern PDF crop and far-northeastern review crop. Verify the corrected northern/right Ladakh edge is visible as particles, the outline remains closed/north-up, and there are no internal boundaries/inset artifacts. Load `/?edit=1` and confirm project/artifact ids, all registered objects and parameter groups, editable size/motion/palette behavior, and the unchanged two point-field draw calls.

- [ ] **Step 7: Run the complete automated gate and save actual output**

```bash
npm test && npm run check && npm run build && git diff --check
```

Expected: all tests pass; Edit3D check and production build succeed; whitespace check succeeds. Record the actual test count and any existing nonfatal Draco/Basis/chunk warnings in `.superpowers/sdd/cinematic-review/final-gate.txt`. Do not suppress failures or describe warnings as fatal errors.

- [ ] **Step 8: Update editable review evidence and commit only verified work**

Replace stale claims in `src/review.js` only after their corresponding real checks pass. Use nonnumeric gate wording to avoid stale counts:

```js
{
  name: 'Automated regression and production gate',
  status: 'passed',
  evidence: 'Final gate: npm test, Edit3D compile check, production build, and git diff --check passed on 2026-10-28; actual counts and warnings are recorded in the local cinematic-review evidence.',
},
```

Add separate entries for the corrected PDF-derived northern contour, both theme reviews, four viewport families, reveal/reduced-motion/no-JS behavior, comet gating/cleanup, and preserved navigation/selection/pointer/editability. Every numeric statement must come from the new measurement JSON. Commit source/tests/review evidence code, never `.superpowers`:

```bash
git add index.html src tests docs/reference/india-mainland-trace.svg docs/reference/india-outline-preview.svg docs/reference/india-outline-preview.png scripts/prepare-india-map.py
git commit -m "feat: complete cinematic editorial portfolio refinement"
```

If all changes are already committed, do not create an empty commit.

- [ ] **Step 9: Push only the feature branch and verify delivery state**

```bash
git push origin feature/3d-data-portfolio
git status --short --branch
test "$(git rev-parse HEAD)" = "$(git rev-parse '@{upstream}')"
git rev-parse HEAD
git rev-parse master
```

Expected: clean feature branch; local and upstream HEAD match; `master` remains unchanged. Confirm no owned npm/Node/Vite/Chrome review process remains. Deliver the absolute `preview/` root followed by `[Preview immersive 3D portfolio](http://localhost:7100/)`; do not leave a temporary server running.
