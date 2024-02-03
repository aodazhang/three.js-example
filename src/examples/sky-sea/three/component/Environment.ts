import {
  Color,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  Vector3,
  WebGLRenderTarget
} from 'three'
import { Water } from 'three/examples/jsm/objects/Water'
import { Sky } from 'three/examples/jsm/objects/Sky'
import gsap from 'gsap'
import { Component, SceneResource } from '@/underline'
import Experience from '../Experience'

/** 环境类 */
export default class Environment extends Component<Experience> {
  /** 太阳初始坐标 */
  private sunPosition: Vector3 = new Vector3(-80, 5, -100)
  /** 光照环境 */
  private sceneEnv: Scene = new Scene()
  /** 海洋 */
  private water: Water = null
  /** 天空 */
  private sky: Sky = null
  /** 测试多面体 */
  private cube: Mesh = null
  /** 预计算辐射度环境贴图生成器 */
  private pmremGenerator: PMREMGenerator = null
  /** 辐射度环境贴图 */
  private renderTarget: WebGLRenderTarget = null
  /** 测试参数 */
  private readonly params = {
    /** 太阳仰角 */
    elevation: 6,
    /** 太阳方位角 */
    azimuth: -90,
    /** 水流尺寸 */
    size: 1.0,
    /** 水流速度 */
    speed: 1.0,
    /** 海水颜色 */
    waterColor: 0x001e0f,
    /** 海水透明度 */
    alpha: 1.0,
    /** 波浪扭曲幅度 */
    distortionScale: 20,
    /** 太阳浑浊度 */
    turbidity: 10,
    /** 太阳锐度 */
    rayleigh: 2
  }

  constructor(world: Experience) {
    super(world)
  }

  override onConfig(): void {
    // 设置场景背景色
    this.world.scene.background = new Color(0x111111)
  }

  override onReady(resource?: SceneResource): void {
    // 一.处理法线贴图材质：水平垂直方向重复贴图
    const waternormals = resource.texture.get('waternormals')
    /**
     * 包裹模式
     * - ClampToEdgeWrapping：纹理边缘推至外部边缘（默认）
     * - RepeatWrapping：简单无穷重复
     * - MirroredRepeatWrapping：简单无穷镜像重复
     */
    waternormals.wrapS = RepeatWrapping // 纹理水平方向包裹：在 uv 映射中对应 u
    waternormals.wrapT = RepeatWrapping // 纹理垂直方向包裹：在 uv 映射中对应 v

    // 二.海洋
    this.water = new Water(
      // 几何体配置：使用较大 PlaneGeometry 作为海平面
      new PlaneGeometry(10000, 10000),
      // 材质配置 WaterOptions
      {
        textureWidth: 512, // 纹理宽度
        textureHeight: 512, // 纹理宽度
        waterNormals: waternormals, // 海平面法线贴图
        waterColor: 0x001e0f, // 海平面基本颜色
        alpha: 1, // 海水透明度：越小越泛白
        distortionScale: 20, // 波浪扭曲幅度：越大越扭曲
        sunColor: 0xffffff // 太阳光色
      }
    )
    this.water.rotation.set(-Math.PI / 2, 0, 0)
    this.world.scene.add(this.water)

    console.log(this.water.material.uniforms)

    // 三.天空
    this.sky = new Sky()
    this.sky.scale.setScalar(10000) // 天空放大倍数与海平面保持一致
    this.sky.material.uniforms['turbidity'].value = 10 // 浑浊度：太阳光晕大小，数值越小太阳轮廓越清晰
    this.sky.material.uniforms['rayleigh'].value = 2 // 锐度：太阳光照程度，数值越大越类似夕阳
    this.sky.material.uniforms['mieCoefficient'].value = 0.005
    this.sky.material.uniforms['mieDirectionalG'].value = 0.8
    this.world.scene.add(this.sky)

    // 四.测试多面体
    this.cube = new Mesh(
      new IcosahedronGeometry(20, 0),
      new MeshStandardMaterial({ color: new Color(0xffffff), roughness: 0 })
    )
    this.cube.position.set(0, 10, 0)
    this.world.scene.add(this.cube)
    // 测试动画效果
    gsap.to(this.cube.position, {
      duration: 3,
      ease: 'power2.in',
      repeat: -1,
      yoyo: true,
      y: 30
    })
    gsap.to(this.cube.rotation, {
      duration: 3,
      ease: 'power2.in',
      repeat: -1,
      yoyo: true,
      y: 3
    })

    /**
     * 五.预计算辐射度环境贴图（pre-computed radiance environment map，PMREM）
     * 概念：根据当前场景和光照计算出辐射度环境贴图并缓存。
     */
    this.pmremGenerator = new PMREMGenerator(this.world.render.renderer)
    this.updateSunPosition()
  }

