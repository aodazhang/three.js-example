import taodouTicket from '@/assets/3d/taodouTicket.gltf'
import hdr2 from '@/assets/hdr/hdr2.hdr'
import tree from '@/assets/texture/tree.png'
import rain from '@/assets/texture/rain.png'

/** three.js静态资源 */
const resource = new Map<string, string>([
  ['taodouTicket', taodouTicket],
  ['hdr2', hdr2],
  ['tree', tree],
  ['rain', rain]
])

export default resource
