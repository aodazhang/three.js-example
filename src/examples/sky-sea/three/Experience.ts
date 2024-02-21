import { ComponentType, DefaultCamera, World } from '@/underline'
import resource from './resource'
import Environment from './component/Environment'

export default class Experience extends World {
  constructor(domElement: HTMLDivElement) {
    super({
      domElement,
      resource,
      useDebug: import.meta.env.VITE_APP_ENV === 'development'
    })

    // 关闭默认灯光
    this.removeComponent(this.getComponent(ComponentType.LIGHT))
    this.addComponent(new Environment(this))
  }

  override onConfig(): void {
    super.onConfig()

    const camera = this.getComponent<DefaultCamera>(ComponentType.CAMERA)
    camera.camera.position.set(-30, 30, 60)
  }

  override onDebug(): void {
    super.onDebug()

    const camera = this.getComponent<DefaultCamera>(ComponentType.CAMERA)
    camera.gridHelper?.dispose()
    this.scene.remove(camera.gridHelper)
  }
}
