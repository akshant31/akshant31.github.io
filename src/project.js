import { createScene } from './scene.js'

export function createProject() {
  return {
    id: 'akshant-data-universe',
    name: 'Akshant Kumar · Data Universe',
    defaultSceneId: 'main',
    scenes: [{ id: 'main', name: 'Particle Data Universe', createScene }],
  }
}
