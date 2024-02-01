import {
  CameraHelper,
  MOUSE,
  OrthographicCamera,
  PerspectiveCamera,
  TOUCH,
  Vector3
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MapControls } from 'three/examples/jsm/controls/MapControls'
import { gsap } from 'gsap'
import { Component, DomElementSize, World } from '../base'

/** 相机类 */
export class Camera extends Component {
  /** 相机 */
  public camera: PerspectiveCamera | OrthographicCamera = null
  /** 相机控制器 */
  public controls: OrbitControls | MapControls = null
  /** [debug]相机 helper */
  public cameraHelper: CameraHelper = null

  constructor(world: World) {
    super(world)
  }

  override onConfig(): void {
    // 1.相机
    this.camera = new PerspectiveCamera(45, 1, 1, 1000)
    this.camera.position.set(-60, 60, 100)
    this.camera.lookAt(new Vector3(-70, 10, 10))

    // 2.相机控制器
    this.controls = new MapControls(
      this.camera,
      this.world.render.cssRenderer.domElement
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

  override onDebug(): void {
    // 相机 helper
    this.cameraHelper = new CameraHelper(this.camera)
    this.world.scene.add(this.cameraHelper)
  }

  override onResize(size: DomElementSize): void {
    const { ascept, left, right, top, bottom } = size
    if (this.camera instanceof PerspectiveCamera) {
      // 透视投影相机更新宽高比
      this.camera.aspect = ascept
    } else if (this.camera instanceof OrthographicCamera) {
      // 正交投影相机更新上下左右边界
      this.camera.left = left
      this.camera.right = right
      this.camera.top = top
      this.camera.bottom = bottom
    }
    // 更新相机投影矩阵
    this.camera?.updateProjectionMatrix()
  }

  override onUpdate(): void {
    // 更新相机控制器
    this.controls?.update()
    // 更新相机 helper
    this.cameraHelper?.update()
  }

  override onDestory(): void {
    // 卸载相机控制器
    this.controls?.dispose()
    // 卸载相机 helper
    this.cameraHelper?.dispose()
  }

  /**
   * 相机姿态动画
   * @param position 相机位置
   * @param target 控制器目标点
   * @returns 无
   */
  public animationCamera(position: Vector3, target: Vector3) {
    if (
      !(position instanceof Vector3) ||
      !(target instanceof Vector3) ||
      !this.controls.enabled
    ) {
      return
    }
    const timeline = gsap.timeline({
      defaults: { duration: 1.5, ease: 'power2.inOut' }
    })
    timeline.to(
      this.camera.position,
      { x: position.x, y: position.y, z: position.z },
      0
    )
    timeline.to(
      this.controls.target,
      {
        x: target.x,
        y: target.y,
        z: target.z,
        onStart: () => (this.controls.enabled = false),
        onComplete: () => (this.controls.enabled = true)
      },
      0
    )
  }
}
