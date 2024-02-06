/**
 * @description 基础相机
 */
import { OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MapControls } from 'three/examples/jsm/controls/MapControls'
import gsap from 'gsap'
import { ComponentType, DomElementSize } from '../type'
import { Component } from './Component'
import { World } from './World'

/** 相机基类 */
export class BaseCamera<T extends World = World> extends Component<T> {
  /** 相机 */
  public camera: PerspectiveCamera | OrthographicCamera = null
  /** 相机控制器 */
  public controls: OrbitControls | MapControls = null

  constructor(world: T) {
    super(world, ComponentType.CAMERA)
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
  }

  override onDestory(): void {
    // 卸载相机控制器
    this.controls?.dispose()
  }

  /**
   * 相机姿态动画
   * @param position 相机位置
   * @param target 控制器目标点
   * @returns 无
   */
  public animationCamera(position: Vector3, target: Vector3) {
    if (
      !this.controls ||
      !this.controls.enabled ||
      !(position instanceof Vector3) ||
      !(target instanceof Vector3)
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
