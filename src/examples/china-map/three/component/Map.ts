import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  Line,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  Shape,
  Vector3
} from 'three'
import { GeoProjection, geoMercator } from 'd3-geo'
import {
  BaseCamera,
  Component,
  ComponentType,
  SceneResource,
  isString,
  randomRgb,
  toolThrottle
} from '@/underline'
import Experience from '../Experience'
import china from '@/assets/json/china.json'

/**  地图 */
export default class Map extends Component<Experience> {
  /** 光线投射对象 */
  private raycaster: Raycaster = new Raycaster()
  /** 墨卡托投影坐标转换函数 */
  private projection: GeoProjection = null
  /** [模型]地块 */
  private block: Group = new Group()
  /** [模型]边界线 */
  private boundary: Group = new Group()
  /** [模型]标记点圆心 */
  private mark: Group = new Group()
  /** [模型]标记点波纹 */
  private waveMark: Group = new Group()

  constructor(world: Experience) {
    super(world)
  }

  override onConfig(): void {
    window.addEventListener('mousemove', this.hoverBlock)
    window.addEventListener('click', this.clickBlock)
    this.world.on('boundary', this.createBoundary)
    this.world.on('mark', this.createMark)
  }

  override onReady(_resource?: SceneResource): void {
    /**
     * 地图模型实现步骤
     * 1.geojson 获取：https://datav.aliyun.com/portal/school/atlas/area_selector
     * 2.遍历 geojson 获取中心点坐标
     * 3.利用 d3-geo 构建 经纬度 -> 墨卡托投影坐标 转换函数
     * 4.遍历 geojson 构建模型
     */

    // 1.遍历 geojson 获取中心点坐标
    const edge = {
      longMin: Infinity,
      longMax: -Infinity,
      latMin: Infinity,
      latMax: -Infinity
    }
    const center: [number, number] = [0, 0]
    china.features.forEach(feature => {
      // 获取某个省的数据
      const { type, coordinates } = feature.geometry
      if (type === 'MultiPolygon') {
        /**
         * 多重多边形数据结构
         *
         * "coordinates": [
         *   [
         *     [ [x1, y1], [x2, y2] ... ]
         *   ],
         *   [
         *     [ [x1, y1], [x2, y2] ... ]
         *   ]
         * ]
         */
        coordinates.forEach(coords => {
          // 循环 n 次（n 个多边形）
          coords.forEach(coord => {
            // 循环 1 次
            coord.forEach((longlat, _index) => {
              // 循环 m 次（一个多边形有 m 个坐标）
              const [long, lat] = longlat as number[]
              // 计算经纬度极值
              long > edge.longMax && (edge.longMax = long)
              long < edge.longMin && (edge.longMin = long)
              lat > edge.latMax && (edge.latMax = lat)
              lat < edge.latMin && (edge.latMin = lat)
            })
          })
        })
      } else if (type === 'Polygon') {
        /**
         * 单个多边形数据结构：
         *
         * "coordinates": [
         *   [ [x1, y1], [x2, y2] ... ]
         * ]
         */
        coordinates.forEach(coord => {
          // 循环 1 次
          coord.forEach((longlat, _index) => {
            // 循环 m 次（一个多边形有 m 个坐标）
            const [long, lat] = longlat as number[]
            // 计算经纬度极值
            long > edge.longMax && (edge.longMax = long)
            long < edge.longMin && (edge.longMin = long)
            lat > edge.latMax && (edge.latMax = lat)
            lat < edge.latMin && (edge.latMin = lat)
          })
        })
      }
    })
    center[0] = (edge.longMax + edge.longMin) / 2
    center[1] = (edge.latMax + edge.latMin) / 2

    // 2.利用 d3-geo 构建 经纬度 -> 墨卡托投影坐标 转换函数
    this.projection = geoMercator()
      .center(center) // 设置投影中心 经度（long）、纬度（lat）
      .scale(100) // 缩放坐标系
      .translate([0, 0]) // 移动投影中心到坐标系

    // 3.遍历 geojson 构建模型
    china.features.forEach(feature => {
      // 获取某个省的数据
      const { name } = feature.properties
      const { type, coordinates } = feature.geometry
      if (!isString(name)) {
        return
      }
      if (type === 'MultiPolygon') {
        /**
         * 多重多边形数据结构
         *
         * "coordinates": [
         *   [
         *     [ [x1, y1], [x2, y2] ... ]
         *   ],
         *   [
         *     [ [x1, y1], [x2, y2] ... ]
         *   ]
         * ]
         */
        coordinates.forEach(coords => {
          // 循环 n 次（n 个多边形）
          coords.forEach(coord => {
            // 循环 1 次
            // a.[线段]形状绘制
            const shape = new Shape()
            coord.forEach((longlat, index) => {
              // 循环 m 次（一个多边形有 m 个坐标）
              const [x, y] = this.projection(longlat as [number, number])
              // [线段]lineTo 绘制第一个点、moveTo 绘制后续点
              index ? shape.lineTo(x, y) : shape.moveTo(x, y)
            })
            // b.初始化地块材质及模型
            const material = new MeshStandardMaterial({ color: randomRgb() })
            ;(material as any).backup = material.color.getHex() // 缓存地块颜色
            const mesh = new Mesh(
              // [线段]根据闭合形状挤出生成几何体
              new ExtrudeGeometry(shape, { depth: 4, bevelEnabled: false }),
              material
            )
            mesh.name = name
            this.block.add(mesh)
          })
        })
      } else if (type === 'Polygon') {
        /**
         * 单个多边形数据结构：
         *
         * "coordinates": [
         *   [ [x1, y1], [x2, y2] ... ]
         * ]
         */
        coordinates.forEach(coord => {
          // 循环 1 次
          // a.[线段]形状绘制
          const shape = new Shape()
          coord.forEach((longlat, index) => {
            // 循环 m 次（一个多边形有 m 个坐标）
            const [x, y] = this.projection(longlat as [number, number])
            // [线段]lineTo 绘制第一个点、moveTo 绘制后续点
            index ? shape.lineTo(x, y) : shape.moveTo(x, y)
          })
          // b.初始化地块材质及模型
          const material = new MeshStandardMaterial({ color: randomRgb() })
          ;(material as any).backup = material.color.getHex() // 缓存地块颜色
          material.onBeforeCompile = shader => {
            /**
             * [自定义材质着色器]渐变色调整
             * - 二次着色的情况通常在原本的材质上进行
             * - 这里的模型挤出高度为 4，且旋转了  Math.PI / 2，因此底在上（vPosition.z 0.0）、顶在下（vPosition.z 4.0）
             * - 顶点着色器传递坐标 position
             * - 片元着色器根据 position 处理颜色
             */
            shader.vertexShader = shader.vertexShader.replace(
              'void main() {',
              /* glsl */ `
                varying vec3 vPosition;
                void main() {
                  vPosition = position;
              `
            )
            shader.fragmentShader = shader.fragmentShader
              .replace(
                'void main() {',
                /* glsl */ `
                varying vec3 vPosition;
                void main() {
              `
              )
              .replace(
                /**
                 * three.js 的 gl_FragColor 都是在 output_fragment 中处理的（新版在 opaque_fragment）
                 * github：https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/opaque_fragment.glsl.js
                 */
                '#include <opaque_fragment>',
                /* glsl */ `
                /**
                 * opaque_fragment 原始代码
                 */
                #ifdef OPAQUE
                  diffuseColor.a = 1.0;
                #endif

                #ifdef USE_TRANSMISSION
                  diffuseColor.a *= material.transmissionAlpha;
                #endif

                // gl_FragColor = vec4(outgoingLight, diffuseColor.a);

                /**
                 *  opaque_fragment 新增代码
                 */
                // 1.设置渐变色, 4 为地块高度、我们以此为参考基准来设置比例值
                vec3 gradient = mix(vec3(0.0), vec3(1.0), vPosition.z/4.0);
                // 2.在原本的光照颜色基础上叠加渐变色
                outgoingLight = outgoingLight * gradient;
                gl_FragColor = vec4(outgoingLight, diffuseColor.a);
              `
              )
          }
          const mesh = new Mesh(
            // [线段]根据闭合形状挤出生成几何体
            new ExtrudeGeometry(shape, { depth: 4, bevelEnabled: false }),
            material
          )
          mesh.name = name
          this.block.add(mesh)
        })
      }
    })

    // 4.添加模型
    this.block.position.y = 4
    this.block.rotation.x = Math.PI / 2
    this.world.scene.add(this.block)

    this.createTest()
  }

