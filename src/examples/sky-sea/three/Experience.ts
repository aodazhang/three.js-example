import { World } from '@/underline'
import resource from './resource'
import Environment from './component/Environment'

export default class Experience extends World {
  constructor(domElement: HTMLDivElement) {
    super({
      domElement,
      resource,
      useDebug: import.meta.env.VITE_APP_ENV === 'development',
      useLight: false,
      useCssRenderer: false,
      useComposer: false
    })

    this.addComponent(new Environment(this))

    this.onConfig()
  }
}
