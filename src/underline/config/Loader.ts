import {
  AudioLoader,
  DataTexture,
  FileLoader,
  // DefaultLoadingManager,
  Group,
  LoadingManager,
  Texture,
  TextureLoader
} from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { isArray } from '../utils'
import { Component, SceneResource, World } from '../base'

/** 资源加载类 */
export class Loader extends Component {
  /** 加载资源 */
  public readonly resource: SceneResource = {
    texture: new Map<string, Texture>(),
    hdr: new Map<string, DataTexture>(),
    audio: new Map<string, AudioBuffer>(),
    gltf: new Map<string, GLTF>(),
    fbx: new Map<string, Group>(),
    file: new Map<string, string | ArrayBuffer>()
  }
  /** 原始资源 */
  private originalResource: Map<string, string> = new Map()
  /** 加载管理器 */
  private loadingManager: LoadingManager = null
  /** 纹理贴图加载器 */
  private textureLoader: TextureLoader = null
  /** hdr 贴图加载器 */
  private rgbeLoader: RGBELoader = null
  /** 音频加载器 */
  private audioLoader: AudioLoader = null
  /** gltf 模型加载器 */
  private gltfLoader: GLTFLoader = null
  /** FBX 模型加载器 */
  private fbxLoader: FBXLoader = null
  /** 文件加载器 */
  private fileLoader: FileLoader = null

  constructor(world: World, resource: Map<string, string>) {
    super(world)
    resource && (this.originalResource = resource)
  }

  override onConfig(): void {
    // 一.全局加载管理器
    // DefaultLoadingManager.onProgress = (_url, loaded, total) => {
    //   // [通信]发布加载进度
    //   this.world.notify('progress', (loaded / total) * 100)
    // }
    // DefaultLoadingManager.onLoad = () => {
    //   // [通信]发布资源加载完毕
    //   this.world.notify('ready', this.resource)
    // }

    // 二.加载管理器
    this.loadingManager = new LoadingManager()
    this.loadingManager.onProgress = (_url, loaded, total) => {
      // [通信]发布加载进度
      this.world.notify('progress', (loaded / total) * 100)
    }
    this.loadingManager.onLoad = () => {
      // [通信]发布资源加载完毕
      this.world.notify('ready', this.resource)
    }

    // 1.纹理贴图加载器
    this.textureLoader = new TextureLoader(this.loadingManager)
    this.textureLoader.crossOrigin = 'anonymous'

    // 2.hdr 贴图加载器
    this.rgbeLoader = new RGBELoader(this.loadingManager)
    this.rgbeLoader.crossOrigin = 'anonymous'

    // 3.音频加载器
    this.audioLoader = new AudioLoader(this.loadingManager)
    this.audioLoader.crossOrigin = 'anonymous'

    // 4.gltf 模型加载器
    this.gltfLoader = new GLTFLoader(this.loadingManager)
    this.gltfLoader.crossOrigin = 'anonymous'

    // 5.FBX 模型加载器
    this.fbxLoader = new FBXLoader(this.loadingManager)
    this.fbxLoader.crossOrigin = 'anonymous'

    // 6.文件加载器
    this.fileLoader = new FileLoader(this.loadingManager)
    this.fileLoader.crossOrigin = 'anonymous'

    // 遍历资源加载
    for (const [key, url] of this.originalResource) {
      const extensions = url.match(/(?!=\w+\.)\w+$/g)
      if (!isArray(extensions) || !extensions[0]) {
        continue
      }
      const extension = extensions[0]
      if (
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)
      ) {
        this.textureLoader.load(url, item =>
          this.resource.texture.set(key, item)
        )
      } else if (['hdr'].includes(extension)) {
        this.rgbeLoader.load(url, item => this.resource.hdr.set(key, item))
      } else if (['mp3', 'wav'].includes(extension)) {
        // 注意：该加载器通常在 LoadingManager 完成后才能调用
        this.audioLoader.load(url, item => this.resource.audio.set(key, item))
      } else if (['gltf', 'glb'].includes(extension)) {
        this.gltfLoader.load(url, item => this.resource.gltf.set(key, item))
      } else if (['FBX'].includes(extension)) {
        this.fbxLoader.load(url, item => this.resource.fbx.set(key, item))
      } else {
        this.fileLoader.load(url, item => this.resource.file.set(key, item))
      }
    }
  }
}
