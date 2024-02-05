import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  hasExpandedClass: Boolean
  expandedClass: string
  headerTarget: HTMLElement

  static targets = ['header']

  static classes = [ 'expanded' ]

  updateHeader(event):void {
    this.headerTarget.innerHTML = event.currentTarget.value
  }

  toggleItem(event):void {
    Array.from(this.element.classList).includes(this.expandedClass) ?
      this.element.classList.remove(this.expandedClass) :
      this.element.classList.add(this.expandedClass)
  }
}
