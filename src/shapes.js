import { createBoy } from './subjects/boy.js'
import { createIndia } from './subjects/india.js'
import { createConstellation } from './subjects/constellation.js'
import { createPortal } from './subjects/portal.js'
import { seededRandom } from './subjects/shared.js'
export { seededRandom } from './subjects/shared.js'

export const SECTION_IDS = ['hero', 'experience', 'skills', 'contact']
export const PARTICLE_COUNT = 20000

export function createSubjectTargets(count = PARTICLE_COUNT) {
  if (!Number.isInteger(count) || count < 1) throw new Error('INVALID_PARTICLE_COUNT')
  const random = seededRandom(31031)
  const phaseRandom = seededRandom(91031)
  const boy = createBoy(count, random)
  const india = createIndia(count, random)
  return {
    targets: [
      boy.positions,
      india.positions,
      createConstellation(count, random),
      createPortal(count, random),
    ],
    boyRegions: boy.regions,
    indiaOutlineCount: india.outlineCount,
    phases: Float32Array.from({ length: count }, phaseRandom),
  }
}

export function createShapeTargets(count = PARTICLE_COUNT) {
  return createSubjectTargets(count).targets
}
