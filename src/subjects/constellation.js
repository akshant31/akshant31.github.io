import { writePoint } from './shared.js'

export function createConstellation(count, random) {
  const positions = new Float32Array(count * 3)
  const radii = [2.1, 3.0, 3.9, 4.75]
  for (let index = 0; index < count; index += 1) {
    const group = index % 4
    const theta = random() * Math.PI * 2
    const cosPhi = random() * 2 - 1
    const sinPhi = Math.sqrt(1 - cosPhi * cosPhi)
    const radius = radii[group] + (random() - 0.5) * 0.18
    const x = Math.cos(theta) * sinPhi * radius
    const y = cosPhi * radius * 0.76
    const z = Math.sin(theta) * sinPhi * radius
    const tilt = (group - 1.5) * 0.22
    writePoint(positions, index, x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt))
  }
  return positions
}
