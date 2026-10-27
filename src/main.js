import { createHttpPersistence, mountProjectPreview, mountReviewedProject } from '@edit3d/sdk/editor'
import { createProject } from './project.js'
import { initSite } from './site.js'
import review from './review.js'

const parameters = new URLSearchParams(window.location.search)
const embedded = parameters.has('kimiScene') || parameters.has('edit')
const container = document.getElementById('app')
document.body.classList.toggle('embedded-mode', embedded)
if (!embedded) initSite()

async function main() {
  try {
    const project = createProject()
    if (embedded) {
      await mountReviewedProject({
        review,
        persistence: createHttpPersistence(),
        container,
        project,
      })
    } else {
      const preview = await mountProjectPreview({ container, project })
      await preview.play()
      document.documentElement.dataset.webgl = 'ready'
      const status = document.getElementById('scene-status-text')
      if (status) status.textContent = 'Particle portrait online'
    }
  } catch (error) {
    console.error('[Portfolio] 3D initialization failed:', error)
    if (embedded) {
      container.textContent = `3D editor could not start: ${error.message}`
    } else {
      document.documentElement.dataset.webgl = 'unavailable'
      const status = document.getElementById('scene-status-text')
      if (status) status.textContent = 'Static portfolio mode'
    }
  }
}

main()