  override onDebug(): void {
    // 面板控制器
    const folder = this.world.gui.addFolder('Environment')
    // folder
    //   .add(this.sunPosition, 'x')
    //   .name('太阳位置 x')
    //   .min(-100)
    //   .max(100)
    //   .step(1)
    //   .onChange(this.updateSunPosition)
    // folder
    //   .add(this.sunPosition, 'y')
    //   .name('太阳位置 y')
    //   .min(-100)
    //   .max(100)
    //   .step(1)
    //   .onChange(this.updateSunPosition)
    // folder
    //   .add(this.sunPosition, 'z')
    //   .name('太阳位置 z')
    //   .min(-100)
    //   .max(100)
    //   .step(1)
    //   .onChange(this.updateSunPosition)
    folder
      .add(this.params, 'elevation')
      .name('太阳仰角')
      .min(0)
      .max(90)
      .step(0.1)
      .onChange(this.updateSunPosition)
    folder
      .add(this.params, 'azimuth')
      .name('太阳方位角')
      .min(-180)
      .max(180)
      .step(0.1)
      .onChange(this.updateSunPosition)
    folder
      .add(this.params, 'size')
      .name('水流尺寸')
      .min(0)
      .max(10)
      .step(0.1)
      .onChange((value: number) => {
        this.water.material.uniforms.size.value = value
      })
    folder
      .add(this.params, 'speed')
      .name('水流速度')
      .min(0)
      .max(10)
      .step(0.1)
      .onChange(() => {})
    folder
      .addColor(this.params, 'waterColor')
      .name('海水颜色')
      .onChange((value: number) => {
        this.water.material.uniforms['waterColor'].value = new Color(value)
      })
    folder
      .add(this.params, 'alpha')
      .name('海水透明度')
      .min(0)
      .max(1)
      .step(0.1)
      .onChange((value: number) => {
        this.water.material.uniforms['alpha'].value = value
      })
    folder
      .add(this.params, 'distortionScale')
      .name('波浪扭曲幅度')
      .min(0)
      .max(200)
      .step(1)
      .onChange((value: number) => {
        this.water.material.uniforms['distortionScale'].value = value
      })
    folder
      .add(this.params, 'turbidity')
      .name('太阳浑浊度')
      .min(0)
      .max(20)
      .step(0.1)
      .onChange((value: number) => {
        this.sky.material.uniforms['turbidity'].value = value
      })
    folder
      .add(this.params, 'rayleigh')
      .name('太阳锐度')
      .min(0)
      .max(10)
      .step(0.1)
      .onChange((value: number) => {
        this.sky.material.uniforms['rayleigh'].value = value
      })
  }

  override onUpdate(_delta?: number): void {
    // 更新水面波纹偏移
    // this.water.material.uniforms.time.value = this.world.clock.getElapsedTime()
    this.water.material.uniforms.time.value += this.params.speed / 60
  }

  override onDestory(): void {
    this.renderTarget?.dispose()
  }

  /**
   * 更新太阳坐标
   */
  private updateSunPosition = () => {
    // 计算极角
    const phi = MathUtils.degToRad(90 - this.params.elevation)
    // 计算方位角
    const theta = MathUtils.degToRad(this.params.azimuth)
    // 根据极角和方位角设置太阳位置为极坐标系中的值
    this.sunPosition.setFromSphericalCoords(1, phi, theta)

    /**
     * 每次太阳坐标更新后
     * - 更新海洋：太阳单位向量
     * - 更新天空：太阳坐标
     * - 更新环境贴图：新的辐射度环境贴图
     */

    /**
     * 海平面配置太阳向量模拟光照反射效果
     * 说明：太阳的坐标不代表太阳的真实位置，因为向量是有长度的，越长光照强度就越大，海平面越泛白，因此需要将太阳坐标归一化得到单位向量。
     */
    this.water.material.uniforms['sunDirection'].value
      .copy(this.sunPosition)
      .normalize()

    /**
     * 天空配置太阳坐标
     */
    this.sky.material.uniforms['sunPosition'].value.copy(this.sunPosition)

    this.sceneEnv.add(this.sky) // 采用独立的场景渲染 sky 环境贴图
    this.renderTarget?.dispose()
    this.renderTarget = this.pmremGenerator.fromScene(this.sceneEnv) // 根据独立场景生成辐射度环境贴图
    this.world.scene.add(this.sky)
    this.world.scene.environment = this.renderTarget.texture // 设置场景环境贴图：辐射度环境贴图
  }
}
