/**
 * @description 类型
 */
import { DataTexture, Group, Texture } from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'

/** 场景资源 */
export interface SceneResource {
  texture: Map<string, Texture>
  hdr: Map<string, DataTexture>
  audio: Map<string, AudioBuffer>
  gltf: Map<string, GLTF>
  fbx: Map<string, Group>
  file: Map<string, string | ArrayBuffer>
}

/** 渲染节点尺寸 */
export interface DomElementSize {
  width: number
  height: number
  ascept: number
  ratio: number
  left: number
  right: number
  top: number
  bottom: number
}

/** 通信 callback */
export type EmitCallBack<T = unknown> = (message?: T) => unknown

/** 组件类型 */
export enum ComponentType {
  /** 加载器 */
  LOADER = 0,
  /** 渲染器 */
  RENDER,
  /** 相机 */
  CAMERA,
  /** 合成器 */
  COMPOSER,
  /** 灯光 */
  LIGHT,
  /** 普通组件 */
  NORMAL
}
