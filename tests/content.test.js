import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SECTIONS } from '../src/content.js'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

test('section metadata matches the five morph states', () => {
  assert.deepEqual(SECTIONS.map((section) => section.id), ['hero', 'about', 'skills', 'experience', 'contact'])
  SECTIONS.forEach((section, index) => {
    assert.equal(section.morph, index)
    assert.ok(html.includes(`id="${section.id}" data-morph="${index}"`))
  })
})

test('portfolio preserves the approved professional facts and contacts', () => {
  for (const fact of [
    'Akshant Kumar',
    'Data Engineer',
    '7+ years',
    'Ametris',
    'Jan 2025 - Present',
    'Biofourmis',
    'Dec 2021 - Dec 2024',
    'Tribes.AI',
    'Mar 2021 - Nov 2021',
    'Infosys',
    'Nov 2017 - Feb 2021',
    'akst31@yahoo.com',
    'https://github.com/akshant31',
    'Apache Spark',
    'Apache Kafka',
    'Apache Airflow',
    'Redshift',
    'Tableau',
  ]) assert.ok(html.includes(fact), `missing portfolio fact: ${fact}`)
  assert.ok(!/lorem ipsum/i.test(html))
})

test('responsive, reduced-motion, focus, and fallback styles exist', () => {
  assert.ok(css.includes('@media (max-width: 760px)'))
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'))
  assert.ok(css.includes(':focus-visible'))
  assert.ok(css.includes('[data-webgl="unavailable"]'))
  assert.ok(css.includes('44px'))
})
