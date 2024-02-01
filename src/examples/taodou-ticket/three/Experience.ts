import { World } from '@/underline'
import resource from './resource'
import Environment from './component/Environment'
import Label from './component/Label'
import Rect from './component/Rect'
import TaodouTicket from './component/TaodouTicket'

export default class Experience extends World {
  constructor(domElement: HTMLDivElement) {
    super(domElement, resource)

    this.addComponent(new Environment(this))
    this.addComponent(new Label(this))
    this.addComponent(new Rect(this))
    this.addComponent(new TaodouTicket(this))

    this.onConfig()

    this.notify('reset')
  }
}
