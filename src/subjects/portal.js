import { writePoint } from './shared.js'

export function createPortal(count, random) {
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    if (index < count * 0.72) {
      const ring = index % 18
      const angle = random() * Math.PI * 2 + ring * 0.08
      const radius = 1.1 + ring * 0.23 + (random() - 0.5) * 0.07
      const z = -4.8 + ring / 17 * 7.8 + (random() - 0.5) * 0.16
      writePoint(positions, index, Math.cos(angle) * radius, Math.sin(angle) * radius, z)
    } else {
      const t = random()
      const angle = t * Math.PI * 6 + (index % 4) * Math.PI * 0.5
      const radius = 1.1 + t * 4
      writePoint(positions, index, Math.cos(angle) * radius, Math.sin(angle) * radius, -4.8 + t * 7.8)
    }
  }
  return positions
}
