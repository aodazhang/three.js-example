/**
 * @description 生命周期
 */
import { DomElementSize, SceneResource } from '../type'

/**
 * 生命周期
 * - 顺序：onConfig -> onReady -> onDebug -> onResize -> onUpdate -> onDestory
 */
export interface LifeCycle {
  /**
   * 初始化（一次）
   * @returns 无
   */
  onConfig?(): void

  /**
   * 资源加载完毕（一次）
   * @param resource 资源
   * @returns 无
   */
  onReady?(resource?: SceneResource): void

  /**
   * 开启 debug（一次）
   * @returns 无
   */
  onDebug?(): void

  /**
   * 更新屏幕尺寸（多次）
   * @param size 屏幕尺寸
   * @returns 无
   */
  onResize?(size?: DomElementSize): void

  /**
   * 更新 requestAnimationFrame（多次）
   * @param delta 每轮渲染延迟时间
   * @returns 无
   */
  onUpdate?(delta?: number): void

  /**
   * 卸载（一次）
   * @returns 无
   */
  onDestory?(): void
}
