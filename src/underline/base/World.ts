/**
 * @description 世界
 */
import { Clock, Scene } from 'three'
import Stats from 'stats.js'
import GUI from 'lil-gui'
import { toolDebounce } from '../utils'
import { ComponentType, DomElementSize, SceneResource } from '../type'
import {
  DefaultCamera,
  DefaultLight,
  DefaultLoader,
  DefaultRender
} from '../default'
import { Component } from './Component'
import { Emit } from './Emit'
import { LifeCycle } from './LifeCycle'

/** 世界配置 */
export interface WorldOptions {
  /** 渲染器挂载 dom 节点 */
  domElement: HTMLElement
  /** 原始资源 */
  resource?: Map<string, string>
  /** 是否开启 debug 面板 */
  useDebug?: boolean
  /** 是否开启 css2d、css3d 辅渲染器 */
  useCssRenderer?: boolean
  /** 是否开启阴影贴图 */
  useShadowMap?: boolean
}

/** 世界类 */
export class World extends Emit implements LifeCycle {
  /** 配置 */
  public options: WorldOptions = {
    domElement: null,
    resource: new Map(),
    useDebug: false,
    useCssRenderer: false,
    useShadowMap: false
  }
  /** 渲染器挂载 dom 节点尺寸 */
  public domElementSize: DomElementSize = null
  /** 绘制索引 */
  public index: number = null
  /** 时钟 */
  public clock: Clock = new Clock()
  /** 主场景 */
  public scene: Scene = new Scene()
  /** 资源加载器 */
  public loader: DefaultLoader = null
  /** 渲染器 */
  public render: DefaultRender = null
  /** 特殊组件映射 */
  private readonly componentMap: Map<ComponentType, Component> = new Map()
  /** 普通组件列表 */
  private readonly componentList: Component[] = []
  /** [debug]帧率监控器 */
  public stats: Stats = null
  /** [debug]面板控制器 */
  public gui: GUI = null

  /**
   * 构造函数
   * @param options 配置项
   * @returns this
   */
  constructor(options: WorldOptions) {
    super()
    this.options = { ...this.options, ...options }

    if (!(this.options.domElement instanceof HTMLElement)) {
      throw new Error('World domElement is not HTMLElement')
    }

    this.addComponent(new DefaultLoader(this))
    this.addComponent(new DefaultLight(this))
    this.addComponent(new DefaultCamera(this))
    this.addComponent(new DefaultRender(this))

    this.loader = this.getComponent(ComponentType.LOADER)
    this.render = this.getComponent(ComponentType.RENDER)
  }

  public onConfig(): void {
    /**
     * [生命周期]初始化
     * - loader 资源初始化
     * - component 场景初始化
     * - light 灯光初始化
     * - render 渲染器初始化
     * - camera 相机初始化（控制器需要渲染器的 dom，因此在 render 之后）
     * - composer 合成器初始化
     */
    this.getComponent(ComponentType.LOADER)?.onConfig()
    this.componentList.forEach(item => item.onConfig())
    this.getComponent(ComponentType.LIGHT)?.onConfig()
    this.getComponent(ComponentType.RENDER)?.onConfig()
    this.getComponent(ComponentType.CAMERA)?.onConfig()
    this.getComponent(ComponentType.COMPOSER)?.onConfig()

    this.on<SceneResource>('ready', message => {
      // [通信]订阅资源加载完毕
      this.onReady(message)
      this.options.useDebug === true && this.onDebug()
      this.onUpdate()
    })

    // [事件]绑定更新屏幕尺寸
    window.addEventListener('resize', this.onResize, false)
    // 初始化执行一次更新屏幕尺寸
    this.onResize()
  }

  public onReady(resource?: SceneResource): void {
    /**
     * [生命周期]资源加载完毕
     * - component 组件根据资源配置
     * - light 灯光根据资源配置
     * - camera 相机根据资源配置
     * - composer 合成器根据资源配置
     */
    this.componentList.forEach(item => item.onReady(resource))
    this.getComponent(ComponentType.LIGHT)?.onReady(resource)
    this.getComponent(ComponentType.CAMERA)?.onReady(resource)
    this.getComponent(ComponentType.COMPOSER)?.onReady(resource)

    // 挂载 webgl主渲染器 + css2d、css3d 辅渲染器
    this.options.domElement.appendChild(this.render.renderer.domElement)
    this.render.cssRenderer &&
      this.options.domElement.appendChild(this.render.cssRenderer.domElement)
  }

