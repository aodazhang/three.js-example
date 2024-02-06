import { CameraHelper, MOUSE, PerspectiveCamera, TOUCH, Vector3 } from 'three'
import { MapControls } from 'three/examples/jsm/controls/MapControls'
import { BaseCamera } from '@/underline'
import Experience from '../Experience'

/** 相机 */
export default class Camera extends BaseCamera<Experience> {
  /** [debug]相机 helper */
  private cameraHelper: CameraHelper = null

  constructor(world: Experience) {
    super(world)
  }

  override onConfig(): void {
    // 1.相机
    this.camera = new PerspectiveCamera(45, 1, 1, 1000)
    this.camera.position.set(-60, 60, 100)
    this.camera.lookAt(new Vector3(0, 0, 0))

    // 2.相机控制器
    this.controls = new MapControls(
      this.camera,
      this.world.render.renderer.domElement
    )
    this.controls.target.set(0, 0, 0)
    this.controls.enableDamping = true // 开启运动阻尼惯性
    this.controls.minPolarAngle = Math.PI / 10 // 最小俯视角度
    this.controls.maxPolarAngle = Math.PI / 2.3 // 最大俯视角度
    this.controls.minDistance = 1 // 最小距离
    this.controls.maxDistance = 200 // 最大距离
    this.controls.mouseButtons = {
      LEFT: MOUSE.PAN,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.ROTATE
    } // 设置控制器鼠标操作行为
    this.controls.touches = {
      ONE: TOUCH.PAN,
      TWO: null
    } // 设置控制器触控操作行为
  }

  public onDebug(): void {
    // 相机 helper：该 helper 会导致页面渲染出现黄边
    this.cameraHelper = new CameraHelper(this.camera)
    this.world.scene.add(this.cameraHelper)
  }

  override onUpdate(): void {
    // 更新相机控制器
    super.onUpdate()
    // 更新相机 helper
    this.cameraHelper?.update()
  }
}
