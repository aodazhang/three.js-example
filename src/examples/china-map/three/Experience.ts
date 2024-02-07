import { World } from '@/underline'
import resource from './resource'
import Environment from './component/Environment'
import Map from './component/Map'

export default class Experience extends World {
  constructor(domElement: HTMLDivElement) {
    super({
      domElement,
      resource,
      useDebug: import.meta.env.VITE_APP_ENV === 'development'
    })

    this.addComponent(new Environment(this))
    this.addComponent(new Map(this))
  }
}
