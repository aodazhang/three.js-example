import {
  Box3,
  Box3Helper,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Raycaster,
  SphereGeometry,
  Vector3
} from 'three'
import { CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { Component, SceneResource } from '@/underline'
import Experience from '../Experience'
import data from '../data'

/** 熊猫地球 */
export default class Earth extends Component<Experience> {
  /** 地球 */
  private diqiu: Group = null
  /** 地球（检测对象） */
  private diqiuSphere: Mesh = null
  /** 地球（检测盒） */
  private box: Box3 = null
  /** 地球（检测盒辅助对象） */
  private boxHelper: Box3Helper = null
  /** 标记 */
  private mark: Group = new Group()

  constructor(world: Experience) {
    super(world)
  }

  override onReady(resource?: SceneResource): void {
    // 一.地球
    this.diqiu = resource.fbx.get('diqiu')
    ;((this.diqiu.children[0] as Mesh).material as MeshStandardMaterial).map =
      resource.texture.get('diqiut')
    this.world.scene.add(this.diqiu)

    // 二.地球（检测对象）
    // 1.创建一个包裹盒对象
    this.box = new Box3()
    // 2.根据指定对象设置包裹盒的大小
    this.box.setFromObject(this.diqiu)
    const size = new Vector3()
    // 3.通过包裹盒大小获取指定对象尺寸
    this.box.getSize(size)
    // 4.构建检测对象
    this.diqiuSphere = new Mesh(
      // 球体半径 = 检测盒宽度 / 2，这里可以通过调整球体半径控制检测范围
      new SphereGeometry(size.x / 2.1, 32, 32),
      new MeshBasicMaterial({ color: 0xff0000 })
    )
    // this.world.scene.add(this.diqiuSphere)

    // 三.标记
    data.forEach(item => {
      const img = document.createElement('img')
      img.className = item.country.includes('研究中心') ? 'mark mark-l' : 'mark'
      img.src = this.world.options.resource.get(item.mark)
      img.onclick = () => {
        window.open(item.link, '_blank')
      }
      /**
       * CSS3DObject：物体固定角度
       * CSS3DSprite：物体始终面朝相机
       */
      const cssObject = new CSS3DSprite(img)
      cssObject.position.copy(item.vector)
      cssObject.position.add(new Vector3(0.05, 0.3, 0))
      cssObject.scale.set(0.015, 0.015, 0.015)
      this.mark.add(cssObject)
    })
    this.world.scene.add(this.mark)
  }

  override onDebug(): void {
    // box3 helper
    this.boxHelper = new Box3Helper(this.box, 0xff0000)
    this.world.scene.add(this.boxHelper)
  }

  override onUpdate(): void {
    // 遍历标记检测是否被地球遮挡
    this.mark.traverse(item => {
      item.visible = !this.detectObjectObstructed(
        this.world.camera.camera.position,
        item.position,
        this.diqiuSphere
      )
    })
  }

  override onDestory(): void {
    // 卸载 box3 helper
    this.boxHelper?.dispose()
  }

  /**
   * 检查物体是否被遮挡
   * @param start 起点，一般是摄像机坐标
   * @param end 终点，一般是检测物体坐标
   * @param target 参考点对象，当终点距离 > 参考点距离时，一般认为被遮挡
   * @returns 检测结果
   */
  private detectObjectObstructed(
    start: Vector3,
    end: Vector3,
    target: Object3D
  ): boolean {
    // 1.起点坐标
    const origin = start.clone()
    // 2.起点到终点的基向量
    const direction = end.clone().sub(start).normalize()
    // 3.从起点开始创建一个指定向量的射线开始投射
    const raycaster = new Raycaster(origin, direction)
    // 4.检查参考点对象是否与射线相交
    const intersects = raycaster.intersectObjects([target], true)
    let d1 = 0 // 终点距离
    let d2 = 0 // 参考点距离
    // 5.如果相交则计算终点距离和参考点距离
    if (intersects.length) {
      d1 = start.distanceTo(end)
      d2 = start.distanceTo(intersects[0].point)
    }
    /**
     * 6.返回遮挡检测结果
     * - 若 参考点对象不相交 则 被遮挡
     * - 若 终点距离>参考点距离 则 被遮挡
     * - 若 终点距离<参考点距离 则 不遮挡
     */
    return d1 >= d2
  }
}
