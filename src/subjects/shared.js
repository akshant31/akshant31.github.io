export function seededRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

export function writePoint(target, index, x, y, z) {
  const offset = index * 3
  target[offset] = x
  target[offset + 1] = y
  target[offset + 2] = z
}

export function sphericalPoint(random, radius) {
  const theta = random() * Math.PI * 2
  const cosPhi = random() * 2 - 1
  const sinPhi = Math.sqrt(1 - cosPhi * cosPhi)
  return [Math.cos(theta) * sinPhi * radius, cosPhi * radius, Math.sin(theta) * sinPhi * radius]
}
