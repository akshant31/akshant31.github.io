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
