import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { World } from '@/underline'
import resource from './resource'
import Light from './component/Light'
import { Composer } from './component/Composer'
import Environment from './component/Environment'
import Earth from './component/Earth'

export default class Experience extends World {
  constructor(domElement: HTMLDivElement) {
    super({
      domElement,
      resource,
      useDebug: import.meta.env.VITE_APP_ENV === 'development',
      useDefaultLight: false,
      useDefaultComposer: false,
      useDefaultShadowMap: false,
      useDefaultControls: false
    })

    this.light = new Light(this) as any
    this.composer = new Composer(this) as any

    this.addComponent(new Environment(this))
    this.addComponent(new Earth(this))

    this.onConfig()

    // 1.调整默认相机位置
    this.camera.camera.position.set(0, 0, 20)
    // 2.覆盖默认的相机控制器
    this.camera.controls = new OrbitControls(
      this.camera.camera,
      this.render.cssRenderer.domElement
    )
    this.camera.controls.target.set(0, 0, 0)
    this.camera.controls.enableDamping = true
    this.camera.controls.minDistance = 15
    this.camera.controls.maxDistance = 20
    this.camera.controls.mouseButtons.RIGHT = null
  }
}
