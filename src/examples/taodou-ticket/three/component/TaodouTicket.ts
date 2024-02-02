import {
  Color,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  VideoTexture
} from 'three'
import { Component, SceneResource } from '@/underline'
import Experience from '../Experience'

/** 选座购票 */
export default class TaodouTicket extends Component<Experience> {
  /** 相机聚焦坐标 */
  private readonly focusPosition: Vector3 = new Vector3(-15, 3, 0)
  /** 座位普通颜色 */
  private readonly placeNormalColor = new Color(0xa9a9a9)
  /** 座位选择颜色 */
  private readonly placeSelectColor = new Color(0x47eaff)
  /** 座位 */
  private readonly places: Mesh[] = []
  /** 影片 dom 节点 */
  private video: HTMLVideoElement = null

  constructor(world: Experience) {
    super(world)
  }

  override onConfig(): void {
    // [通信]订阅相机复位
    this.world.on('reset', this.onClickReset)
    // [通信]订阅选座
    this.world.on('place', this.onClickPlace)
  }

  override onReady(resource?: SceneResource): void {
    // 一.选座购票
    const taodou = resource.gltf.get('taodouTicket')
    taodou.scene.traverse(item => {
      if (!(item instanceof Mesh)) {
        return
      }
      const material = new MeshStandardMaterial({
        side: DoubleSide
      })
      item.material = material
      if (item.name.indexOf('地板') > -1 || item.name.indexOf('墙壁') > -1) {
        material.color = new Color(0x000000)
        material.metalness = 1
        material.roughness = 0
        material.envMapIntensity = 2
        // item.receiveShadow = true // [阴影]网格阴影参数：接收阴影
      } else if (item.name.indexOf('座位') > -1) {
        material.color = this.placeNormalColor
        this.places.push(item)
      } else if (item.name.indexOf('支架') > -1) {
        material.color = new Color(0x999999)
        material.metalness = 0.9
        material.roughness = 0.8
        material.envMapIntensity = 2
        // material.shadowSide = BackSide
        // item.castShadow = true // [阴影]网格阴影参数：投射阴影
      } else if (item.name.indexOf('屏幕') > -1) {
        material.color = new Color(0x666666)
        // 使用视频材质
        this.video = document.createElement('video')
        this.video.crossOrigin = 'anonymous'
        this.video.src = './video/sintel.mp4'
        this.video.autoplay = true
        this.video.muted = false
        this.video.playsInline = true
        this.video.loop = true
        this.video.controls = false
        this.video.volume = 0.5
        item.material = new MeshStandardMaterial({
          map: new VideoTexture(this.video)
        })
      } else if (item.name.indexOf('光线') > -1) {
        material.color = new Color(0xffffff)
        // 处理光线辉光效果
        item.layers.toggle(this.world.composer.bloomLayerIndex)
      }
    })
    this.world.scene.add(taodou.scene)
  }

  override onDestory(): void {
    // [通信]取消订阅相机复位
    this.world.off('reset', this.onClickReset)
    // [通信]取消订阅选座
    this.world.off('place', this.onClickPlace)
    // 停止上一次播放的视频
    this.video?.pause()
  }

  /**
   * 相机复位
   * @returns 无
   */
  private onClickReset = (): void => {
    // 启动相机姿态动画
    this.world.camera.animationCamera(
      new Vector3(25, 10, 5),
      this.focusPosition
    )
  }

  /**
   * 选座
   * @param e 鼠标触控事件
   * @returns 无
   */
  private onClickPlace = (e: MouseEvent): void => {
    /**
     * raycaster检测流程：
     * 1.归一化设备坐标，注意这里获取的是相对渲染 dom 节点的宽高和点击坐标来进行换算，并非相对浏览器窗口
     * 2.射线和设备坐标聚焦的物体
     */
    const coord = this.normalization(e)
    const intersect = this.raycasterIntersection(coord, this.places)
    if (!(intersect?.object instanceof Mesh)) {
      return
    }
    // 选择座位序号
    let select: number = null
    // 处理座位材质
    this.places.forEach((item, index) => {
      if (item === intersect.object) {
        select = index
        ;(item.material as MeshStandardMaterial).color = this.placeSelectColor
      } else {
        ;(item.material as MeshStandardMaterial).color = this.placeNormalColor
      }
    })
    // 处理座位描边发光效果
    this.world.composer.outlinePass.selectedObjects = [intersect.object]
    // 启动相机姿态动画
    this.world.camera.animationCamera(
      intersect.object.position.clone().add(new Vector3(10, 5, 0)),
      this.focusPosition
    )
    // [通信]发布选择座位序号
    this.world.notify('select', select)
  }
}
