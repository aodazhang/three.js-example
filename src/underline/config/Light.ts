import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  DirectionalLightHelper,
  Mesh,
  MeshBasicMaterial
} from 'three'
import { Component, World } from '../base'

/** 灯光类 */
export class Light extends Component {
  /** 环境光 */
  public ambient: AmbientLight = null
  /** 平行光 */
  public directional: DirectionalLight = null
  /** [debug]平行光 helper */
  private directionalHelper: DirectionalLightHelper = null

  constructor(world: World) {
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
    // [阴影]平行光阴影参数（投射阴影）
    if (this.world.options.useDefaultShadowMap === true) {
      this.directional.castShadow = true // 灯光开启阴影贴图
      this.directional.shadow.mapSize.set(1024, 1024) // 阴影贴图分辨率：默认 512*512，越高阴影越清晰，值必须是 2 的幂
      this.directional.shadow.radius = 0.35 // 阴影贴图模糊半径：> 1 时会模糊阴影边缘
      /**
       * 阴影贴图投射范围：范围外将不计算阴影贴图，可以节约系统资源（默认值很小，需要设置，相当于将平行灯作为透视相机使用）
       * - 平行光阴影必须要设置 near、far、left、right、top、bottom
       * - 聚光灯阴影必须要设置 near、far、fov
       */
      this.directional.shadow.camera.near = 0
      this.directional.shadow.camera.far = 500
      this.directional.shadow.camera.top = 200
      this.directional.shadow.camera.bottom = -200
      this.directional.shadow.camera.left = -200
      this.directional.shadow.camera.right = 200
    }
  }

  override onDebug(): void {
    // 面板控制器
    this.world.gui
      .add(this.directional.position, 'x')
      .name('平行光 x')
      .min(-500)
      .max(500)
      .step(1)
    this.world.gui
      .add(this.directional.position, 'y')
      .name('平行光 y')
      .min(-500)
      .max(500)
      .step(1)
    this.world.gui
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
