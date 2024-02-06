import { Mesh, ShaderMaterial, SphereGeometry } from 'three'
import { Component, SceneResource } from '@/underline'
import Experience from '../Experience'
import vertexShader from '../shader/TestObject/vertexShader.glsl'
import fragmentShader from '../shader/TestObject/fragmentShader.glsl'

/** 测试物体 */
export default class TestObject extends Component<Experience> {
  /** 球体 */
  private sphere: Mesh = null
  /** shader uniforms */
  private readonly uniforms = {
    iTime: { value: 0 },
    uDistort: { value: 0.5 }
  }

  constructor(world: Experience) {
    super(world)
  }

  override onReady(_resource?: SceneResource): void {
    // 一.球体
    this.sphere = new Mesh(
      new SphereGeometry(20, 512, 512),
      new ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader,
        fragmentShader
      })
    )
    this.world.scene.add(this.sphere)
  }

  override onDebug(): void {
    // 面板控制器
    this.world.gui
      .addFolder('TestObject')
      .add(this.uniforms.uDistort, 'value')
      .name('噪波强度')
      .min(0)
      .max(3)
      .step(0.1)
  }

  override onUpdate(_delta?: number): void {
    // 更新运行时间
    this.uniforms.iTime.value = this.world.clock.getElapsedTime()
  }
}
