/**
 * @description 工具
 */
import { isFunction, isNumber } from './is'

/**
 * 防抖
 * @param fn 目标函数
 * @param delay 延迟时间
 * @returns 包装函数
 */
export function toolDebounce(
  fn: unknown,
  delay?: number
): (...rest: unknown[]) => void {
  !isNumber(delay) && (delay = 200)
  let timer: NodeJS.Timeout = null
  return function (...rest: unknown[]) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      isFunction(fn) && Reflect.apply(fn, fn, rest)
    }, delay)
  }
}

/**
 * 节流
 * @param fn 目标函数
 * @param delay 间隔时间
 * @returns 包装函数
 */
export function toolThrottle(
  fn: unknown,
  delay?: number
): (...rest: unknown[]) => void {
  !isNumber(delay) && (delay = 200)
  let lastTime = new Date().getTime()
  return function (...rest: unknown[]) {
    const nowTime = new Date().getTime()
    if (nowTime - lastTime >= delay) {
      isFunction(fn) && Reflect.apply(fn, fn, rest)
      lastTime = nowTime
    }
  }
}
