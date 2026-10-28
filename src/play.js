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
  let pointerStrength = 0
  let offsets = []
  let chapterFrames = []
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

  function measure() {
    const width = browserWindow?.innerWidth || container.clientWidth || 1440
    const height = browserWindow?.innerHeight || container.clientHeight || 900
    chapterFrames = createChapterFrames(targets, {
      width,
      height,
      fov: camera.fov,
      cameraZ: camera.position.z,
      mobile: !embedded && width <= 760,
    })
    if (!browserWindow || sections.length !== SECTIONS.length) return
    offsets = sections.map((section) => section.offsetTop)
    const measured = progressFromOffsets(offsets, browserWindow.scrollY)
    targetProgress = reducedMotion.matches ? Math.round(measured) : measured
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
    particles.material.color.set(emphasisKind ? '#E9FBFF' : '#FFFFFF')
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
    pointer.x = (event.clientX / browserWindow.innerWidth - 0.5) * 2
    pointer.y = -(event.clientY / browserWindow.innerHeight - 0.5) * 2
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
    browserWindow.addEventListener('resize', measure, { signal, passive: true })
    browserWindow.addEventListener('keydown', onKeydown, { signal })
    browserWindow.addEventListener('pointermove', onPointerMove, { signal, passive: true })
    browserWindow.addEventListener('pointerleave', onPointerLeave, { signal })
    browserWindow.addEventListener('portfolio:section', onSection, { signal })
    browserWindow.addEventListener('portfolio:emphasis', onEmphasis, { signal })
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
    const pointerX = pointer.x * 5.5
    const pointerY = pointer.y * 3.8
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
      if (pointerStrength > 0) {
        const dx = x - pointerX, dy = y - pointerY
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
    particles.material.opacity = emphasisKind === 'experience' && mapWeight > 0 && !reducedMotion.matches
      ? 0.9 + (Math.sin(time * 3) + 1) * 0.04 * mapWeight
      : 0.94

    universe.rotation.y = time * 0.06 * (1 - boyWeight - mapWeight) + Math.sin(time * 0.35) * 0.08 * mapWeight + (emphasisKind === 'experience' ? emphasisIndex * 0.08 : 0)
    universe.rotation.x = Math.sin(time * 0.22) * 0.025 * (1 - boyWeight)
    dust.rotation.y = time * 0.008
    camera.position.x = pointer.active && !reducedMotion.matches ? pointer.x * 0.22 : 0
    camera.position.y = 0.2 + (pointer.active && !reducedMotion.matches ? pointer.y * 0.14 : 0)
    camera.lookAt(0, 0, 0)
  }

  if (chapterFrames.length !== 4) measure()
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
