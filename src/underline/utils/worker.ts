import { isNumber } from './is'

/**
 * 主线程 -> worker 线程：e.data 获取数据
 */
self.addEventListener('message', e => {
  if (!isNumber(e.data)) {
    return
  }
  console.log('[worker线程]接收数据：', e.data)
  const start = Date.now()

  // worker 中的处理逻辑应避免同步，否则会阻塞主线程 worker.postMessage() 调用
  setTimeout(() => {
    const result = fibonacci(e.data)
    /**
     * worker 线程 -> 主线程：e.data 获取数据
     */
    self.postMessage({ result, time: (Date.now() - start) / 1000 })

    /**
     * 关闭 worker 线程
     */
    self.close()
  })
})

/**
 * worker 线程内部异常时触发
 */
self.addEventListener('error', error => {
  console.error(
    '[worker线程]worker线程异常：',
    error.filename,
    error.lineno,
    error.message
  )
})

/**
 * message 事件参数无法反序列化时触发
 */
self.addEventListener('messageerror', error => {
  console.error('[worker线程]主线程参数异常：', error)
})

/**
 * 计算斐波那契数列的第 n 项
 * @param n 数列位数
 * @returns 计算结果
 */
function fibonacci(n: number): number {
  if (n === 1 || n === 2) {
    return 1
  }
  return fibonacci(n - 1) + fibonacci(n - 2)
}

export default self
