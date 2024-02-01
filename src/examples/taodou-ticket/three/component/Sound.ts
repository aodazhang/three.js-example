import {
  Audio,
  AudioAnalyser,
  DataTexture,
  FrontSide,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RedFormat,
  ShaderMaterial
} from 'three'
import { Component } from '@/underline'
import Experience from '../Experience'
import vertexShader from '../shader/rect/vertexShader.glsl'
import fragmentShader from '../shader/rect/fragmentShader.glsl'

/** 声音 */
export default class Sound extends Component<Experience> {
  /** 音频 */
  private audio: Audio = null
  /** 音频分析器 */
  private analyser: AudioAnalyser = null
  /** 音频可视化 */
  private plane: Mesh = null
  /** 音频材质（数据） */
  private dataTexture: DataTexture = null

  constructor(world: Experience) {
    super(world)
  }

  override onConfig(): void {
    // [通信]订阅播放音乐
    this.world.on('sound', this.onPlaySound)
  }

  override onReady(): void {
    // 一.创建音频
    const { audio, analyser, fftSize } = this.createAudio(true)
    this.audio = audio
    this.analyser = analyser

    // 二.音频可视化
    const width = 100
    const height = 100
    this.dataTexture = new DataTexture(
      this.analyser.data,
      fftSize / 2,
      1,
      RedFormat
    )
    this.plane = new Mesh(
      new PlaneGeometry(width, height),
      new ShaderMaterial({
        uniforms: {
          uRatio: { value: width / height },
          uDiffuse: { value: this.dataTexture }
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

    // 三.镜面地板
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
    // 计算音频分析
    this.analyser.getFrequencyData()
    // 更新音频材质（数据）
    this.dataTexture.needsUpdate = true
  }

  override onDestory(): void {
    // [通信]取消订阅播放音乐
    this.world.off('sound', this.onPlaySound)
    // 停止音频播放
    this.audio.stop()
    // 卸载音频材质（数据）
    this.dataTexture.dispose()
  }

  /**
   * 播放音乐
   * @returns 无
   */
  private onPlaySound = (): void => {
    this.audio.setBuffer(this.world.loader.resource.audio.get('bgm1')) // 设置音频 buffer 数据
    this.audio.setLoop(true) // 是否循环
    this.audio.setVolume(0.2) // 音量
    this.audio.play() // play-播放、stop-停止、pause-暂停
  }
}
