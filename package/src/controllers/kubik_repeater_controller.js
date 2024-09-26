import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ['header']
  static classes = ['expanded']

  connect() {
    // Initialization code if needed
  }

  updateHeader(event) {
    this.headerTarget.innerHTML = event.currentTarget.value
  }

  toggleItem(event) {
    if (this.element.classList.contains(this.expandedClass)) {
      this.element.classList.remove(this.expandedClass)
    } else {
      this.element.classList.add(this.expandedClass)
    }
  }
}