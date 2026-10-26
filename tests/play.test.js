import test from 'node:test'
import assert from 'node:assert/strict'
import { damp, getMorphFrame, progressFromOffsets, sampleMorph } from '../src/morph.js'
import { createScene } from '../src/scene.js'
import { createShapeTargets, PARTICLE_COUNT } from '../src/shapes.js'
import { createProject } from '../src/project.js'

function makeAsset() {
  return {
    register() {},
    registerParams() {},
    subscribe() { return () => {} },
  }
}

function makeContext() {
  return {
    canvas: { addEventListener() {}, focus() {} },
    container: { append() {}, replaceChildren() {}, ownerDocument: null },
    signal: { aborted: false, addEventListener() {} },
  }
}

test('damp approaches the target without overshooting', () => {
  const value = damp(0, 1, 4, 0.25)
  assert.ok(Math.abs(value - (1 - Math.exp(-1))) < 1e-12)
  assert.equal(damp(2, 1, 0, 0.25), 2)
})

test('scroll offsets map to continuous section progress', () => {
  const offsets = [0, 1000, 2000, 3500]
  assert.equal(progressFromOffsets(offsets, -10), 0)
  assert.equal(progressFromOffsets(offsets, 500), 0.5)
  assert.equal(progressFromOffsets(offsets, 1500), 1.5)
  assert.equal(progressFromOffsets(offsets, 2750), 2.5)
  assert.equal(progressFromOffsets(offsets, 7000), 3)
  assert.throws(() => progressFromOffsets([0, 0], 10), /INVALID_SECTION_OFFSETS/)
})

test('sampleMorph interpolates into the supplied output array', () => {
  const targets = [new Float32Array([0, 0, 0, 10, 10, 10]), new Float32Array([10, 20, 30, 20, 40, 60])]
  const output = new Float32Array(6)
  const result = sampleMorph(targets, { from: 0, to: 1, mix: 0.5 }, output)
  assert.equal(result, output)
  assert.deepEqual([...output], [5, 10, 15, 15, 25, 35])
})

test('project exposes the real portfolio scene', () => {
  const project = createProject()
  assert.equal(project.id, 'akshant-data-universe')
  assert.equal(project.defaultSceneId, 'main')
  assert.equal(project.scenes.length, 1)
  assert.equal(typeof project.scenes[0].createScene, 'function')
})

test('Play morphs the real particle buffer toward the selected chapter', async () => {
  const asset = makeAsset()
  const scene = createScene({ asset })
  const play = await scene.play(makeContext())
  const particles = scene.scene.getObjectByName('Particle Field')
  const initial = [...particles.geometry.attributes.position.array.slice(0, 30)]
  const initialVersion = particles.geometry.attributes.position.version
  const targets = createShapeTargets(PARTICLE_COUNT)
  play.setProgress(1)
  for (let frame = 0; frame < 300; frame += 1) play.update(1 / 60)
  const current = particles.geometry.attributes.position.array
  assert.notDeepEqual([...current.slice(0, 30)], initial)
  for (let index = 0; index < 30; index += 1) {
    assert.ok(Math.abs(current[index] - targets[1][index]) < 0.08)
  }
  assert.ok(particles.geometry.attributes.position.version > initialVersion)
  play.setProgress(99)
  for (let frame = 0; frame < 300; frame += 1) play.update(1 / 60)
  for (let index = 0; index < 30; index += 1) {
    assert.ok(Math.abs(current[index] - targets[3][index]) < 0.08)
  }
  play.dispose()
  scene.dispose()
})

test('curved morphs are bounded and exact at both endpoints', () => {
  const targets = [new Float32Array([0, 0, 0, 1, 1, 1]), new Float32Array([2, 4, 6, 3, 5, 7])]
  const phases = new Float32Array([0, 0.5])
  const output = new Float32Array(6)
  sampleMorph(targets, { from: 0, to: 1, mix: 0 }, output, phases)
  assert.deepEqual(output, targets[0])
  sampleMorph(targets, { from: 0, to: 1, mix: 1 }, output, phases)
  assert.deepEqual(output, targets[1])
  sampleMorph(targets, { from: 0, to: 1, mix: 0.5 }, output, phases)
  assert.ok(output.every(Number.isFinite))
  assert.notDeepEqual([...output], [1, 2, 3, 2, 3, 4])
  assert.ok([...output].every((value) => Math.abs(value) <= 8))
})

test('hidden playback writes nothing and resumes with zero motion delta', async () => {
  const reducedMotion = { matches: false, addEventListener() {} }
  const browserWindow = { matchMedia: () => reducedMotion, addEventListener() {}, innerWidth: 1200, scrollY: 0 }
  const doc = {
    hidden: false,
    body: { classList: { contains: () => true } },
    defaultView: browserWindow,
    createElement: () => ({ setAttribute() {}, addEventListener() {}, append() {}, remove() {} }),
    addEventListener() {},
  }
  const context = {
    canvas: { addEventListener() {}, focus() {} },
    container: { append() {}, replaceChildren() {}, ownerDocument: doc },
    signal: { aborted: false, addEventListener() {} },
  }
  const result = createScene({ asset: makeAsset() })
  const play = await result.play(context)
  const particles = result.scene.getObjectByName('Particle Field')
  const dust = result.scene.getObjectByName('Ambient Dust')
  play.update(0)
  const version = particles.geometry.attributes.position.version
  doc.hidden = true
  play.update(1)
  assert.equal(particles.geometry.attributes.position.version, version)
  doc.hidden = false
  play.update(1)
  assert.equal(dust.rotation.y, 0)
  play.update(1)
  assert.ok(dust.rotation.y > 0)
  play.dispose()
  result.dispose()
})

test('live reduced-motion activation snaps fractional morphs to a static chapter target', async () => {
  let onReducedMotionChange
  const reducedMotion = {
    matches: false,
    addEventListener(type, listener) {
      if (type === 'change') onReducedMotionChange = listener
    },
  }
  const browserWindow = { matchMedia: () => reducedMotion, addEventListener() {}, innerWidth: 1200, scrollY: 0 }
  const doc = {
    hidden: false,
    body: { classList: { contains: () => true } },
    defaultView: browserWindow,
    createElement: () => ({ setAttribute() {}, addEventListener() {}, append() {}, remove() {} }),
    addEventListener() {},
  }
  const context = {
    canvas: { addEventListener() {}, focus() {} },
    container: { append() {}, replaceChildren() {}, ownerDocument: doc },
    signal: { aborted: false, addEventListener() {} },
  }
  const result = createScene({ asset: makeAsset() })
  const play = await result.play(context)
  try {
    const particles = result.scene.getObjectByName('Particle Field')
    const current = particles.geometry.attributes.position.array
    const targets = createShapeTargets(PARTICLE_COUNT)
    assert.equal(typeof onReducedMotionChange, 'function')
    play.setProgress(0.5)
    play.update(0.1)
    assert.ok(current.some((value, index) => value !== targets[1][index]))

    reducedMotion.matches = true
    onReducedMotionChange({ matches: true })
    play.update(1)
    assert.ok(current.every((value, index) => value === targets[1][index]), 'reduced motion must snap to the exact chapter target')

    const snapped = new Float32Array(current)
    play.update(1)
    assert.deepEqual(current, snapped)
  } finally {
    play.dispose()
    result.dispose()
  }
})