  override onUpdate(_delta?: number): void {
    // 不断更新标记点波纹的 canvas 材质大小，营造雷达波效果
    this.waveMark.children.forEach(item => {
      if (item instanceof Mesh) {
        if (item.material.opacity > 0) {
          item.material.opacity -= 0.01
          item.scale.x += 0.01
          item.scale.y += 0.01
        } else {
          item.material.opacity = 1
          item.scale.set(1, 1, 1)
        }
      }
    })
  }

  override onDestory(): void {
    window.removeEventListener('mousemove', this.hoverBlock)
    window.removeEventListener('click', this.clickBlock)
    this.world.off('boundary', this.createBoundary)
    this.world.off('mark', this.createMark)
  }

  /**
   * 创建边界线
   * @returns 无
   */
  private createBoundary = (): void => {
    this.boundary.clear()

    // 1.遍历 geojson 构建模型
    china.features.forEach(feature => {
      // 获取某个省的数据
      const { name } = feature.properties
      const { type, coordinates } = feature.geometry
      if (!isString(name)) {
        return
      }
      if (type === 'MultiPolygon') {
        /**
         * 多重多边形数据结构
         *
         * "coordinates": [
         *   [
         *     [ [x1, y1], [x2, y2] ... ]
         *   ],
         *   [
         *     [ [x1, y1], [x2, y2] ... ]
         *   ]
         * ]
         */
        coordinates.forEach(coords => {
          // 循环 n 次（n 个多边形）
          coords.forEach(coord => {
            // 循环 1 次
            // a.根据边界点构建数组
            const vertices: Vector3[] = []
            coord.forEach((longlat, _index) => {
              // 循环 m 次（一个多边形有 m 个坐标）
              const [x, y] = this.projection(longlat as [number, number])
              // b.添加边界点
              vertices.push(new Vector3(x, y, 0))
            })
            // c.BufferGeometry 采用 Vector3 方式添加点
            const geometry = new BufferGeometry()
            geometry.setFromPoints(vertices)
            /**
             * d.线、点
             * - Line：非闭合线
             * - LineLoop：闭合线
             * - LineSegments：类似 Line
             */
            const boundary = new LineLoop(
              geometry,
              new LineBasicMaterial({ color: 0xffffff })
            )
            this.boundary.add(boundary)
          })
        })
      } else if (type === 'Polygon') {
        /**
         * 单个多边形数据结构：
         *
         * "coordinates": [
         *   [ [x1, y1], [x2, y2] ... ]
         * ]
         */
        coordinates.forEach(coord => {
          // 循环 1 次
          const shape = new Shape()
          // a.根据边界点构建数组
          const vertices: number[] = []
          coord.forEach((longlat, index) => {
            // 循环 m 次（一个多边形有 m 个坐标）
            const [x, y] = this.projection(longlat as [number, number])
            index ? shape.lineTo(x, y) : shape.moveTo(x, y)
            // b.添加边界点
            vertices.push(x, y, 0)
          })
          // c.BufferGeometry 采用数组方式添加点
          const geometry = new BufferGeometry()
          geometry.setAttribute(
            'position',
            new BufferAttribute(new Float32Array(vertices), 3)
          )
          // d.线、点
          const boundary = new LineLoop(
            geometry,
            new LineBasicMaterial({ color: 0xffffff })
          )
          this.boundary.add(boundary)
        })
      }
    })

    // 2.添加模型
    this.boundary.position.y = 4
    this.boundary.rotation.x = Math.PI / 2
    this.world.scene.add(this.boundary)
  }

