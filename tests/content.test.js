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
  assert.ok(css.includes('rgba(5, 7, 11, 0.82)'))
  assert.ok(css.includes('rgba(5, 7, 11, 0.65)'))
})

test('mobile scene status cannot obscure scrolling portfolio content', () => {
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.scene-status\s*\{[^}]*display:\s*none;/)
})

test('skill panels are readable before JavaScript and enhanced after initialization', () => {
  const site = readFileSync(new URL('../src/site.js', import.meta.url), 'utf8')
  assert.ok(!/<ul class="skill-tools"[^>]*hidden/.test(html))
  for (let index = 0; index < 4; index += 1) {
    assert.ok(html.includes(`aria-controls="skill-tools-${index}"`))
    assert.ok(html.includes(`data-skill-tools="${index}"`))
  }
  assert.ok(site.includes('panel.hidden = Number(panel.dataset.skillTools) !== index'))
  assert.ok(site.includes("document.documentElement.classList.add('js')"))
})

test('immersive layout uses full viewport scenes and centered-edge composition', () => {
  assert.ok(css.includes('min-height: 100svh'))
  assert.ok(css.includes('left: 50%'))
  assert.ok(css.includes('grid-template-columns: 1fr'))
  assert.ok(css.includes('.experience-list'))
  assert.ok(css.includes('.chapter-progress'))
  assert.ok(!css.includes('min-height: 175svh'))
})

test('hero name stays top centered in base and mobile rules', () => {
  const rules = css.match(/\.hero-name\s*\{[^}]*\}/g) || []
  assert.ok(rules.length >= 2, 'missing base or mobile hero-name rule')
  for (const rule of rules) {
    assert.match(rule, /top:\s*0;/)
    assert.match(rule, /left:\s*50%;/)
    assert.match(rule, /translateX\(-50%\)/)
    assert.doesNotMatch(rule, /bottom:/)
  }
  assert.equal((html.match(/<h1\b/g) || []).length, 1)
  assert.ok(html.includes('<h1 class="hero-name" id="hero-title"><span>Akshant</span><span>Kumar</span></h1>'))
})

test('compact chapter navigation keeps meaningful accessible names', () => {
  const navigation = html.match(/<nav class="section-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || ''
  const links = [...navigation.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map((match) => match[0])
  assert.equal(links.length, 4)
  const accessibleNames = links.map((link) => link.match(/aria-label="([^"]+)"/)?.[1])
  assert.deepEqual(accessibleNames, ['Boy chapter', 'India chapter', 'Skills chapter', 'Contact chapter'])
})

test('faint text token meets WCAG AA contrast on the base background', () => {
  const readColor = (token) => {
    const value = css.match(new RegExp(`--${token}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1]
    assert.ok(value, `missing color token: ${token}`)
    return value
  }
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/.{2}/g).map((channel) => parseInt(channel, 16) / 255)
    const [red, green, blue] = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    return red * 0.2126 + green * 0.7152 + blue * 0.0722
  }
  const foreground = luminance(readColor('faint'))
  const background = luminance(readColor('background'))
  const contrast = (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
  assert.ok(contrast >= 4.5, `--faint contrast ${contrast.toFixed(3)}:1 must meet WCAG AA`)
})
