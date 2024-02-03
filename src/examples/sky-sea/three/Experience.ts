import { World } from '@/underline'
import resource from './resource'
import Environment from './component/Environment'

export default class Experience extends World {
  constructor(domElement: HTMLDivElement) {
    super({
      domElement,
      resource,
      useDebug: true,
      useLight: false,
      useCssRenderer: false,
      useComposer: false
    })

    this.addComponent(new Environment(this))

    this.onConfig()
  }
}
