import test from 'node:test'
import assert from 'node:assert/strict'
import { createShapeTargets, seededRandom, SECTION_IDS } from '../src/shapes.js'
import { getMorphFrame } from '../src/morph.js'

test('seeded random produces a repeatable bounded sequence', () => {
  const a = seededRandom(31)
  const b = seededRandom(31)
  const values = Array.from({ length: 20 }, () => a())
  assert.deepEqual(values, Array.from({ length: 20 }, () => b()))
  assert.ok(values.every((value) => value >= 0 && value < 1))
  assert.ok(new Set(values).size > 10)
})

test('five deterministic finite shapes are generated', () => {
  const a = createShapeTargets(120)
  const b = createShapeTargets(120)
  assert.equal(a.length, SECTION_IDS.length)
  a.forEach((shape) => {
    assert.ok(shape instanceof Float32Array)
    assert.equal(shape.length, 360)
    assert.ok(shape.every(Number.isFinite))
    assert.ok(shape.every((value) => Math.abs(value) <= 20))
  })
  assert.deepEqual(a, b)
  for (let index = 1; index < a.length; index += 1) {
    assert.notDeepEqual(a[index - 1], a[index])
  }
})

test('particle count must be a positive integer', () => {
  for (const count of [0, -1, 1.5, NaN]) {
    assert.throws(() => createShapeTargets(count), /INVALID_PARTICLE_COUNT/)
  }
})

test('morph frames clamp and interpolate at section boundaries', () => {
  assert.deepEqual(getMorphFrame(-1), { from: 0, to: 0, mix: 0 })
  assert.deepEqual(getMorphFrame(0), { from: 0, to: 0, mix: 0 })
  assert.deepEqual(getMorphFrame(0.25), { from: 0, to: 1, mix: 0.25 })
  assert.deepEqual(getMorphFrame(1.5), { from: 1, to: 2, mix: 0.5 })
  assert.deepEqual(getMorphFrame(4), { from: 4, to: 4, mix: 0 })
  assert.deepEqual(getMorphFrame(9), { from: 4, to: 4, mix: 0 })
  assert.deepEqual(getMorphFrame(NaN), { from: 0, to: 0, mix: 0 })
})
