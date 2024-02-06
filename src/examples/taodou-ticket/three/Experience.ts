import { SceneResource, World } from '@/underline'
import resource from './resource'
import Light from './component/Light'
import Camera from './component/Camera'
import Composer from './component/Composer'
import Environment from './component/Environment'
import Label from './component/Label'
import Rect from './component/Rect'
import TaodouTicket from './component/TaodouTicket'

export default class Experience extends World {
  public light: Light = null
  public camera: Camera = null
  public composer: Composer = null

  constructor(domElement: HTMLDivElement) {
    super({
      domElement,
      resource,
      useDebug: import.meta.env.VITE_APP_ENV === 'development',
      useCssRenderer: true
    })

    this.light = new Light(this)
    this.camera = new Camera(this)
    this.composer = new Composer(this)

    this.addComponent(this.light)
    this.addComponent(this.camera)
    this.addComponent(this.composer)
    this.addComponent(new Environment(this))
    this.addComponent(new Label(this))
    this.addComponent(new Rect(this))
    this.addComponent(new TaodouTicket(this))

    this.onConfig()
  }

  override onReady(resource?: SceneResource): void {
    super.onReady(resource)

    // 启动相机复位
    this.notify('reset')
  }
}
