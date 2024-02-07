import {
  BufferAttribute,
  BufferGeometry,
  ExtrudeGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  Shape
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
          const vertices: number[] = []
          coords.forEach((longlat, index) => {
            const [x, y] = projection(longlat as [number, number])
            index ? shape.lineTo(x, y) : shape.moveTo(x, y)
            vertices.push(x, y, -4.01)
          })
          const mesh = new Mesh(
            new ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false }),
            new MeshStandardMaterial({ color: randomRgb() })
          )
          mesh.position.y = 1
          mesh.rotation.x = Math.PI / 2
          this.world.scene.add(mesh)
          const geometry = new BufferGeometry()
          geometry.setAttribute(
            'position',
            new BufferAttribute(new Float32Array(vertices), 3)
          )
          const line = new Line(
            geometry,
            new LineBasicMaterial({ color: 0xff0000 })
          )
          line.rotation.x = Math.PI / 2
          this.world.scene.add(line)
        })
      }
    })
  }
}
