import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { damp, getMorphFrame, progressFromOffsets, sampleMorph } from '../src/morph.js'
import { createScene } from '../src/scene.js'
import { createShapeTargets, PARTICLE_COUNT } from '../src/shapes.js'
import { createProject } from '../src/project.js'
import { createChapterFrames } from '../src/framing.js'

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

test('Play applies the responsive hero frame on its first update', async () => {
  const result = createScene({ asset: makeAsset() })
  const play = await result.play(makeContext())
  const targets = createShapeTargets(PARTICLE_COUNT)
  const expected = createChapterFrames(targets, { width: 1440, height: 900 })[0]
  const universe = result.scene.getObjectByName('Data Universe')
  play.update(0)
  assert.equal(universe.position.y, expected.y)
  assert.equal(universe.scale.x, expected.scale)
  play.dispose()
  result.dispose()
})

test('pointer leave damps dissolution through successive frames before exact restoration', async () => {
  function makePointerContext() {
    const listeners = {}
    const reducedMotion = { matches: false, addEventListener() {} }
    const browserWindow = {
      matchMedia: () => reducedMotion,
      addEventListener(type, listener) { listeners[type] = listener },
      innerWidth: 1200,
      innerHeight: 900,
      scrollY: 0,
    }
    const doc = {
      hidden: false,
      body: { classList: { contains: () => true } },
      defaultView: browserWindow,
      createElement: () => ({ setAttribute() {}, addEventListener() {}, append() {}, remove() {} }),
      addEventListener() {},
    }
    return {
      context: {
        canvas: {
          addEventListener() {},
          focus() {},
          getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 900 }),
        },
        container: { append() {}, replaceChildren() {}, ownerDocument: doc },
        signal: { aborted: false, addEventListener() {} },
      },
      listeners,
    }
  }

  const pointerScene = createScene({ asset: makeAsset() })
  const referenceScene = createScene({ asset: makeAsset() })
  const pointerContext = makePointerContext()
  const referenceContext = makePointerContext()
  const pointerPlay = await pointerScene.play(pointerContext.context)
  const referencePlay = await referenceScene.play(referenceContext.context)
  const pointerPositions = pointerScene.scene.getObjectByName('Particle Field').geometry.attributes.position.array
  const referencePositions = referenceScene.scene.getObjectByName('Particle Field').geometry.attributes.position.array
  const advanceBoth = (dt) => {
    pointerPlay.update(dt)
    referencePlay.update(dt)
  }
  const difference = () => {
    let changed = 0
    let maxDelta = 0
    let squaredDelta = 0
    for (let index = 0; index < pointerPositions.length; index += 1) {
      const delta = Math.abs(pointerPositions[index] - referencePositions[index])
      if (delta > 0) changed += 1
      maxDelta = Math.max(maxDelta, delta)
      squaredDelta += delta * delta
    }
    return { changed, maxDelta, rmsDelta: Math.sqrt(squaredDelta / pointerPositions.length) }
  }

  try {
    advanceBoth(0)
    assert.ok(pointerPositions.every((value, index) => value === referencePositions[index]))
    pointerContext.listeners.pointermove({ pointerType: 'mouse', clientX: 600, clientY: 450 })
    advanceBoth(1 / 60)
    assert.ok(difference().changed > 0)
    pointerContext.listeners.pointerleave({ pointerType: 'mouse' })

    const returnFrames = []
    for (let frame = 0; frame < 8; frame += 1) {
      advanceBoth(1 / 60)
      returnFrames.push(difference())
    }
    assert.ok(returnFrames.every((frame) => frame.changed > 0 && frame.rmsDelta > 0), JSON.stringify(returnFrames))
    const ratios = returnFrames.slice(1).map((frame, index) => frame.rmsDelta / returnFrames[index].rmsDelta)
    assert.ok(ratios.every((ratio) => ratio > 0.5 && ratio < 1), JSON.stringify({ returnFrames, ratios }))

    for (let frame = 0; frame < 180; frame += 1) advanceBoth(1 / 60)
    assert.ok(pointerPositions.every((value, index) => value === referencePositions[index]), 'pointer influence must settle to exact zero')
  } finally {
    pointerPlay.dispose()
    referencePlay.dispose()
    pointerScene.dispose()
    referenceScene.dispose()
  }
})

