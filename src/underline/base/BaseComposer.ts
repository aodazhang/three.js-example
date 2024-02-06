/**
 * @description 基础合成器
 */
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ComponentType, DomElementSize } from '../type'
import { BaseCamera } from './BaseCamera'
import { Component } from './Component'
import { World } from './World'

/** 合成器基类 */
export class BaseComposer<T extends World = World> extends Component<T> {
  /** 合成器 */
  public composer: EffectComposer = null
  /** 渲染过程 */
  public renderPass: RenderPass = null

  constructor(world: T) {
    super(world, ComponentType.COMPOSER)
  }

  override onConfig(): void {
    const camera = this.world.getComponent<BaseCamera>(ComponentType.CAMERA)
    // 1.合成器
    this.composer = new EffectComposer(this.world.render.renderer)
    // 2.渲染过程
    this.renderPass = new RenderPass(this.world.scene, camera.camera)
    this.composer.addPass(this.renderPass) // 渲染过程需要最先被添加
  }

  override onResize(size: DomElementSize): void {
    const { width, height, ratio } = size
    // 更新合成器像素比、尺寸
    this.composer?.setPixelRatio(ratio)
    this.composer?.setSize(width, height)
  }

  override onUpdate(delta: number): void {
    // 更新合成器
    this.composer?.render(delta)
  }

  override onDestory(): void {
    // 卸载合成器
    this.composer?.dispose()
    this.composer?.renderTarget1.dispose()
    this.composer?.renderTarget2.dispose()
  }
}
