import {
  ACESFilmicToneMapping,
  Color,
  // PCFShadowMap,
  SRGBColorSpace,
  WebGLRenderer
} from 'three'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { Component, DomElementSize, World } from '../base'

/** 渲染器类 */
export class Render extends Component {
  /** webgl 主渲染器 */
  public renderer: WebGLRenderer = null
  /** css2d、css3d 辅渲染器 */
  public cssRenderer: CSS2DRenderer | CSS3DRenderer = null

  constructor(world: World) {
    super(world)
  }

  override onConfig(): void {
    // 一.webgl 主渲染器
    this.renderer = new WebGLRenderer({
      antialias: true, // 设置抗锯齿：一般通过硬件能力操作
      preserveDrawingBuffer: true, // 开启绘制缓冲区
      logarithmicDepthBuffer: false // 关闭对数深度检测缓冲区，解决 shader 渲染深度异常的 bug：https://blog.csdn.net/u010657801/article/details/129500470
    })
    this.renderer.setClearColor(new Color(0x000000)) // 设置 webgl 主渲染器背景色
    // this.renderer.physicallyCorrectLights = true // 设置使用物理光照模式
    this.renderer.outputColorSpace = SRGBColorSpace // 设置输出颜色空间，解决色彩异常的问题（使用 EffectComposer 后无效）
    this.renderer.toneMapping = ACESFilmicToneMapping // 设置色调映射模式
    this.renderer.toneMappingExposure = 1 // 设置曝光度
    // this.renderer.shadowMap.enabled = true // [阴影]设置渲染器开启阴影贴图
    // this.renderer.shadowMap.type = PCFShadowMap // [阴影]设置渲染器阴影贴图类型

    // 二.css2d、css3d 辅渲染器
    if (this.world.options.useCssRenderer === true) {
      // this.cssRenderer = new CSS2DRenderer()
      this.cssRenderer = new CSS3DRenderer()
      this.cssRenderer.domElement.style.position = 'absolute'
      this.cssRenderer.domElement.style.zIndex = '1'
      this.cssRenderer.domElement.style.top = '0px'
      this.cssRenderer.domElement.style.bottom = '0px'
      this.cssRenderer.domElement.style.left = '0px'
      this.cssRenderer.domElement.style.right = '0px'
      this.cssRenderer.domElement.style.touchAction = 'none'
      // this.cssRenderer.domElement.style.pointerEvents = 'none'
    }
  }

  override onResize(size: DomElementSize): void {
    const { width, height, ratio } = size
    // 更新 webgl 主渲染器像素比、尺寸
    this.renderer.setPixelRatio(ratio)
    this.renderer.setSize(width, height)
    // 更新 css2d、css3d 辅渲染器尺寸
    this.cssRenderer?.setSize(width, height)
  }

  override onUpdate(): void {
    // 更新 webgl 主渲染器（与效果合成器冲突）
    if (!this.world.composer) {
      this.renderer.render(this.world.scene, this.world.camera.camera)
    }
    // 更新 css2d、css3d 辅渲染器
    this.cssRenderer?.render(this.world.scene, this.world.camera.camera)
  }

  override onDestory(): void {
    // 卸载 webgl 主渲染器
    this.renderer.dispose()
  }
}
