import { ComponentType, DefaultCamera, DefaultLight, World } from '@/underline'
import resource from './resource'
import Environment from './component/Environment'
import Map from './component/Map'

export default class Experience extends World {
  constructor(domElement: HTMLDivElement) {
    super({
      domElement,
      resource,
      useDebug: import.meta.env.VITE_APP_ENV === 'development'
    })

    this.addComponent(new Environment(this))
    this.addComponent(new Map(this))
  }

  override onConfig(): void {
    super.onConfig()

    const camera = this.getComponent<DefaultCamera>(ComponentType.CAMERA)
    camera.camera.position.set(0, 90, 90)

    const light = this.getComponent<DefaultLight>(ComponentType.LIGHT)
    light.directional.position.set(83, 30, 100)
  }
}
