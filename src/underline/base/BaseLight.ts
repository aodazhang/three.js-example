/**
 * @description 基础灯光
 */
import { ComponentType } from '../type'
import { Component } from './Component'
import { World } from './World'

/** 灯光基类 */
export class BaseLight<T extends World = World> extends Component<T> {
  constructor(world: T) {
    super(world, ComponentType.LIGHT)
  }
}
