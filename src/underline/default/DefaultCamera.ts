import {
  AxesHelper,
  CameraHelper,
  GridHelper,
  PerspectiveCamera,
  Vector3
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BaseCamera, World } from '../base'

/** 默认相机 */
export class DefaultCamera extends BaseCamera {
  /** [debug]相机 helper */
  public cameraHelper: CameraHelper = null
  /** [debug]坐标轴 helper */
  public axesHelper: AxesHelper = null
  /** [debug]网格 helper */
  public gridHelper: GridHelper = null

  constructor(world: World) {
    super(world)
  }

  override onConfig(): void {
    // 1.相机
    this.camera = new PerspectiveCamera(45, 1, 1, 1000)
    this.camera.position.set(-30, 30, 60)
    this.camera.lookAt(new Vector3(0, 0, 0))

    // 2.相机控制器
    this.controls = new OrbitControls(
      this.camera,
      this.world.render.renderer.domElement
    )
    this.controls.target.set(0, 0, 0)
    this.controls.enableDamping = true // 开启运动阻尼惯性
    this.controls.minDistance = 1 // 最小距离
    this.controls.maxDistance = 100 // 最大距离
  }

  override onDebug(): void {
    // 相机 helper：该 helper 会导致页面渲染出现黄边
    this.cameraHelper = new CameraHelper(this.camera)
    this.world.scene.add(this.cameraHelper)
    // 坐标轴 helper
    this.axesHelper = new AxesHelper(100)
    this.world.scene.add(this.axesHelper)
    // 网格 helper
    this.gridHelper = new GridHelper(200, 200)
    this.world.scene.add(this.gridHelper)
  }

  override onUpdate(_delta?: number): void {
    // 更新相机控制器
    super.onUpdate()
    // 更新相机 helper
    this.cameraHelper?.update()
  }

  override onDestory(): void {
    // 卸载相机控制器
    super.onDestory()
    // 卸载相机 helper
    this.cameraHelper?.dispose()
    // 卸载坐标轴 helper
    this.axesHelper?.dispose()
    // 卸载网格 helper
    this.gridHelper?.dispose()
  }
}
