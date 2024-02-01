import { Group, Sprite, SpriteMaterial } from 'three'
import { CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { Component } from '@/underline'
import Experience from '../Experience'

/** 标签 */
export default class Label extends Component<Experience> {
  /** 座位标签 */
  private place: Group = null

  constructor(world: Experience) {
    super(world)
  }

  override onReady(): void {
    // 一.座位标签
    this.place = new Group()
    this.world.scene.add(this.place)
    ;['一', '二', '三', '四', '五', '六', '七']
      .reduce((prev, current, currentIndex) => {
        const columns = [1, 2, 3, 4, 5, 6]
        const places = columns.map(item => ({
          label: `${current}排${item}座`,
          value: currentIndex * columns.length + item
        }))
        return [...prev, ...places]
      }, [])
      .forEach((item, index) => {
        const number = index % 6
        const floor = Math.floor(index / 6)

        // 1.构建 three.js 渲染的精灵
        const sprite = new Sprite(
          new SpriteMaterial({ transparent: true, opacity: 0 })
        )
        sprite.position.set(
          -4 + floor * 3,
          0.6 + (floor + 1) * 0.25 + 1.5,
          number > 2 ? -8.25 + 1.5 + number * 3 : -8.25 + number * 3
        )
        sprite.scale.set(1, 1, 1)
        this.place.add(sprite)

        // 2.构建 css 渲染的 dom 节点
        const p = document.createElement('p')
        p.className = 'place'
        p.innerHTML = `${item.label}`

        // 3.关联 dom 节点到精灵
        const cssObject = new CSS3DSprite(p)
        cssObject.position.set(0, 1.5, 0) // 设置 dom 节点与精灵的相对位置
        cssObject.scale.set(0.02, 0.02, 0.02)
        sprite.add(cssObject)
      })
  }

  override onUpdate(): void {
    // 计算座位标签是否显示
    this.place.children.forEach(item => {
      // 求相机到精灵距离，超过指定距离则不显示
      const cssObject = item.children[0] as CSS3DSprite
      if (item.position.distanceTo(this.world.camera.camera.position) < 25) {
        cssObject.visible = true
      } else {
        cssObject.visible = false
      }
    })
  }
}
