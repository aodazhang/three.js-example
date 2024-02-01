/**
 * @description worker
 * @extends https://juejin.cn/post/7139718200177983524
 */

/**
 * 1.worker 使用情况
 * - 时间性质：长任务耗时 - 通信耗时 > 50ms
 * - 图像处理：旋转、裁剪、缩放、滤镜等。
 * - 数据处理：过滤、排序、归纳、转换等。
 * - 计算密集型：模拟、优化、预测、统计等。
 * - 实时通信：聊天室、游戏、视频会议等。
 * - 多线程处理：并行计算、任务分发、负载均衡等。
 *
 * 2.worker 类型对 worker 线程导入导出文件的影响
 * - classic：引入外部文件 importScripts('./xxx.js')。
 * - module：引入外部文件 import a from './xxx.js' + worker 文件 export default self。
 *
 * 3.worker 线程不可传递的数据类型
 * - 基本数据类型：symbol。
 * - 引用数据类型：error、function、对象的原型链及属性描述符。
 * - 特殊类型：dom节点。
 *
 * 3.worker 线程访问 api 限制
 * - 无法访问：window 对象、dom 对象。
 * - 可以使用：定时器、navigator、location、XMLHttpRequest 等。
 *
 * 4.关闭 worker 线程
 * - 主线程关闭 worker 线程：立即停止主线程与 worker 线程之间的连接，主线程不会接收到后续 message。
 * - worker 线程关闭 worker 线程：等待 worker 线程当前的 Event Loop 内任务执行结束后停止主线程与 worker 线程之间的连接。
 */

/**
 * 主线程
 * 注：webpack 打包的项目无法直接引入 worker.ts，通过 new URL('./worker.ts', import.meta.url) hack路径问题
 */
const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module', // worker 类型：'classic'-经典（默认）、'module'-ES6 模块化
  credentials: 'omit' // 凭证类型：'omit'-不需要（默认）、'same-origin'-同源跨域
})

/**
 * 主线程 -> worker 线程：e.data 获取数据
 */
worker.postMessage(45)
worker.postMessage(40)

/**
 * worker 线程 -> 主线程：e.data 获取数据
 */
worker.addEventListener('message', e => {
  console.log('[主线程]接收数据：', e.data)
})

/**
 * worker 线程内部异常时触发
 */
worker.addEventListener('error', error => {
  console.error(
    '[主线程]worker线程异常：',
    error.filename,
    error.lineno,
    error.message
  )
})

/**
 * message 事件参数无法反序列化时触发
 */
worker.addEventListener('messageerror', error => {
  console.error('[主线程]worker线程参数异常：', error)
})

/**
 * 关闭 worker 线程
 */
// worker.terminate()