function makeResponsiveContext(viewport, reducedMotion) {
  const listeners = {}
  const browserWindow = {
    matchMedia: () => reducedMotion,
    addEventListener(type, listener) { listeners[type] = listener },
    innerWidth: viewport.width,
    innerHeight: viewport.height,
    scrollY: 0,
  }
  const doc = {
    hidden: false,
    body: { classList: { contains: () => viewport.embedded ?? true } },
    defaultView: browserWindow,
    getElementById: () => null,
    createElement: () => ({ setAttribute() {}, addEventListener() {}, append() {}, remove() {} }),
    addEventListener() {},
  }
  return {
    listeners,
    browserWindow,
    context: {
      canvas: {
        addEventListener() {},
        focus() {},
        getBoundingClientRect: () => ({ left: viewport.left || 0, top: viewport.top || 0, width: viewport.width, height: viewport.height }),
      },
      container: { append() {}, replaceChildren() {}, ownerDocument: doc },
      signal: { aborted: false, addEventListener() {} },
    },
  }
}

test('pointer dissolution follows a projected subject point after responsive framing', async () => {
  for (const viewport of [
    { name: 'desktop', width: 1200, height: 900, left: 180, top: 120 },
    { name: 'mobile', width: 390, height: 844, left: 60, top: 90 },
  ]) {
    const reducedMotion = { matches: true, addEventListener() {} }
    const { context, listeners, browserWindow } = makeResponsiveContext(viewport, reducedMotion)
    const parameters = {}
    const asset = {
      register() {},
      registerParams(id, settings) { parameters[id] = settings },
      subscribe() { return () => {} },
    }
    const result = createScene({ asset })
    result.camera.aspect = viewport.width / viewport.height
    result.camera.updateProjectionMatrix()
    parameters.dataMotion.motionSpeed = 0
    const play = await result.play(context)
    try {
      play.setProgress(1)
      play.update(0)
      reducedMotion.matches = false
      play.update(1 / 60)
      const particles = result.scene.getObjectByName('Particle Field')
      const current = particles.geometry.attributes.position.array
      const baseline = new Float32Array(current)
      const universe = result.scene.getObjectByName('Data Universe')
      result.scene.updateMatrixWorld(true)
      result.camera.updateMatrixWorld(true)

      let selectedIndex = 0
      let bestScore = Infinity
      for (let index = 0; index < particles.geometry.attributes.position.count; index += 1) {
        const offset = index * 3
        const x = baseline[offset], y = baseline[offset + 1], z = baseline[offset + 2]
        if (Math.hypot(x, y) < 1) continue
        const score = (x - 0.8) ** 2 + (y - 1.1) ** 2 + z * z * 200
        if (score < bestScore) {
          bestScore = score
          selectedIndex = index
        }
      }
      const selectedOffset = selectedIndex * 3
      const worldPoint = new THREE.Vector3(
        baseline[selectedOffset], baseline[selectedOffset + 1], baseline[selectedOffset + 2],
      ).applyMatrix4(universe.matrixWorld)
      const projectionCamera = result.camera.clone()
      const ndc = new THREE.Vector2()
      for (let iteration = 0; iteration < 16; iteration += 1) {
        projectionCamera.position.set(ndc.x * 0.22, 0.2 + ndc.y * 0.14, result.camera.position.z)
        projectionCamera.lookAt(0, 0, 0)
        projectionCamera.updateMatrixWorld(true)
        const projected = worldPoint.clone().project(projectionCamera)
        ndc.set(projected.x, projected.y)
      }
      const clientX = viewport.left + (ndc.x + 1) * viewport.width / 2
      const clientY = viewport.top + (1 - ndc.y) * viewport.height / 2
      const legacyNdcX = (clientX / browserWindow.innerWidth - 0.5) * 2
      const legacyNdcY = -(clientY / browserWindow.innerHeight - 0.5) * 2
      const legacyDistance = Math.hypot(
        baseline[selectedOffset] - legacyNdcX * 5.5,
        baseline[selectedOffset + 1] - legacyNdcY * 3.8,
      )
      assert.ok(legacyDistance > 1.495, `${viewport.name}: projection must discriminate against the legacy local hit`)

      listeners.pointermove({ pointerType: 'mouse', clientX, clientY })
      play.update(1 / 60)
      result.scene.updateMatrixWorld(true)
      result.camera.updateMatrixWorld(true)
      const projected = worldPoint.clone().project(result.camera)
      const projectedX = viewport.left + (projected.x + 1) * viewport.width / 2
      const projectedY = viewport.top + (1 - projected.y) * viewport.height / 2
      assert.ok(Math.hypot(projectedX - clientX, projectedY - clientY) < 0.25, `${viewport.name}: projection setup did not converge`)

      let changedCount = 0
      let nearestDistance = Infinity
      let totalWeight = 0
      let weightedX = 0
      let weightedY = 0
      const affectedPoint = new THREE.Vector3()
      for (let offset = 0; offset < current.length; offset += 3) {
        const displacement = Math.hypot(
          current[offset] - baseline[offset],
          current[offset + 1] - baseline[offset + 1],
          current[offset + 2] - baseline[offset + 2],
        )
        if (displacement <= 0.000001) continue
        changedCount += 1
        affectedPoint.set(baseline[offset], baseline[offset + 1], baseline[offset + 2]).applyMatrix4(universe.matrixWorld).project(result.camera)
        const affectedX = viewport.left + (affectedPoint.x + 1) * viewport.width / 2
        const affectedY = viewport.top + (1 - affectedPoint.y) * viewport.height / 2
        nearestDistance = Math.min(nearestDistance, Math.hypot(affectedX - clientX, affectedY - clientY))
        weightedX += affectedX * displacement
        weightedY += affectedY * displacement
        totalWeight += displacement
      }
      const centroidDistance = Math.hypot(weightedX / totalWeight - clientX, weightedY / totalWeight - clientY)
      assert.ok(changedCount > 0, `${viewport.name}: projected subject neighborhood did not dissolve`)
      assert.ok(nearestDistance < 5, `${viewport.name}: nearest dissolved particle was ${nearestDistance.toFixed(2)} px from the projected subject point`)
      assert.ok(centroidDistance < 30, `${viewport.name}: dissolution centroid was ${centroidDistance.toFixed(2)} px from the projected subject point`)
    } finally {
      play.dispose()
      result.dispose()
    }
  }
})

