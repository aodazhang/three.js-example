import {
  BufferGeometry,
  ExtrudeGeometry,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Shape,
  Vector3
} from 'three'
import { geoMercator } from 'd3-geo'
import { Component, SceneResource, randomRgb } from '@/underline'
import Experience from '../Experience'
import china from '@/assets/json/china.json'

/**  地图 */
export default class Map extends Component<Experience> {
  constructor(world: Experience) {
    super(world)
  }

  override onReady(_resource?: SceneResource): void {
    // 1.经纬度 -> 墨卡托投影坐标
    const projection = geoMercator()
      .center(china.features[0].properties.center as [number, number]) // 设置投影中心经度（long）、纬度（lat）
      .scale(100) // 缩放坐标系
      .translate([0, 0]) // 移动投影中心到坐标系

    // 2.遍历省份构建模型
    china.features.forEach(feature => {
      // 获取某个省的坐标
      const { type, coordinates } = feature.geometry
      if (type === 'MultiPolygon') {
        // 多面
        coordinates.forEach(coords => {
          coords.forEach(coord => {
            const shape = new Shape()
            coord.forEach((longlat, index) => {
              const [x, y] = projection(longlat as [number, number])
              index ? shape.lineTo(x, y) : shape.moveTo(x, y)
            })
            const mesh = new Mesh(
              new ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false }),
              new MeshStandardMaterial({ color: randomRgb() })
            )
            mesh.position.y = 1
            mesh.rotation.x = Math.PI / 2
            this.world.scene.add(mesh)
          })
        })
      } else if (type === 'Polygon') {
        // 单面
        coordinates.forEach(coords => {
          const shape = new Shape()
          //  A.BufferGeometry 顶点数据
          const vertices1: number[] = [] // 数组方式
          const vertices2: Vector3[] = [] // Vector3 方式

          coords.forEach((longlat, index) => {
            const [x, y] = projection(longlat as [number, number])
            index ? shape.lineTo(x, y) : shape.moveTo(x, y)

            // B.BufferGeometry 添加顶点数据
            vertices1.push(x, y, -4.01)
            vertices2.push(new Vector3(x, y, -4.01))
          })
          const mesh = new Mesh(
            new ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false }),
            new MeshStandardMaterial({ color: randomRgb() })
          )
          mesh.position.y = 1
          mesh.rotation.x = Math.PI / 2
          this.world.scene.add(mesh)

          // C.BufferGeometry 设置顶点数据
          const geometry = new BufferGeometry()
          // geometry.setAttribute(
          //   'position',
          //   new BufferAttribute(new Float32Array(vertices1), 3)
          // ) // 数组方式添加
          geometry.setFromPoints(vertices2) // Vector3 方式添加

          /**
           * D.线、点
           * - Line：非闭合线
           * - LineLoop：闭合线
           * - LineSegments：类似 Line
           */
          // const line = new Line(
          //   geometry,
          //   new LineBasicMaterial({ color: 0xff0000 })
          // )
          const line = new LineLoop(
            geometry,
            new LineBasicMaterial({ color: 0xff0000 })
          )
          line.rotation.x = Math.PI / 2
          this.world.scene.add(line)
        })
      }
    })

    /**
     * 多类型绘制
     * - Points -> PointsMaterial
     * - Line、LineLoop、LineSegments（Line 和 LineSegments 类似） -> LineBasicMaterial
     * - Mesh -> MeshStandardMaterial
     */
    // 顶点数据
    const geometry = new PlaneGeometry(10, 10, 1, 1)

    // 点绘制
    // const obj = new Points(geometry, new PointsMaterial({ color: 0xff0000 }))

    // 线绘制
    // const obj = new LineLoop(
    // geometry,
    // new LineBasicMaterial({ color: 0xff0000 })
    // new LineDashedMaterial({
    //   color: 0xff0000,
    //   linewidth: 10,
    //   scale: 1,
    //   dashSize: 3,
    //   gapSize: 1
    // })
    // )

    // 面绘制
    const obj = new Mesh(
      geometry,
      new MeshStandardMaterial({ color: 0xff0000 })
    )

    obj.position.set(0, 20, 0)
    this.world.scene.add(obj)
  }
}
