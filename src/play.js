import * as THREE from 'three'
import { SECTIONS } from './content.js'
import { damp, getMorphFrame, progressFromOffsets, sampleMorph } from './morph.js'
import { applyBoyMotion } from './boy-motion.js'
import { createChapterFrames } from './framing.js'

const CONTROL_LABELS = ['Boy', 'India', 'Skills', 'Portal']

export function playPortfolio({ canvas, container, signal }, objects, settings) {
  const { universe, particles, dust, camera, targets, boyRegions, phases } = objects
  const doc = container.ownerDocument || null
  const browserWindow = doc?.defaultView || null
  const embedded = Boolean(doc?.body.classList.contains('embedded-mode'))
  const reducedMotion = browserWindow?.matchMedia('(prefers-reduced-motion: reduce)') || { matches: false }
  const sections = doc && !embedded ? SECTIONS.map(({ id }) => doc.getElementById(id)).filter(Boolean) : []
  const positions = particles.geometry.attributes.position
  const pointer = { x: 0, y: 0, active: false }
  const pointerNdc = new THREE.Vector2()
  const pointerRaycaster = new THREE.Raycaster()
  const pointerPlane = new THREE.Plane()
  const pointerPlaneNormal = new THREE.Vector3()
  const pointerPlanePoint = new THREE.Vector3()
  const pointerWorldHit = new THREE.Vector3()
  const pointerLocalHit = new THREE.Vector3()
  let pointerStrength = 0
  let offsets = []
  let chapterFrames = []
  const frameViewport = { width: 0, height: 0, fov: 0, cameraZ: 0, mobile: null }
  let framingInitialized = false
  let progress = 0
  let targetProgress = 0
  let time = 0
  let resumeWithZeroDelta = false
  let emphasisKind = null
  let emphasisIndex = 0
  let controls
  let hint
  const buttons = []

  function measureFrames() {
    const width = browserWindow?.innerWidth || container.clientWidth || 1440
    const height = browserWindow?.innerHeight || container.clientHeight || 900
    const mobile = !embedded && width <= 760
    chapterFrames = createChapterFrames(targets, {
      width,
      height,
      fov: camera.fov,
      cameraZ: camera.position.z,
      mobile,
    })
    frameViewport.width = width
    frameViewport.height = height
    frameViewport.fov = camera.fov
    frameViewport.cameraZ = camera.position.z
    frameViewport.mobile = mobile
  }

  function ensureFrames() {
    const width = browserWindow?.innerWidth || container.clientWidth || 1440
    const height = browserWindow?.innerHeight || container.clientHeight || 900
    const mobile = !embedded && width <= 760
    if (chapterFrames.length !== 4 || width !== frameViewport.width || height !== frameViewport.height || mobile !== frameViewport.mobile || camera.fov !== frameViewport.fov || camera.position.z !== frameViewport.cameraZ) {
      measureFrames()
    }
  }

  function measure() {
    if (!browserWindow || sections.length !== SECTIONS.length) return
    offsets = sections.map((section) => section.offsetTop)
    const measured = progressFromOffsets(offsets, browserWindow.scrollY)
    targetProgress = reducedMotion.matches ? Math.round(measured) : measured
  }

  function onResize() {
    measureFrames()
    measure()
  }

  function updateControls() {
    const active = Math.round(targetProgress)
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === active)))
  }

  function setProgress(value) {
    const next = Math.max(0, Math.min(3, Number.isFinite(value) ? value : 0))
    targetProgress = reducedMotion.matches ? Math.round(next) : next
    if (reducedMotion.matches) progress = targetProgress
    updateControls()
  }

  function goTo(index) {
    const safeIndex = Math.max(0, Math.min(3, Math.round(index)))
    setProgress(safeIndex)
    if (sections[safeIndex] && browserWindow) {
      sections[safeIndex].scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' })
    }
  }

  function setEmphasis(detail = {}) {
    emphasisKind = detail.kind || null
    emphasisIndex = Number.isInteger(detail.index) ? detail.index : 0
    particles.material.color.set(particles.userData.theme === 'light' ? '#FFFFFF' : emphasisKind ? '#E9FBFF' : '#FFFFFF')
  }

  function onKeydown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const target = event.target
    if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return
    if (/^[1-4]$/.test(event.key)) {
      event.preventDefault()
      goTo(Number(event.key) - 1)
    } else if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
      event.preventDefault()
      const direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1
      goTo(Math.round(targetProgress) + direction)
    }
  }

  function onPointerMove(event) {
    if (!browserWindow || event.pointerType === 'touch') return
    const bounds = canvas.getBoundingClientRect()
    if (bounds.width <= 0 || bounds.height <= 0) {
      pointer.active = false
      return
    }
    pointer.x = (event.clientX - bounds.left) / bounds.width * 2 - 1
    pointer.y = -((event.clientY - bounds.top) / bounds.height * 2 - 1)
    pointer.active = true
  }

  function onPointerLeave() {
    pointer.active = false
  }

  function onSection(event) {
    setProgress(event.detail?.index)
  }

  function onEmphasis(event) {
    setEmphasis(event.detail)
  }

  function onTheme(event) { objects.setTheme?.(event.detail?.theme) }

  if (doc) {
    hint = doc.createElement('div')
    hint.className = 'scene-play-hint'
    hint.textContent = 'Scroll or use 1–4 to transform the portrait · move the pointer to dissolve'
    controls = doc.createElement('div')
    controls.className = 'scene-play-controls'
    controls.setAttribute('aria-label', 'Data universe chapters')
    CONTROL_LABELS.forEach((label, index) => {
      const button = doc.createElement('button')
      button.type = 'button'
      button.textContent = `${index + 1} ${label}`
      button.setAttribute('aria-label', `${label} chapter, shortcut ${index + 1}`)
      button.setAttribute('aria-pressed', String(index === 0))
      button.addEventListener('click', () => goTo(index), { signal })
      buttons.push(button)
      controls.append(button)
    })
    container.append(hint, controls)
  }

  if (browserWindow) {
    browserWindow.addEventListener('scroll', measure, { signal, passive: true })
    browserWindow.addEventListener('resize', onResize, { signal, passive: true })
    browserWindow.addEventListener('keydown', onKeydown, { signal })
    browserWindow.addEventListener('pointermove', onPointerMove, { signal, passive: true })
    browserWindow.addEventListener('pointerleave', onPointerLeave, { signal })
    browserWindow.addEventListener('portfolio:section', onSection, { signal })
    browserWindow.addEventListener('portfolio:emphasis', onEmphasis, { signal })
    browserWindow.addEventListener('portfolio:theme', onTheme, { signal })
    doc?.addEventListener?.('visibilitychange', () => {
      pointer.active = false
      resumeWithZeroDelta = true
    }, { signal })
    reducedMotion.addEventListener?.('change', (event) => {
      if (event.matches) {
        pointer.active = false
        setProgress(targetProgress)
      }
    }, { signal })
    canvas.addEventListener('pointerdown', () => canvas.focus(), { signal })
    measureFrames()
    measure()
    progress = targetProgress
  }

  function update(dt) {
    if (doc?.hidden) {
      resumeWithZeroDelta = true
      return
    }
    let safeDt = Math.max(0, Math.min(0.1, Number.isFinite(dt) ? dt : 0))
    if (resumeWithZeroDelta) {
      safeDt = 0
      resumeWithZeroDelta = false
    }
    if (!reducedMotion.matches) time += safeDt * settings.motionSpeed
    if (reducedMotion.matches) {
      pointerStrength = 0
    } else {
      pointerStrength = damp(pointerStrength, pointer.active ? 1 : 0, 8, safeDt)
      if (!pointer.active && pointerStrength < 0.0001) pointerStrength = 0
    }
    ensureFrames()
    progress = reducedMotion.matches ? targetProgress : damp(progress, targetProgress, 4.2, safeDt)
    const morphFrame = getMorphFrame(progress)
    sampleMorph(targets, morphFrame, positions.array, phases)
    const fromFrame = chapterFrames[morphFrame.from]
    const toFrame = chapterFrames[morphFrame.to]
    const desiredY = fromFrame.y + (toFrame.y - fromFrame.y) * morphFrame.mix
    const desiredScale = fromFrame.scale + (toFrame.scale - fromFrame.scale) * morphFrame.mix
    if (!framingInitialized || reducedMotion.matches) {
      universe.position.y = desiredY
      universe.scale.setScalar(desiredScale)
      framingInitialized = true
    } else {
      universe.position.y = damp(universe.position.y, desiredY, 5, safeDt)
      const scale = damp(universe.scale.x, desiredScale, 5, safeDt)
      universe.scale.setScalar(scale)
    }
    universe.position.x = 0
    const boyWeight = Math.max(0, 1 - progress)
    if (!reducedMotion.matches && progress < 1) {
      applyBoyMotion(positions.array, boyRegions, time, pointer, boyWeight)
    }
    const mapWeight = Math.max(0, 1 - Math.abs(progress - 1))
    const skillWeight = Math.max(0, 1 - Math.abs(progress - 2))
    const skillAngle = emphasisKind === 'skill' ? skillWeight * 0.35 : 0
    const skillCos = Math.cos(skillAngle), skillSin = Math.sin(skillAngle)
    const flow = reducedMotion.matches ? 0 : settings.flowIntensity
    universe.rotation.y = time * 0.06 * (1 - boyWeight - mapWeight) + Math.sin(time * 0.35) * 0.08 * mapWeight + (emphasisKind === 'experience' ? emphasisIndex * 0.08 : 0)
    universe.rotation.x = Math.sin(time * 0.22) * 0.025 * (1 - boyWeight)
    dust.rotation.y = time * 0.008
    camera.position.x = pointer.active && !reducedMotion.matches ? pointer.x * 0.22 : 0
    camera.position.y = 0.2 + (pointer.active && !reducedMotion.matches ? pointer.y * 0.14 : 0)
    camera.lookAt(0, 0, 0)
    universe.updateMatrixWorld(true)
    camera.updateMatrixWorld(true)

    let hasPointerHit = false
    if (pointerStrength > 0) {
      pointerNdc.set(pointer.x, pointer.y)
      pointerRaycaster.setFromCamera(pointerNdc, camera)
      pointerPlaneNormal.set(0, 0, 1).transformDirection(universe.matrixWorld)
      pointerPlanePoint.set(0, 0, 0).applyMatrix4(universe.matrixWorld)
      pointerPlane.setFromNormalAndCoplanarPoint(pointerPlaneNormal, pointerPlanePoint)
      if (pointerRaycaster.ray.intersectPlane(pointerPlane, pointerWorldHit)) {
        pointerLocalHit.copy(pointerWorldHit)
        universe.worldToLocal(pointerLocalHit)
        hasPointerHit = true
      }
    }

    const dissolveRadius = 1.25 + settings.flowIntensity * 0.35
    for (let index = 0; index < positions.count; index += 1) {
      const offset = index * 3
      let x = positions.array[offset], y = positions.array[offset + 1], z = positions.array[offset + 2]
      if (skillAngle > 0 && index % 4 === emphasisIndex) {
        const rotatedY = y * skillCos - z * skillSin
        z = y * skillSin + z * skillCos
        y = rotatedY
      }
      if (flow > 0) {
        y += Math.sin(time * 0.9 + index * 0.017) * 0.018 * flow
        z += Math.cos(time * 0.7 + index * 0.013) * 0.018 * flow
      }
      if (hasPointerHit) {
        const dx = x - pointerLocalHit.x, dy = y - pointerLocalHit.y
        const distanceSquared = dx * dx + dy * dy + z * z * 0.08
        if (distanceSquared < dissolveRadius * dissolveRadius && distanceSquared > 0.0001) {
          const distance = Math.sqrt(distanceSquared)
          const strength = (1 - distance / dissolveRadius) * settings.flowIntensity * 0.55 * pointerStrength
          x += dx / distance * strength
          y += dy / distance * strength
          z += strength * 0.35
        }
      }
      positions.array[offset] = x; positions.array[offset + 1] = y; positions.array[offset + 2] = z
    }
    positions.needsUpdate = true
    const baseOpacity = particles.userData.baseOpacity ?? 0.94
    particles.material.opacity = emphasisKind === 'experience' && mapWeight > 0 && !reducedMotion.matches
      ? baseOpacity - 0.04 + (Math.sin(time * 3) + 1) * 0.04 * mapWeight
      : baseOpacity
  }

  ensureFrames()
  update(0)
  return {
    update,
    setProgress,
    setEmphasis,
    dispose() {
      pointer.active = false
      controls?.remove()
      hint?.remove()
    },
  }
}