  /**
   * 创建标记点
   * @returns 无
   */
  private createMark = (): void => {
    this.mark.clear()
    this.waveMark.clear()

    // 1.遍历 geojson 构建模型
    china.features.forEach(feature => {
      // 获取某个省的数据
      const { name, center } = feature.properties
      if (!isString(name) || !center) {
        return
      }
      const [x, y] = this.projection(center as [number, number])

      // a.绘制标记圆心
      const mark = new Mesh(
        new CircleGeometry(0.5, 16),
        new MeshStandardMaterial({
          color: 0xffa500,
          side: DoubleSide,
          depthTest: false // 是否参与深度测试：默认为 true（两物体共面时根据物体与相机距离确定展示情况），这里设为 false（共面时不参与深度测试，后绘制展示在先绘制前面）
        })
      )
      mark.position.set(x, y, 0)
      this.mark.add(mark)

      // b.绘制标记波纹（采用 canvas 作为材质）
      const canvas = document.createElement('canvas')
      canvas.width = 500
      canvas.height = 500
      const canvasRadius = canvas.width / 2
      const canvasCenter = { x: canvas.width / 2, y: canvas.height / 2 }
      const ctx = canvas.getContext('2d')
      ctx.strokeStyle = 'red'
      // 波纹 1
      ctx.beginPath()
      ctx.lineWidth = canvasRadius / 6
      ctx.arc(
        canvasCenter.x,
        canvasCenter.y,
        canvasRadius * 0.3,
        0,
        2 * Math.PI
      )
      ctx.stroke()
      // 波纹 2
      ctx.beginPath()
      ctx.lineWidth = canvasRadius / 12
      ctx.arc(
        canvasCenter.x,
        canvasCenter.y,
        canvasRadius * 0.6,
        0,
        2 * Math.PI
      )
      ctx.stroke()
      // 波纹 3
      ctx.beginPath()
      ctx.lineWidth = canvasRadius / 18
      ctx.arc(
        canvasCenter.x,
        canvasCenter.y,
        canvasRadius * 0.9,
        0,
        2 * Math.PI
      )
      ctx.stroke()
      const waveMark = new Mesh(
        // 波纹大小为圆心的 3 倍
        new CircleGeometry(1.5, 16),
        new MeshStandardMaterial({
          map: new CanvasTexture(canvas),
          side: DoubleSide,
          depthTest: false,
          opacity: 1,
          transparent: true
        })
      )
      waveMark.position.set(x, y, 0)
      this.waveMark.add(waveMark)
    })

    // 2.添加模型
    this.mark.position.y = 4
    this.mark.rotation.x = Math.PI / 2
    this.world.scene.add(this.mark)
    this.waveMark.position.y = 4
    this.waveMark.rotation.x = Math.PI / 2
    this.world.scene.add(this.waveMark)
  }

