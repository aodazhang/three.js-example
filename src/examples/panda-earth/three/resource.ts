import { isArray } from '@/underline'
import diqiu from '@/assets/3d/diqiu.fbx'
import bg1 from '@/assets/texture/bg1.jpeg'
import diqiut from '@/assets/texture/diqiu.jpeg'

/** three.js 静态资源 */
const resource = new Map<string, string>([
  ['diqiu', diqiu],
  ['bg1', bg1],
  ['diqiut', diqiut]
])

const modules = import.meta.glob<true, string, { default: string }>(
  ['@/assets/texture/country/*.JPEG', '@/assets/texture/country/*.PNG'],
  { eager: true }
)

Object.entries(modules).forEach(([key, value]) => {
  const keys = key.match(
    /(?!=\/)\w+(?=\.(jpg|jpeg|png|gif|bmp|webp|svg|hdr|mp3|mp4|wav|json|xml|gltf|glb|fbx))/gi
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
