/**
 * @description 场景生命周期
 */
import { DataTexture, Group, Texture } from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'

/** 场景资源 */
export interface SceneResource {
  texture: Map<string, Texture>
  hdr: Map<string, DataTexture>
  audio: Map<string, AudioBuffer>
  gltf: Map<string, GLTF>
  fbx: Map<string, Group>
  file: Map<string, string | ArrayBuffer>
}

/** 渲染节点尺寸 */
export interface DomElementSize {
  width: number
  height: number
  ascept: number
  ratio: number
  left: number
  right: number
  top: number
  bottom: number
}

/**
 * 生命周期
 * - 顺序：onConfig -> onReady -> onDebug -> onResize -> onUpdate -> onDestory
 */
export interface LifeCycle {
  /**
   * 初始化时调用
   * @returns 无
   */
  onConfig?(): void

  /**
   * 资源加载完毕时调用
   * @param resource 资源
   * @returns 无
   */
  onReady?(resource?: SceneResource): void

  /**
   * 开启 debug 调用
   * @returns 无
   */
  onDebug?(): void

  /**
   * 更新屏幕尺寸调用
   * @param size 屏幕尺寸
   * @returns 无
   */
  onResize?(size?: DomElementSize): void

  /**
   * 更新 requestAnimationFrame 调用
   * @param delta 每轮渲染延迟时间
   * @returns 无
   */
  onUpdate?(delta?: number): void

  /**
   * 卸载调用
   * @returns 无
   */
  onDestory?(): void
}