  public onDebug(): void {
    // 帧率监控器
    this.stats = new Stats()
    this.stats.showPanel(0)
    this.stats.dom.style.position = 'absolute'
    this.stats.dom.style.zIndex = '2'
    this.stats.dom.style.top = '10px'
    this.stats.dom.style.left = '10px'
    this.options.domElement.appendChild(this.stats.dom)

    // 面板控制器
    this.gui = new GUI()

    /**
     * [生命周期]开启 debug
     * - component 组件开启面板控制器、初始化 helper
     * - light 灯光开启面板控制器、初始化 helper
     * - camera 相机开启面板控制器、初始化 helper
     * - composer 合成器开启面板控制器、初始化 helper
     */
    this.componentList.forEach(item => item.onDebug())
    this.getComponent(ComponentType.LIGHT)?.onDebug()
    this.getComponent(ComponentType.CAMERA)?.onDebug()
    this.getComponent(ComponentType.COMPOSER)?.onDebug()
  }

  public onResize = toolDebounce((): void => {
    // 获取当前屏幕尺寸
    const { width = 0, height = 0 } =
      this.options.domElement.getBoundingClientRect()
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

    /**
     * [生命周期]更新屏幕尺寸
     * - component 组件根据屏幕尺寸调整
     * - light 组件根据屏幕尺寸调整
     * - camera 相机根据屏幕尺寸调整宽高比、边界、投影矩阵
     * - render 渲染器根据屏幕尺寸调整像素比、尺寸
     * - composer 合成器根据屏幕尺寸调整像素比、尺寸
     */
    this.componentList.forEach(item => item.onResize(this.domElementSize))
    this.getComponent(ComponentType.LIGHT)?.onResize(this.domElementSize)
    this.getComponent(ComponentType.CAMERA)?.onResize(this.domElementSize)
    this.getComponent(ComponentType.RENDER)?.onResize(this.domElementSize)
    this.getComponent(ComponentType.COMPOSER)?.onResize(this.domElementSize)
  })

  public onUpdate = (): void => {
    // 帧率监控器开始记录
    // this.stats?.begin()

    // 通过时钟获取每帧渲染延迟
    const delta = this.clock.getDelta()

    /**
     * [生命周期]更新 requestAnimationFrame
     * - component 组件更新状态
     * - light 组件更新 helper
     * - camera 相机更新控制器、helper
     * - render 渲染器更新渲染（存在合成器则主渲染器不渲染）
     * - composer 合成器更新渲染（可替代 render 主渲染器）
     */
    this.componentList.forEach(item => item.onUpdate(delta))
    this.getComponent(ComponentType.LIGHT)?.onUpdate(delta)
    this.getComponent(ComponentType.CAMERA)?.onUpdate(delta)
    this.getComponent(ComponentType.RENDER)?.onUpdate(delta)
    this.getComponent(ComponentType.COMPOSER)?.onUpdate(delta)

    // 帧率监控器结束记录
    // this.stats?.end()

    // 帧率监控器更新记录
    this.stats?.update()

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

    /**
     * [生命周期]卸载
     * - component 组件卸载
     * - light 灯光卸载
     * - camera 相机卸载
     * - render 渲染器卸载
     * - composer 合成器卸载
     * - 清空普通组件列表
     * - 清空特殊组件映射
     */
    this.componentList.forEach(item => item.onDestory())
    this.getComponent(ComponentType.LIGHT)?.onDestory()
    this.getComponent(ComponentType.CAMERA)?.onDestory()
    this.getComponent(ComponentType.RENDER)?.onDestory()
    this.getComponent(ComponentType.COMPOSER)?.onDestory()
    this.componentList.length = 0
    this.componentMap.clear()

    // 卸载 webgl 主渲染器 + css2d、css3d 辅渲染器
    this.options.domElement.removeChild(this.render.renderer.domElement)
    this.render.cssRenderer &&
      this.options.domElement.removeChild(this.render.cssRenderer.domElement)

    // 卸载帧率监控器
    this.stats && this.options.domElement.removeChild(this.stats.dom)

    // 卸载面板控制器
    this.gui?.destroy()
  }

  /**
   * 添加组件
   * @param component 组件
   * @returns 无
   */
  protected addComponent(component: Component): void {
    component.type === ComponentType.NORMAL
      ? this.componentList.push(component)
      : this.componentMap.set(component.type, component)
  }

  /**
   * 删除组件
   * @param component 组件
   * @returns 无
   */
  public removeComponent(component: Component): void {
    if (component.type === ComponentType.NORMAL) {
      const findIndex = this.componentList.findIndex(item => item === component)
      this.componentList.splice(findIndex, 1)
    } else {
      this.componentMap.delete(component.type)
    }
  }

  /**
   * 获取特殊组件（非普通组件）
   * @param type 组件类型
   * @returns 组件实例
   */
  public getComponent<T extends Component>(type: ComponentType): T {
    return (this.componentMap.get(type) as T) || null
  }
}
