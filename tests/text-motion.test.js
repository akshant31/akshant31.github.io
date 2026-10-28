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
