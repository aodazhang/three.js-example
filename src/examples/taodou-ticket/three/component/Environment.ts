import { Color, EquirectangularReflectionMapping } from 'three'
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
    // 一.HDR环境贴图
    const envMap = resource.hdr.get('hdr2')
    // 设置贴图映射模式：经纬线映射（球天）
    envMap.mapping = EquirectangularReflectionMapping
    // 设置场景背景：单纯设置场景背景，不影响场景内物体反射
    this.world.scene.background = envMap
    // 设置场景环境贴图：为场景内所有未设置 envMap 的材质添加环境贴图
    this.world.scene.environment = envMap
  }
}
