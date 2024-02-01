/**
 * @description 场景世界
 */
import { Clock, Scene } from 'three'
import Stats from 'stats.js'
import GUI from 'lil-gui'
import { toolDebounce } from '../utils'
import { Component, DomElementSize, Emit, LifeCycle, SceneResource } from '.'
import { Camera, Composer, Environment, Light, Loader, Render } from '../config'

/** 世界类 */
export class World extends Emit implements LifeCycle {
  /** 渲染器挂载 dom 节点 */
  public domElement: HTMLElement = null
  /** 渲染器挂载 dom 节点尺寸 */
  public domElementSize: DomElementSize = null
  /** 绘制索引 */
  public index: number = null
  /** 时钟 */
  public clock: Clock = null
  /** 主场景 */
  public scene: Scene = null
  /** 资源加载器 */
  public loader: Loader = null
  /** 渲染器 */
  public render: Render = null
  /** 相机 */
  public camera: Camera = null
  /** 后期处理 */
  public composer: Composer = null
  /** 灯光 */
  public light: Light = null
  /** 环境类 */
  public environment: Environment = null
  /** 场景组件映射 */
  public readonly sceneMap: Map<string, Component> = new Map()
  /** [debug]帧率监控器 */
  public stats: Stats = null
  /** [debug]面板控制器 */
  public debug: GUI = null

  constructor(domElement?: HTMLElement, resource?: Map<string, string>) {
    super()
    this.domElement = domElement
    this.clock = new Clock()
    this.scene = new Scene()
    this.loader = new Loader(this, resource)
    this.render = new Render(this)
    this.camera = new Camera(this)
    this.composer = new Composer(this)
    this.light = new Light(this)
    this.environment = new Environment(this)
  }

  public onConfig(): void {
    // [生命周期]初始化
    this.loader.onConfig()
    this.render.onConfig()
    this.camera.onConfig()
    this.composer?.onConfig()
    this.light.onConfig()
    this.environment.onConfig()
    this.sceneMap.forEach(item => item.onConfig())

    // [通信]订阅资源加载完毕
    this.on<SceneResource>('ready', message => {
      this.onReady(message)
      if (window.location.search.indexOf('debug=true') !== -1) {
        this.onDebug()
      }
      this.onUpdate()
    })

    // [事件]绑定更新屏幕尺寸
    window.addEventListener('resize', this.onResize, false)

    // [生命周期]执行一次更新屏幕尺寸
    this.onResize()
  }

  public onReady(resource?: SceneResource): void {
    // [生命周期]资源加载完毕
    this.sceneMap.forEach(item => item.onReady(resource))

    // 挂载 webgl主渲染器 + css2d、css3d 辅渲染器
    this.domElement?.appendChild(this.render.renderer.domElement)
    this.domElement?.appendChild(this.render.cssRenderer.domElement)
  }

  public onDebug(): void {
    // 帧率监控器
    this.stats = new Stats()
    this.stats.showPanel(0)
    this.stats.dom.style.position = 'absolute'
    this.stats.dom.style.zIndex = '2'
    this.stats.dom.style.top = '10px'
    this.stats.dom.style.left = '10px'
    this.domElement?.appendChild(this.stats.dom)

    // 面板控制器
    this.debug = new GUI()

    // [生命周期]开启 debug
    this.camera.onDebug()
    this.composer?.onDebug()
    this.light.onDebug()
    this.sceneMap.forEach(item => item.onDebug())
  }

  public onResize = toolDebounce((): void => {
    // 获取当前屏幕尺寸
    const { width = 0, height = 0 } =
      this.domElement?.getBoundingClientRect() || {}
    const ascept = width / height // 窗口宽高比
    const ratio = Math.min(window.devicePixelRatio, 3) // 设备像素比
    const s = 500 // 窗口垂直显示系数
    const left = -s * ascept // 左显示范围
    const right = s * ascept // 右显示范围
    const top = s // 顶部显示范围
    const bottom = -s // 底部显示范围
    this.domElementSize = {
      width,
      height,
      ascept,
      ratio,
      left,
      right,
      top,
      bottom
    }

    // [生命周期]更新屏幕尺寸
    this.render.onResize(this.domElementSize)
    this.camera.onResize(this.domElementSize)
    this.composer?.onResize(this.domElementSize)
  })

  public onUpdate = (): void => {
    // 帧率监控器开始记录
    this.stats?.begin()

    // 通过时钟获取每帧渲染延迟
    const delta = this.clock.getDelta()

    // [生命周期]更新 requestAnimationFrame
    this.sceneMap.forEach(item => item.onUpdate(delta))
    this.light.onUpdate()
    this.camera.onUpdate()
    this.render.onUpdate()
    this.composer?.onUpdate(delta)

    // 帧率监控器结束记录
    this.stats?.end()

    // 执行下一轮绘制
    this.index = requestAnimationFrame(this.onUpdate)
  }

  public onDestory(): void {
    // [通信]取消所有订阅
    this.clear()

    // [事件]解绑更新屏幕尺寸
    window.removeEventListener('resize', this.onResize, false)

    // 取消下一轮绘制
    cancelAnimationFrame(this.index)

    // [生命周期]卸载调用
    this.sceneMap.forEach(item => item.onDestory())
    this.sceneMap.clear()
    this.light.onDestory()
    this.camera.onDestory()
    this.render.onDestory()
    this.composer?.onDestory()

    // 卸载 webgl 主渲染器 + css2d、css3d 辅渲染器
    this.domElement?.removeChild(this.render.renderer.domElement)
    this.domElement?.removeChild(this.render.cssRenderer.domElement)

    // 卸载帧率监控器
    this.stats && this.domElement?.removeChild(this.stats.dom)

    // 卸载面板控制器
    this.debug?.destroy()
  }

  /**
   * 添加场景组件
   * @param component 组件
   * @returns 无
   */
  protected addComponent(component: Component): void {
    this.sceneMap.set(component.constructor.name, component)
  }
}
