import {
  FrontSide,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial
} from 'three'
import { Component } from '@/underline'
import Experience from '../Experience'
import vertexShader from '../shader/rect/vertexShader.glsl'
import fragmentShader from '../shader/rect/fragmentShader.glsl'

/** 矩形类 */
export default class Rect extends Component<Experience> {
  /** 地面 */
  private plane: Mesh = null

  constructor(world: Experience) {
    super(world)
  }

  override onReady(): void {
    // 一.创建辉光地面
    const width = 100
    const height = 100
    this.plane = new Mesh(
      new PlaneGeometry(width, height),
      new ShaderMaterial({
        uniforms: {
          uRatio: { value: width / height },
          iTime: { value: this.world.clock.getElapsedTime() }
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: FrontSide
      })
    )
    this.plane.position.set(0, 1, 0)
    this.plane.rotation.set(-Math.PI / 2, 0, 0)
    this.world.scene.add(this.plane)
    // 处理地面辉光效果
    this.plane.layers.toggle(this.world.composer.bloomLayerIndex)

    // 二.镜面地板
    const floor = new Mesh(
      new PlaneGeometry(width, height),
      new MeshStandardMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: 0,
        envMapIntensity: 1.5
      })
    )
    floor.position.set(0, 0, 0)
    floor.rotation.set(-Math.PI / 2, 0, 0)
    this.world.scene.add(floor)
  }

  override onUpdate(): void {
    // 更新运行时间
    ;(this.plane.material as ShaderMaterial).uniforms.iTime.value =
      this.world.clock.getElapsedTime()
  }
}