test('scroll measurement reuses static chapter frames until resize', async () => {
  const reducedMotion = { matches: false, addEventListener() {} }
  const viewport = { width: 1200, height: 900 }
  const { context, listeners } = makeResponsiveContext(viewport, reducedMotion)
  const result = createScene({ asset: makeAsset() })
  const play = await result.play(context)
  try {
    const universe = result.scene.getObjectByName('Data Universe')
    const initialScale = universe.scale.x
    const initialY = universe.position.y
    reducedMotion.matches = true
    listeners.scroll()
    play.update(0)
    assert.equal(universe.scale.x, initialScale, 'scroll must not rebuild static chapter frames')
    assert.equal(universe.position.y, initialY, 'scroll must preserve the initialized responsive frame')

    result.camera.position.z = 20
    listeners.resize()
    play.update(0)
    const expected = createChapterFrames(createShapeTargets(PARTICLE_COUNT), {
      width: viewport.width,
      height: viewport.height,
      fov: result.camera.fov,
      cameraZ: result.camera.position.z,
    })[0]
    assert.equal(universe.scale.x, expected.scale, 'resize must rebuild chapter scale')
    assert.equal(universe.position.y, expected.y, 'resize must rebuild chapter position')
  } finally {
    play.dispose()
    result.dispose()
  }
})

test('Play reconciles a settled viewport when the final resize event is missing', async () => {
  const reducedMotion = { matches: true, addEventListener() {} }
  const viewport = { width: 1200, height: 900, embedded: false }
  const { context, browserWindow } = makeResponsiveContext(viewport, reducedMotion)
  const result = createScene({ asset: makeAsset() })
  const play = await result.play(context)
  try {
    browserWindow.innerWidth = 390
    browserWindow.innerHeight = 844
    play.update(0)
    const universe = result.scene.getObjectByName('Data Universe')
    const expected = createChapterFrames(createShapeTargets(PARTICLE_COUNT), {
      width: 390,
      height: 844,
      fov: result.camera.fov,
      cameraZ: result.camera.position.z,
      mobile: true,
    })[0]
    assert.equal(universe.scale.x, expected.scale, 'the settled mobile viewport must rebuild chapter scale')
    assert.equal(universe.position.y, expected.y, 'the settled mobile viewport must rebuild chapter position')
  } finally {
    play.dispose()
    result.dispose()
  }
})
