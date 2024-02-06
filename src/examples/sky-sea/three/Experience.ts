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

    this.addComponent(new Environment(this))

    // 关闭默认灯光
    this.removeComponent(this.getComponent(ComponentType.LIGHT))

    this.onConfig()
  }

  override onDebug(): void {
    super.onDebug()

    // 关闭 gridHelper
    const camera = this.getComponent<DefaultCamera>(ComponentType.CAMERA)
    camera.gridHelper.dispose()
    this.scene.remove(camera.gridHelper)
  }
}
