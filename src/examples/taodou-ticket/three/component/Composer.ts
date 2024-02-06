import {
  Color,
  Layers,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  Vector2
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
// import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader'
import { BaseComposer, DomElementSize } from '@/underline'
import Experience from '../Experience'

/** 合成器 */
export default class Composer extends BaseComposer<Experience> {
  /** 描边发光效果 */
  public outlinePass: OutlinePass = null
  /** 故障效果 */
  // public glitchPass: GlitchPass = null
  /** 伽马校正处理：对应 renderer.outputColorSpace，用于解决使用 EffectComposer 后颜色异常的 bug（例如变暗） */
  public shaderPass: ShaderPass = null
  /** SMAA 抗锯齿处理：效果优于 FXAA */
  public smaaPass: SMAAPass = null
  /** 辉光图层序号 */
  public bloomLayerIndex = 1
  /** 辉光图层 */
  public bloomLayers: Layers = null
  /** 辉光效果合成器 */
  public bloomComposer: EffectComposer = null
  /** 辉光效果 */
  public bloomPass: UnrealBloomPass = null
  /** 辉光材质映射 */
  public bloomMaterialMap = new Map<string, THREE.Material | THREE.Material[]>()

  constructor(world: Experience) {
    super(world)
  }

  override onConfig(): void {
    super.onConfig()

    // 1.描边发光效果
    this.outlinePass = new OutlinePass(
      new Vector2(),
      this.world.scene,
      this.world.camera.camera
    )
    this.outlinePass.visibleEdgeColor.set(new Color(0x00e1ff)) // 呼吸显示色
    this.outlinePass.hiddenEdgeColor.set(new Color(0x000000)) // 呼吸消失色
    this.outlinePass.usePatternTexture = false // 是否使用父级的材质
    this.outlinePass.pulsePeriod = 3 // 呼吸速度：0无～5最大
    this.outlinePass.downSampleRatio = 1 // 边框弯曲度
    this.outlinePass.edgeGlow = 1 // 边框辉光尺寸：0无～1最大
    this.outlinePass.edgeStrength = 10 // 边框亮度：0无～10最大
    this.outlinePass.edgeThickness = 10 // 边框宽度
    this.composer.addPass(this.outlinePass)

    // 2.故障效果
    // this.glitchPass = new GlitchPass()
    // this.composer.addPass(this.glitchPass)

    // 3.伽马校正处理：对应 renderer.outputColorSpace，用于解决使用 EffectComposer 后颜色异常的 bug（例如变暗）
    this.shaderPass = new ShaderPass(GammaCorrectionShader)
    this.composer.addPass(this.shaderPass)

    // 4.辉光效果
    // 辉光图层
    this.bloomLayers = new Layers()
    this.bloomLayers.set(this.bloomLayerIndex) // 定义辉光图层所属位置
    // 辉光效果合成器
    this.bloomComposer = new EffectComposer(this.world.render.renderer)
    this.bloomComposer.renderToScreen = false
    this.bloomComposer.addPass(this.renderPass) // 渲染过程需要最先被添加
    // 辉光效果
    this.bloomPass = new UnrealBloomPass(new Vector2(), 0.2, 0, 0.4)
    this.bloomComposer.addPass(this.bloomPass)
    // 混合效果
    const mixPass = new ShaderPass(
      new ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: {
            value: this.bloomComposer.renderTarget2.texture
          }
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            vUv = uv;
          }
        `,
        fragmentShader: `
          uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;
          varying vec2 vUv;

          void main(){
            vec4 texture1 = texture2D(baseTexture, vUv);
            vec4 texture2 = texture2D(bloomTexture, vUv);
            gl_FragColor = texture1 + texture2;
          }
        `
      }),
      'baseTexture' // 将 composer 当前渲染结果作为 baseTexture 变量传入
    )
    mixPass.needsSwap = true
    this.composer.addPass(mixPass)

    // 5.SMAA 抗锯齿处理：效果优于 FXAA
    this.smaaPass = new SMAAPass(100, 100)
    this.composer.addPass(this.smaaPass)
  }

  override onResize(size: DomElementSize): void {
    const { width, height, ratio } = size
    // 更新效果合成器像素比、尺寸
    super.onResize(size)
    // 更新辉光效果合成器像素比、尺寸
    this.bloomComposer.setPixelRatio(ratio)
    this.bloomComposer.setSize(width, height)
    // 更新描边发光效果尺寸
    this.outlinePass.resolution.set(width, height)
    // 更新辉光效果尺寸
    this.bloomPass.resolution.set(width, height)
    // 更新 SMAA 抗锯齿处理尺寸
    this.smaaPass.setSize(width, height)
  }

  override onDebug(): void {
    // 面板控制器
    const folder = this.world.gui.addFolder('合成器')
    folder
      .add(this.bloomPass, 'strength')
      .name('辉光 strength')
      .min(0)
      .max(2)
      .step(0.01)
    folder
      .add(this.bloomPass, 'radius')
      .name('辉光 radius')
      .min(0)
      .max(1)
      .step(0.01)
    folder
      .add(this.bloomPass, 'threshold')
      .name('辉光 threshold')
      .min(0)
      .max(1)
      .step(0.01)
  }

  override onUpdate(delta: number): void {
    // 处理非辉光图层 Mesh 材质
    this.world.scene.traverse(item => {
      if (!(item instanceof Mesh)) {
        return
      }
      if (this.bloomLayers.test(item.layers) === false) {
        this.bloomMaterialMap.set(item.uuid, item.material)
        item.material = new MeshBasicMaterial({ color: 0x000000 })
      }
    })
    // 更新辉光效果合成器
    this.bloomComposer.render(delta)
    // 还原所有 Mesh 材质
    this.world.scene.traverse(item => {
      if (!(item instanceof Mesh)) {
        return
      }
      if (this.bloomMaterialMap.has(item.uuid)) {
        item.material = this.bloomMaterialMap.get(item.uuid)
        this.bloomMaterialMap.delete(item.uuid)
      }
    })
    // 更新效果合成器
    super.onUpdate(delta)
  }

  override onDestory(): void {
    // 卸载效果合成器
    super.onDestory()
    // 卸载辉光效果合成器
    this.bloomComposer.dispose()
    this.bloomComposer.renderTarget1.dispose()
    this.bloomComposer.renderTarget2.dispose()
  }
}
