import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  hasExpandedClass: Boolean
  expandedClass: string

  static classes = [ 'expanded' ]

  connect():void {
  }

  toggleItem(event):void {
    Array.from(this.element.classList).includes(this.expandedClass) ?
      this.element.classList.remove(this.expandedClass) :
      this.element.classList.add(this.expandedClass)
  }
}
