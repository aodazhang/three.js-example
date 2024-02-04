import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader'
import { Component, DomElementSize } from '@/underline'
import Experience from '../Experience'
import vertexShader from '../shader/Colorful/vertexShader.glsl'
import fragmentShader from '../shader/Colorful/fragmentShader.glsl'
import { ShaderMaterial } from 'three'

/** 后期处理 */
export class Composer extends Component {
  /** 效果合成器 */
  public composer: EffectComposer = null
  /** 渲染过程处理 */
  public renderPass: RenderPass = null
  /** 伽马校正处理：对应 renderer.outputColorSpace，用于解决使用 EffectComposer 后颜色异常的 bug（例如变暗） */
  public shaderPass: ShaderPass = null
  /** SMAA 抗锯齿处理：效果优于 FXAA */
  public smaaPass: SMAAPass = null
  public readonly uniforms: { [key: string]: { value: unknown } } = {
    uDiffuse: { value: null },
    uBrightness: { value: 0.0 },
    uContrast: { value: 1.07 },
    uSaturation: { value: 1.74 }
  }

  constructor(world: Experience) {
    super(world)
  }

  override onConfig(): void {
    // 1.效果合成器
    this.composer = new EffectComposer(this.world.render.renderer)

    // 2.渲染过程处理
    this.renderPass = new RenderPass(this.world.scene, this.world.camera.camera)
    this.composer.addPass(this.renderPass) // 渲染过程需要最先被添加

    // 3.伽马校正处理：对应 renderer.outputColorSpace，用于解决使用 EffectComposer 后颜色异常的 bug（例如变暗）
    this.shaderPass = new ShaderPass(GammaCorrectionShader)
    this.composer.addPass(this.shaderPass)

    // 4.颜色处理
    const shaderPass = new ShaderPass(
      new ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader,
        fragmentShader
      }),
      'uDiffuse' // 将 composer 的渲染结果作为 uDiffuse 变量传入，在片元着色器内通过 texture2D 获取
    )
    this.composer.addPass(shaderPass)

    // 7.SMAA 抗锯齿处理：效果优于 FXAA
    this.smaaPass = new SMAAPass(100, 100)
    this.composer.addPass(this.smaaPass)
  }

  override onDebug(): void {
    // 面板控制器
    const folder = this.world.gui.addFolder('合成效果')
    folder
      .add(this.uniforms.uBrightness, 'value')
      .name('亮度')
      .min(0)
      .max(1)
      .step(0.01)
    folder
      .add(this.uniforms.uContrast, 'value')
      .name('对比度')
      .min(0)
      .max(5)
      .step(0.01)
    folder
      .add(this.uniforms.uSaturation, 'value')
      .name('饱和度')
      .min(0)
      .max(5)
      .step(0.01)
  }

  override onResize(size: DomElementSize): void {
    const { width, height, ratio } = size
    // 更新效果合成器像素比、尺寸
    this.composer.setPixelRatio(ratio)
    this.composer.setSize(width, height)
    // 更新 SMAA 抗锯齿处理尺寸
    this.smaaPass.setSize(width, height)
  }

  override onUpdate(delta: number): void {
    // 更新效果合成器
    this.composer.render(delta)
  }

  override onDestory(): void {
    // 卸载效果合成器
    this.composer.dispose()
    this.composer.renderTarget1.dispose()
    this.composer.renderTarget2.dispose()
  }
}
