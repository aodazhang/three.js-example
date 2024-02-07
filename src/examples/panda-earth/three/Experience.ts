import { ComponentType, DefaultCamera, World } from '@/underline'
import resource from './resource'
import Light from './component/Light'
import Composer from './component/Composer'
import Environment from './component/Environment'
import Earth from './component/Earth'

export default class Experience extends World {
  public light: Light = null
  public camera: DefaultCamera = null
  public composer: Composer = null

  constructor(domElement: HTMLDivElement) {
    super({
      domElement,
      resource,
      useDebug: import.meta.env.VITE_APP_ENV === 'development',
      useCssRenderer: true
    })

    this.light = new Light(this)
    this.camera = this.getComponent(ComponentType.CAMERA)
    this.composer = new Composer(this)

    this.addComponent(this.light)
    this.addComponent(this.composer)
    this.addComponent(new Environment(this))
    this.addComponent(new Earth(this))
  }

  override onConfig(): void {
    super.onConfig()

    // 默认相机调整
    this.camera.camera.position.set(0, 0, 20)
    // 默认相机控制器调整
    this.camera.controls.minDistance = 15
    this.camera.controls.maxDistance = 20
    this.camera.controls.mouseButtons.RIGHT = null
  }
}
