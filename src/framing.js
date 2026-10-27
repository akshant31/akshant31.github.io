const DESKTOP = Object.freeze([
  Object.freeze({ bottom: -1.06, top: 0.50, width: 0.42 }),
  Object.freeze({ bottom: -0.78, top: 0.80, width: 0.54 }),
  Object.freeze({ bottom: -0.76, top: 0.78, width: 0.66 }),
  Object.freeze({ bottom: -0.78, top: 0.78, width: 0.68 }),
])

const MOBILE = Object.freeze([
  Object.freeze({ bottom: -1.08, top: 0.48, width: 0.90 }),
  Object.freeze({ bottom: -0.25, top: 0.70, width: 0.90 }),
  Object.freeze({ bottom: -0.36, top: 0.64, width: 0.94 }),
  Object.freeze({ bottom: -0.40, top: 0.62, width: 0.94 }),
])

export function getTargetBounds(target) {
  if (!(target instanceof Float32Array) || target.length === 0 || target.length % 3 !== 0) throw new Error('INVALID_TARGET')
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let offset = 0; offset < target.length; offset += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = target[offset + axis]
      if (!Number.isFinite(value)) throw new Error('INVALID_TARGET')
      min[axis] = Math.min(min[axis], value)
      max[axis] = Math.max(max[axis], value)
    }
  }
  return { min, max }
}

export function getViewSize({ width = 1440, height = 900, fov = 42, cameraZ = 18 } = {}) {
  if (![width, height, fov, cameraZ].every(Number.isFinite) || width <= 0 || height <= 0 || fov <= 0 || cameraZ <= 0) {
    throw new Error('INVALID_VIEWPORT')
  }
  const halfHeight = Math.tan(fov * Math.PI / 360) * cameraZ
  return { halfWidth: halfHeight * width / height, halfHeight }
}

export function createChapterFrames(targets, { width = 1440, height = 900, fov = 42, cameraZ = 18, mobile = false } = {}) {
  if (!Array.isArray(targets) || targets.length !== 4) throw new Error('FOUR_TARGETS_REQUIRED')
  const view = getViewSize({ width, height, fov, cameraZ })
  const profiles = mobile ? MOBILE : DESKTOP
  return targets.map((target, index) => {
    const { min, max } = getTargetBounds(target)
    const profile = profiles[index]
    const localWidth = max[0] - min[0]
    const localHeight = max[1] - min[1]
    if (localWidth <= 0 || localHeight <= 0) throw new Error('INVALID_TARGET')
    const heightScale = (profile.top - profile.bottom) * view.halfHeight / localHeight
    const widthScale = profile.width * 2 * view.halfWidth / localWidth
    const scale = Math.min(heightScale, widthScale)
    const y = index === 0
      ? profile.bottom * view.halfHeight - min[1] * scale
      : (profile.top + profile.bottom) * 0.5 * view.halfHeight - (min[1] + max[1]) * 0.5 * scale
    return { x: 0, y, scale }
  })
}
