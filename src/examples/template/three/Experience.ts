import { SceneResource, World } from '@/underline'
import resource from './resource'
import Environment from './component/Environment'
import TestObject from './component/TestObject'

export default class Experience extends World {
  constructor(domElement: HTMLDivElement) {
    super({
      domElement,
      resource,
      useDebug: import.meta.env.VITE_APP_ENV === 'development',
      useCssRenderer: false,
      useComposer: false
    })

    this.addComponent(new Environment(this))
    this.addComponent(new TestObject(this))

    this.onConfig()

    // 调整灯光位置
    this.light.directional.position.set(83, 30, 100)
  }

  override onReady(resource?: SceneResource): void {
    super.onReady(resource)
  }
}
