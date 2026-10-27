import { BOY_REGION } from './subjects/boy.js'

function rotateZ(output, offset, pivotX, pivotY, angle) {
  const x = output[offset] - pivotX, y = output[offset + 1] - pivotY
  const cos = Math.cos(angle), sin = Math.sin(angle)
  output[offset] = pivotX + x * cos - y * sin
  output[offset + 1] = pivotY + x * sin + y * cos
}

function rotateY(output, offset, angle) {
  const x = output[offset], z = output[offset + 2]
  const cos = Math.cos(angle), sin = Math.sin(angle)
  output[offset] = x * cos + z * sin
  output[offset + 2] = -x * sin + z * cos
}

export function applyBoyMotion(output, regions, time, pointer, weight) {
  const amount = Math.max(0, Math.min(1, Number.isFinite(weight) ? weight : 0))
  if (amount === 0) return output
  const safeTime = Number.isFinite(time) ? time : 0
  const wave = Math.sin(safeTime * 2.2) * 0.14 * amount
  const forearmWave = Math.sin(safeTime * 2.2 + 0.55) * 0.12 * amount
  const breath = 1 + Math.sin(safeTime * 1.35) * 0.016 * amount
  const headYaw = pointer?.active ? pointer.x * 0.16 * amount : 0
  const shiftX = Math.sin(safeTime * 0.65) * 0.055 * amount
  const bobY = Math.sin(safeTime * 1.3) * 0.018 * amount

  for (let index = 0; index < regions.length; index += 1) {
    const offset = index * 3
    const region = regions[index]
    if (region === BOY_REGION.TORSO) {
      output[offset] *= breath
      output[offset + 2] *= breath
    }
    if (region === BOY_REGION.RAISED_LOWER) rotateZ(output, offset, -1.45, 2.85, forearmWave)
    if (region === BOY_REGION.RAISED_UPPER || region === BOY_REGION.RAISED_LOWER) rotateZ(output, offset, -0.82, 2.05, wave)
    if (region === BOY_REGION.HEAD) rotateY(output, offset, headYaw)
    output[offset] += shiftX
    output[offset + 1] += bobY
  }
  return output
}
