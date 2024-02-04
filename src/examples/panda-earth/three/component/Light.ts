import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  DirectionalLightHelper,
  Mesh,
  MeshBasicMaterial
} from 'three'
import { Component } from '@/underline'
import Experience from '../Experience'

/** 灯光 */
export default class Light extends Component {
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
    // 一.环境光
    this.ambient = new AmbientLight(0x8ae2ff, 2.8)
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
    this.directional = new DirectionalLight(0xffffff, 4.35)
    this.directional.target = directionalTarget

    this.directional.position.set(38, 33, 48)
    this.world.scene.add(this.directional)
  }

  override onDebug(): void {
    // 面板控制器
    const folder = this.world.gui.addFolder('灯光')
    folder.addColor(this.ambient, 'color').name('环境光色')
    folder
      .add(this.ambient, 'intensity')
      .name('环境光强度')
      .min(0)
      .max(5)
      .step(0.1)
    folder
      .add(this.directional.position, 'x')
      .name('主灯位置 x')
      .min(-500)
      .max(500)
      .step(1)
    folder
      .add(this.directional.position, 'y')
      .name('主灯位置 y')
      .min(-500)
      .max(500)
      .step(1)
    folder
      .add(this.directional.position, 'z')
      .name('主灯位置 z')
      .min(-500)
      .max(500)
      .step(1)
    folder.addColor(this.directional, 'color').name('主灯光色')
    folder
      .add(this.directional, 'intensity')
      .name('主灯强度')
      .min(0)
      .max(5)
      .step(0.1)

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
