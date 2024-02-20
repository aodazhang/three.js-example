import { Color, Fog } from 'three'
import { Component } from '@/underline'
import Experience from '../Experience'

/** 环境类 */
export default class Environment extends Component<Experience> {
  constructor(world: Experience) {
    super(world)
  }

  override onConfig(): void {
    // 设置场景背景色和雾色
    this.world.scene.background = new Color(0x011024)
    this.world.scene.fog = new Fog(0x011024, 1, 500)
  }
}
