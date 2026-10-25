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
  const offsets = [0, 1000, 2000, 3500, 5000]
  assert.equal(progressFromOffsets(offsets, -10), 0)
  assert.equal(progressFromOffsets(offsets, 500), 0.5)
  assert.equal(progressFromOffsets(offsets, 1500), 1.5)
  assert.equal(progressFromOffsets(offsets, 4000), 3 + 1 / 3)
  assert.equal(progressFromOffsets(offsets, 7000), 4)
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
    assert.ok(Math.abs(current[index] - targets[4][index]) < 0.08)
  }
  play.dispose()
  scene.dispose()
})