  /**
   * 测试
   * @returns 无
   */
  private createTest() {
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
    const obj = new LineLoop(
      geometry,
      new LineBasicMaterial({ color: 0xff0000 })
    )

    // 面绘制
    // const obj = new Mesh(
    //   geometry,
    //   new MeshStandardMaterial({ color: 0xff0000 })
    // )

    obj.position.set(0, 20, 0)
    // this.world.scene.add(obj)

    /**
     * 流动光线
     * 1.思路
     * 2.曲线类型
     * - CatmullRomCurve3 三维样条曲线
     */

    // 通过设置几个点生成一条样条曲线（3D）
    const curve1 = new CatmullRomCurve3([
      new Vector3(-30, 20, 0),
      new Vector3(-10, 10, 0),
      new Vector3(0, 6, 0),
      new Vector3(10, 10, 0),
      new Vector3(30, 20, 0)
    ])
    // 曲线细分 1000 个点，并返回所有点坐标
    const points = curve1.getSpacedPoints(1000)
    // 根据点坐标生成 geometry
    const curveGeometry = new BufferGeometry()
    curveGeometry.setFromPoints(points)
    // 绘制线条
    const line = new Line(
      curveGeometry,
      new LineBasicMaterial({ color: 0xff0000 })
    )
    this.world.scene.add(line)

    // 拖尾参数
    let lineIndex = 0 // 点起始索引
    const lineLength = 50 // 拖尾绘制点
    let linePoints = points.slice(lineIndex, lineIndex + lineLength) // 拖尾曲线点
    let lineCurve = new CatmullRomCurve3(linePoints) // 拖尾曲线
    let newLinePoints = lineCurve.getSpacedPoints(100) // 拖尾曲线细分 100 个坐标点
    const newLineGeometry = new BufferGeometry()
    newLineGeometry.setFromPoints(newLinePoints)
    newLineGeometry.setAttribute(
      'scale1',
      new BufferAttribute(
        new Float32Array(
          newLinePoints.map((_, index) => (index + 1) / lineLength)
        ),
        1
      )
    )
    const newLineMaterial = new PointsMaterial({ color: 0xfff000, size: 1.0 }) // 拖尾线条材质
    newLineMaterial.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader
        .replace(
          'void main() {',
          /* glsl */ `
            attribute float scale1;
            void main() {
          `
        )
        .replace(
          'gl_PointSize = size;',
          /* glsl */ `
            gl_PointSize = size * scale1;
          `
        )
    }
    const newLine = new Points(newLineGeometry, newLineMaterial)
    this.world.scene.add(newLine)

