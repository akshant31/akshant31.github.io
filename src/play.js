import { SECTIONS } from './content.js'
import { damp, getMorphFrame, progressFromOffsets, sampleMorph } from './morph.js'

const CONTROL_LABELS = ['Boy', 'India', 'Skills', 'Portal']

export function playPortfolio({ canvas, container, signal }, objects, settings) {
  const { universe, particles, network, coreRings, camera, targets, networkIndices } = objects
  const doc = container.ownerDocument || null
  const browserWindow = doc?.defaultView || null
  const embedded = Boolean(doc?.body.classList.contains('embedded-mode'))
  const reducedMotion = browserWindow?.matchMedia('(prefers-reduced-motion: reduce)') || { matches: false }
  const sections = doc && !embedded ? SECTIONS.map(({ id }) => doc.getElementById(id)).filter(Boolean) : []
  const positions = particles.geometry.attributes.position
  const networkPositions = network.geometry.attributes.position
  const pointer = { x: 0, y: 0, active: false }
  let offsets = []
  let progress = 0
  let targetProgress = 0
  let time = 0
  let emphasisKind = null
  let emphasisIndex = 0
  let controls
  let hint
  const buttons = []

  function measure() {
    if (!browserWindow || sections.length !== SECTIONS.length) return
    offsets = sections.map((section) => section.offsetTop)
    targetProgress = progressFromOffsets(offsets, browserWindow.scrollY)
  }

  function updateControls() {
    const active = Math.round(targetProgress)
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === active)))
  }

  function setProgress(value) {
    targetProgress = Math.max(0, Math.min(3, Number.isFinite(value) ? value : 0))
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
    network.material.color.set(emphasisKind === 'experience' ? settings.violet : settings.cyan)
    coreRings.scale.setScalar(1 + emphasisIndex * 0.025)
  }

  function onKeydown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (/^[1-5]$/.test(event.key)) {
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
    reducedMotion.addEventListener?.('change', (event) => {
      if (event.matches) {
        pointer.active = false
        progress = targetProgress
      }
    }, { signal })
    canvas.addEventListener('pointerdown', () => canvas.focus(), { signal })
    measure()
    progress = targetProgress
  }

  function update(dt) {
    const safeDt = Math.max(0, Math.min(0.1, Number.isFinite(dt) ? dt : 0))
    if (!reducedMotion.matches) time += safeDt * settings.motionSpeed
    progress = reducedMotion.matches ? targetProgress : damp(progress, targetProgress, 4.2, safeDt)
    sampleMorph(targets, getMorphFrame(progress), positions.array)
    const flow = reducedMotion.matches ? 0 : settings.flowIntensity
    const pointerX = pointer.x * 5.5
    const pointerY = pointer.y * 3.8
    const dissolveRadius = 1.25 + settings.flowIntensity * 0.35

    for (let index = 0; index < positions.count; index += 1) {
      const offset = index * 3
      let x = positions.array[offset]
      let y = positions.array[offset + 1]
      let z = positions.array[offset + 2]
      if (flow > 0) {
        y += Math.sin(time * 0.9 + index * 0.017) * 0.022 * flow
        z += Math.cos(time * 0.7 + index * 0.013) * 0.022 * flow
      }
      if (pointer.active && !reducedMotion.matches) {
        const dx = x - pointerX
        const dy = y - pointerY
        const distanceSquared = dx * dx + dy * dy + z * z * 0.08
        if (distanceSquared < dissolveRadius * dissolveRadius && distanceSquared > 0.0001) {
          const distance = Math.sqrt(distanceSquared)
          const strength = (1 - distance / dissolveRadius) * settings.flowIntensity * 0.55
          x += dx / distance * strength
          y += dy / distance * strength
          z += strength * 0.35
        }
      }
      positions.array[offset] = x
      positions.array[offset + 1] = y
      positions.array[offset + 2] = z
    }
    positions.needsUpdate = true

    for (let segment = 0; segment < networkIndices.length / 2; segment += 1) {
      const a = networkIndices[segment * 2] * 3
      const b = networkIndices[segment * 2 + 1] * 3
      const outputA = segment * 6
      const outputB = outputA + 3
      networkPositions.array[outputA] = positions.array[a]
      networkPositions.array[outputA + 1] = positions.array[a + 1]
      networkPositions.array[outputA + 2] = positions.array[a + 2]
      networkPositions.array[outputB] = positions.array[b]
      networkPositions.array[outputB + 1] = positions.array[b + 1]
      networkPositions.array[outputB + 2] = positions.array[b + 2]
    }
    networkPositions.needsUpdate = true
    network.material.opacity = 0.06 + settings.flowIntensity * 0.1 + (emphasisKind ? 0.06 : 0)

    const mobile = !embedded && browserWindow?.innerWidth <= 760
    const targetX = embedded ? 0 : mobile ? 0 : 2.5
    const targetY = mobile ? 1.7 : 0
    universe.position.x = damp(universe.position.x, targetX, 5, safeDt)
    universe.position.y = damp(universe.position.y, targetY, 5, safeDt)
    universe.rotation.y = time * 0.075 + emphasisIndex * 0.06
    universe.rotation.x = Math.sin(time * 0.22) * 0.045
    coreRings.rotation.y = time * 0.12
    coreRings.rotation.z = time * -0.06
    camera.position.x = pointer.active && !reducedMotion.matches ? pointer.x * 0.28 : 0
    camera.position.y = 0.2 + (pointer.active && !reducedMotion.matches ? pointer.y * 0.18 : 0)
    camera.lookAt(0, 0, 0)
  }

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
