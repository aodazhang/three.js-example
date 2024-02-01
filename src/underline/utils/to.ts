/**
 * @description 转换
 */
import { isNumber } from './is'

/**
 * 角度转弧度
 * - 1° = 2 * Math.PI / 360 = (Math.PI / 180) 弧度
 * @param angle 角度
 * @returns 弧度
 */
export function toRad(angle: number): number {
  return isNumber(angle) ? angle * (Math.PI / 180) : 0
}

/**
 * 弧度转角度
 * - 1弧度 = 360 / 2 * Math.PI = (180 / Math.PI)°
 * @param rad 弧度
 * @returns 角度
 */
export function toAngle(rad: number): number {
  return isNumber(rad) ? rad * (180 / Math.PI) : 0
}

/**
 * 浏览器坐标转 canvas 坐标
 * @param e 鼠标事件
 * @param ctx canvas 绘图上下文
 * @returns canvas 坐标
 */
export function toCanvasCoordinate(
  e: MouseEvent,
  ctx: CanvasRenderingContext2D
) {
  // 获取浏览器坐标
  const { clientX, clientY } = e
  // 获取 canvas 左上角坐标
  const { left, top } = ctx.canvas.getBoundingClientRect()
  return {
    x: Math.round(clientX - left), // 取整
    y: Math.round(clientY - top)
  }
}
