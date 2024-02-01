/**
 * @description Web 存储
 */
import { isArray } from './is'

/** web 存储对象 */
class StorageModel {
  /** 时间戳 */
  public readonly timestamp: number = Date.now()
  /** 数据 */
  public data: unknown = null

  constructor(data: unknown) {
    this.data = data
  }
}

/**
 * 获取 web 存储完整 key
 * @param key 数据 key
 * @returns 完整 key
 */
const fullKey = (key: string) => `${import.meta.env.VITE_APP_STORAGE}_${key}`

/**
 * 增、改 storage 指定 key
 * @param key 数据 key
 * @param value 数据
 * @returns 无
 */
function setItem(key: string, value: unknown): void {
  const data = JSON.stringify(new StorageModel(value))
  window.localStorage.setItem(fullKey(key), data)
}

/**
 * 查 storage 指定 key
 * @param key 数据 key
 * @returns 查询结果
 */
function getItem<T = unknown>(key: string): T {
  const data = window.localStorage.getItem(fullKey(key))
  try {
    const parseData = JSON.parse(data)
    return parseData.data
  } catch (error) {
    return null
  }
}

/**
 * 删 storage 指定 key
 * @param key 数据 key
 * @returns 无
 */
function removeItem(key: string): void {
  window.localStorage.removeItem(fullKey(key))
}

/**
 * 删 storage 所有 key
 * @param ignoreKeys 忽略删除的数据 key
 * @returns 无
 */
function removeAllItem(ignoreKeys?: string[]): void {
  isArray(ignoreKeys)
    ? (ignoreKeys = ignoreKeys.map(key => fullKey(key)))
    : (ignoreKeys = [])
  Object.keys(window.localStorage).forEach(key => {
    if (
      key.startsWith(import.meta.env.VITE_APP_STORAGE) &&
      !ignoreKeys.includes(key)
    ) {
      window.localStorage.removeItem(key)
    }
  })
}

export default { setItem, getItem, removeItem, removeAllItem }
