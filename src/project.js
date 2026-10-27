import { createScene } from './scene.js'

export function createProject() {
  return {
    id: 'akshant-data-universe',
    name: 'Akshant Kumar · Particle Portrait',
    defaultSceneId: 'main',
    scenes: [{ id: 'main', name: 'Immersive Particle Portrait', createScene }],
  }
}
