import { Color } from 'three'
import { Component, World } from '../base'

/** 环境类 */
export class Environment extends Component {
  constructor(world: World) {
    super(world)
  }

  override onConfig(): void {
    // 设置场景背景色
    this.world.scene.background = new Color(0x111111)
  }
}
