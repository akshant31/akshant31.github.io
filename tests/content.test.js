import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SECTIONS } from '../src/content.js'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const renderedText = html
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

test('section metadata matches four semantic chapters', () => {
  assert.deepEqual(SECTIONS.map((section) => section.id), ['hero', 'experience', 'skills', 'contact'])
  assert.equal((html.match(/<section\b/g) || []).length, 4)
  assert.ok(!html.includes('id="about"'))
  SECTIONS.forEach((section, index) => {
    assert.equal(section.morph, index)
    assert.ok(html.includes(`id="${section.id}" data-morph="${index}"`))
  })
})

test('portfolio preserves the approved professional facts and contacts', () => {
  for (const fact of [
    'Akshant Kumar', 'Data Engineer', 'Based in India', '7+ years',
    'Ametris', 'Jan 2025 - Present', 'Biofourmis', 'Dec 2021 - Dec 2024',
    'Tribes.AI', 'Mar 2021 - Nov 2021', 'Infosys', 'Nov 2017 - Feb 2021',
    'akst31@yahoo.com', 'Apache Spark', 'Apache Kafka', 'Apache Airflow',
    'Redshift', 'Tableau',
  ]) assert.ok(renderedText.includes(fact), `missing portfolio fact: ${fact}`)
  assert.ok(html.includes('href="https://github.com/akshant31"'), 'missing portfolio contact: https://github.com/akshant31')
  assert.ok(!/lorem ipsum/i.test(html))
})

test('responsive, reduced-motion, focus, and fallback styles exist', () => {
  assert.ok(css.includes('@media (max-width: 760px)'))
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'))
  assert.ok(css.includes(':focus-visible'))
  assert.ok(css.includes('[data-webgl="unavailable"]'))
  assert.ok(css.includes('44px'))
})

test('scene overlays preserve text contrast without hiding the data universe', () => {
  assert.ok(css.includes('rgba(11, 13, 18, 0.05) 67%'))
  assert.ok(css.includes('rgba(11, 13, 18, 0.16) 100%'))
  assert.ok(css.includes('rgba(11, 13, 18, 0.22) 100%'))
})

test('mobile scene status cannot obscure scrolling portfolio content', () => {
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.scene-status \{\n    display: none;\n  \}/)
})
