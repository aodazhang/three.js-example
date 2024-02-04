import { Color, RepeatWrapping } from 'three'
import { Component, SceneResource } from '@/underline'
import Experience from '../Experience'

/** 环境类 */
export default class Environment extends Component<Experience> {
  constructor(world: Experience) {
    super(world)
  }

  override onConfig(): void {
    // 设置场景背景色
    this.world.scene.background = new Color(0x111111)
  }

  override onReady(resource?: SceneResource): void {
    // 1.设置场景背景
    const bg1 = resource.texture.get('bg1')
    bg1.wrapS = RepeatWrapping
    bg1.wrapT = RepeatWrapping
    bg1.repeat.set(1, 1)
    this.world.scene.background = resource.texture.get('bg1')
  }
}
