/**
 * @description 资源
 */
import { isArray } from './utils'

/** three.js 静态资源 */
const resource = new Map<string, string>()

/**
 * 采用 vite 导入方式：https://cn.vitejs.dev/guide/features.html#glob-import
 *
 * 导入数据结构示例：
 * const modules = {
 *  '/src/assets/3d/taodouTicket.gltf': {
 *    default: 'http://localhost:5173/assets/taodouTicket-e1ee704e.gltf'
 *  }
 * }
 */
const modules = import.meta.glob<true, string, { default: string }>(
  [
    '@/assets/3d/*.gltf',
    '@/assets/3d/*.glb',
    '@/assets/3d/*.FBX',
    '@/assets/audio/*.mp3',
    '@/assets/audio/*.mp4',
    '@/assets/audio/*.wav',
    '@/assets/hdr/*.hdr',
    '@/assets/texture/*.jpg',
    '@/assets/texture/*.jpeg',
    '@/assets/texture/*.png',
    '@/assets/texture/*.gif',
    '@/assets/texture/*.bmp',
    '@/assets/texture/*.webp'
  ],
  { eager: true }
)

Object.entries(modules).forEach(([key, value]) => {
  const keys = key.match(
    /(?!=\/)\w+(?=\.(jpg|jpeg|png|gif|bmp|webp|svg|hdr|mp3|mp4|wav|json|xml|gltf|glb|FBX))/g
  )
  if (!isArray(keys)) {
    return
  }
  if (resource.has(keys[0])) {
    throw `assets存在重名资源：${key}`
  }
  resource.set(keys[0], value.default)
})

export default resource
