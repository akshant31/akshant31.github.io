import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

test('desktop editorial text has dedicated particle-safe zones', () => {
  assert.match(css, /@media \(min-width: 821px\)[\s\S]*\.hero-role \{ top: 90px; \}/)
  assert.match(css, /@media \(min-width: 821px\)[\s\S]*\.scroll-cue \{ left: 0; transform: none; \}/)
  assert.match(css, /@media \(min-width: 821px\)[\s\S]*\.skills-tag \{ left: 0; transform: none; \}/)
  assert.match(css, /@media \(min-width: 821px\)[\s\S]*\.skill-tool-panels \{ left: 0; width: 180px; transform: none; \}/)
  assert.match(css, /@media \(min-width: 821px\)[\s\S]*\.contact \.section-heading \{ max-width: 280px; \}/)
  assert.match(css, /@media \(min-width: 821px\)[\s\S]*\.contact \.section-heading h2 \{ font-size: clamp\(3.2rem, 4.7vw, 5.5rem\); \}/)
  assert.match(css, /@media \(min-width: 821px\)[\s\S]*\.contact-links \{ right: auto; width: 280px; flex-direction: column; align-items: flex-start; gap: 12px; \}/)
  assert.match(css, /@media \(min-width: 821px\)[\s\S]*\.contact-email \{ font-size: clamp\(1.5rem, 2.4vw, 3rem\); \}/)
  assert.match(css, /@media \(min-width: 821px\)[\s\S]*\.site-footer \{ right: auto; width: 280px; flex-direction: column; gap: 6px; \}/)
})

test('narrow India experience rows clear the particle safe zone', () => {
  assert.match(css, /@media \(max-width: 360px\)[\s\S]*\.experience-list \{ bottom: -8px; \}/)
})

test('reduced motion removes reveal transition duration after global motion rules', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\n  html \{ scroll-behavior: auto; \}\n  \*, \*::before, \*::after \{[^}]+\}\n  \[data-reveal\] \{ transition: none !important; \}\n\}/)
})
