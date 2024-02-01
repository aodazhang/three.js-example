/**
 * @description 随机
 * @see Math.random()的取值范围为[0,1)
 */
import { isArray, isNumber } from './is'

/**
 * 求两数之间的一个随机数
 * @param min 最小值
 * @param max 最大值
 * @param float 是否小数
 * @returns [最小值, 最大值] 随机数
 */
export function randomNumber(
  min: number,
  max: number,
  float?: boolean
): number {
  let num: number = null
  if (!isNumber(min) || !isNumber(max)) {
    return num
  }
  min > max
    ? (num = max + Math.random() * (min - max))
    : (num = min + Math.random() * (max - min))
  return float === true ? num : Math.round(num)
}

/**
 * 求数组中的一个随机下标对应的值
 * @param arr 数组
 * @returns 随机下标对应的值
 */
export function randomArrayIndex(arr: number[]): number {
  if (!isArray(arr)) {
    return null
  }
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

/**
 * 生成随机 rgb 颜色
 * @returns rgb 颜色
 */
export function randomRgb() {
  const red = randomNumber(100, 255)
  const green = randomNumber(100, 255)
  const blue = randomNumber(100, 255)
  return `rgb(${red}, ${green}, ${blue})`
}
