import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  DirectionalLightHelper,
  Mesh,
  MeshBasicMaterial
} from 'three'
import { BaseLight } from '@/underline'
import Experience from '../Experience'

/** 灯光 */
export default class Light extends BaseLight<Experience> {
  /** 环境光 */
  public ambient: AmbientLight = null
  /** 平行光 */
  public directional: DirectionalLight = null
  /** [debug]平行光 helper */
  private directionalHelper: DirectionalLightHelper = null

  constructor(world: Experience) {
    super(world)
  }

  override onConfig(): void {
    // 1.环境光
    this.ambient = new AmbientLight(0xf9cfff, 0.65)
    this.world.scene.add(this.ambient)

    // 2.平行光
    // 平行光目标点
    const directionalTarget = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({ color: 0xff0000 })
    )
    directionalTarget.position.set(0, 0, 0)
    this.world.scene.add(directionalTarget)
    // 平行光
    this.directional = new DirectionalLight(0xcfebff, 0.4)
    this.directional.name = 'directional'
    this.directional.target = directionalTarget
    this.directional.position.set(30, 60, -100)
    this.world.scene.add(this.directional)
  }

  override onDebug(): void {
    // 面板控制器
    const folder = this.world.gui.addFolder('灯光')
    folder
      .add(this.directional.position, 'x')
      .name('平行光 x')
      .min(-500)
      .max(500)
      .step(1)
    folder
      .add(this.directional.position, 'y')
      .name('平行光 y')
      .min(-500)
      .max(500)
      .step(1)
    folder
      .add(this.directional.position, 'z')
      .name('平行光 z')
      .min(-500)
      .max(500)
      .step(1)

    // 平行光 helper
    this.directionalHelper = new DirectionalLightHelper(this.directional, 20)
    this.world.scene.add(this.directionalHelper)
  }

  override onUpdate(): void {
    // 更新平行光 helper
    this.directionalHelper?.update()
  }

  override onDestory(): void {
    // 卸载环境光
    this.ambient.dispose()
    // 卸载平行光
    this.directional.dispose()
    // 卸载平行光 helper
    this.directionalHelper?.dispose()
  }
}