    setInterval(() => {
      if (lineIndex > points.length - lineLength) {
        lineIndex = 0
      } else {
        lineIndex++
      }
      let linePoints = points.slice(lineIndex, lineIndex + lineLength) // 拖尾曲线点
      let lineCurve = new CatmullRomCurve3(linePoints) // 拖尾曲线
      let newLinePoints = lineCurve.getSpacedPoints(100) // 拖尾曲线细分 100 个坐标点
      newLine.geometry.setFromPoints(newLinePoints) // 更新拖尾曲线点
    }, 16)
  }

  /**
   * 悬停地块模型
   * @param e 鼠标事件
   * @returns 无
   */
  private hoverBlock = toolThrottle((e: MouseEvent) => {
    // 1.归一化设备坐标
    const coord = this.normalization(e)
    // 2.通过 设备坐标 + 场景相机 更新射线
    const camera = this.world.getComponent<BaseCamera>(ComponentType.CAMERA)
    this.raycaster.setFromCamera(coord, camera.camera)
    // 3.计算物体和射线的焦点
    const intersects = this.raycaster.intersectObjects(
      this.block.children,
      false
    )
    // 4.修改颜色
    this.block.children.forEach(item => {
      if (item === intersects[0]?.object) {
        // 悬停地块设置特定颜色
        ;(
          (intersects[0].object as Mesh).material as MeshStandardMaterial
        ).color.setHex(0xffff00)
      } else {
        // 其他地块恢复原本颜色
        ;((item as Mesh).material as MeshStandardMaterial).color.setHex(
          ((item as Mesh).material as any).backup
        )
      }
    })
  })

  /**
   * 点击地块模型
   * @param e 鼠标事件
   * @returns 无
   */
  private clickBlock = (e: MouseEvent) => {
    // 1.归一化设备坐标
    const coord = this.normalization(e)
    // 2.通过 设备坐标 + 场景相机 更新射线
    const camera = this.world.getComponent<BaseCamera>(ComponentType.CAMERA)
    this.raycaster.setFromCamera(coord, camera.camera)
    // 3.计算物体和射线的焦点
    const intersects = this.raycaster.intersectObjects(
      this.block.children,
      false
    )
    if (!intersects[0]?.object) {
      return
    }
    // 4.输出点击地块
    console.log(intersects[0].object.name)
    // alert(intersects[0].object.name)
  }
}
