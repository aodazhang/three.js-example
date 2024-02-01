/**
 * @description 场景通信
 */
import { isArray, isFunction } from '../utils'

/** 通信 callback */
export type EmitCallBack<T = unknown> = (message?: T) => unknown

/** 通信类 */
export class Emit {
  /** 发布订阅映射 */
  private readonly observer = new Map<string, EmitCallBack[]>()

  /**
   * 发布
   * @param event 事件
   * @param message 参数
   * @returns this
   */
  public notify<T>(event: string, message?: T): Emit {
    const callback = this.observer.get(event)
    isArray(callback) && callback.forEach(fn => fn(message))
    return this
  }

  /**
   * 发布（执行一次后取消订阅）
   * @param event 事件
   * @param message 参数
   * @returns this
   */
  public once<T>(event: string, message?: T): Emit {
    const callback = this.observer.get(event)
    isArray(callback) && callback.forEach(fn => fn(message))
    this.observer.delete(event)
    return this
  }

  /**
   * 订阅
   * @param event 事件
   * @param fn callback
   * @returns this
   */
  public on<T>(event: string, fn: EmitCallBack<T>): Emit {
    let callback = this.observer.get(event)
    !isArray(callback) && (callback = [])
    isFunction(fn) && callback.push(fn)
    this.observer.set(event, callback)
    return this
  }

  /**
   * 取消订阅
   * @param event 事件
   * @param fn callback
   * @returns this
   */
  public off<T>(event: string, fn: EmitCallBack<T>): Emit {
    const callback = this.observer.get(event)
    if (isArray(callback) && isFunction(fn)) {
      const index = callback.findIndex(item => item === fn)
      index > -1 && callback.splice(index, 1)
      this.observer.set(event, callback)
    }
    return this
  }

  /**
   * 取消所有订阅
   * @returns this
   */
  public clear(): Emit {
    // 取消所有订阅
    this.observer.clear()
    return this
  }
}
