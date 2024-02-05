/**
 * @description 场景组件
 */
import {
  Audio,
  AudioAnalyser,
  AudioListener,
  Intersection,
  Object3D,
  PositionalAudio,
  Raycaster,
  Vector2
} from 'three'
import { isArray } from '../utils'
import { DomElementSize, LifeCycle, SceneResource, World } from '.'

/** 组件类 */
export class Component<T extends World = World> implements LifeCycle {
  /** 世界实例 */
  protected readonly world: T = null

  constructor(world?: T) {
    this.world = world || null
  }

  /* eslint-disable */
  public onConfig(): void {}

  // @ts-ignore
  public onReady(resource?: SceneResource): void {}

  public onDebug(): void {}

  // @ts-ignore
  public onResize(size?: DomElementSize): void {}

  // @ts-ignore
  public onUpdate(delta?: number): void {}

  public onDestory(): void {}
  /* eslint-enable */

  /**
   * 点击坐标归一化为设备坐标
   * x方向：[-1, 1]
   * y方向：[1, -1]
   * @param e 鼠标事件
   * @returns 设备坐标
   */
  protected normalization(e: MouseEvent): Vector2 {
    const { width, height } = this.world?.domElementSize || {}
    return new Vector2(
      (e.offsetX / width) * 2 - 1,
      -(e.offsetY / height) * 2 + 1
    )
  }

  /**
   * 检测设备坐标和射线聚焦的物体
   * @param coord 设备坐标
   * @param objects 检测物体
   * @returns 聚焦物体
   */
  protected raycasterIntersection(
    coord: Vector2,
    objects: Object3D | Object3D[]
  ): Intersection<Object3D> {
    // 1.实例化射线
    const raycaster = new Raycaster()
    // 2.通过 设备坐标 + 场景相机 更新射线
    raycaster.setFromCamera(coord, this.world?.camera.camera)
    // 3.计算物体和射线的焦点
    const intersects = raycaster.intersectObjects(
      isArray(objects) ? objects : [objects],
      true // 是否递归寻找子对象
    )
    // 4.存在聚焦对象则返回
    return intersects[0] ?? null
  }

  /**
   * 创建音频
   * @param isAnalyser 是否同时创建音频分析器
   * @returns 音频实例
   */
  protected createAudio(isAnalyser?: boolean) {
    // 1.创建音频监听器
    const listener = new AudioListener()
    // 2.创建普通音频对象，绑定音频监听器
    const audio = new Audio(listener)
    // 3.根据音频对象创建分析器
    let analyser = null
    // 4.音频频谱数据：默认 2048（返回 Uint16Array 1024），一般设定为 128（返回 Uint16Array 67）
    const fftSize = 128
    isAnalyser === true && (analyser = new AudioAnalyser(audio, fftSize))
    return { audio, analyser, fftSize }
  }

  /**
   * 创建位置音频
   * @param isAnalyser 是否同时创建音频分析器
   * @returns 位置音频实例
   */
  protected createPositionAudio(isAnalyser?: boolean) {
    // 1.创建音频监听器
    const listener = new AudioListener()
    // 2.摄像机绑定音频监听器
    this.world?.camera.camera.add(listener)
    // 3.创建位置音频对象，绑定音频监听器
    const positionalAudio = new PositionalAudio(listener)
    // 4.根据音频对象创建分析器
    let analyser = null
    // 5.音频频谱数据：默认 2048（返回 Uint16Array 1024），一般设定为 128（返回 Uint16Array 67）
    const fftSize = 128
    isAnalyser === true &&
      (analyser = new AudioAnalyser(positionalAudio, fftSize))
    return { positionalAudio, analyser, fftSize }
  }
}
