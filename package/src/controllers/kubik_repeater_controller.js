import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ['header']
  static classes = ['expanded']
  static values = {
    tab: String,
    index: Number,
    expanded: { type: Boolean, default: false }
  }

  connect() {
    if (this.expandedValue) {
      this.element.classList.add(this.expandedClass)
    }
  }

  updateHeader(event) {
    this.headerTarget.innerHTML = event.currentTarget.value
  }

  toggleItem(event) {
    const expanded = !this.element.classList.contains(this.expandedClass)
    if (expanded) {
      this.element.classList.add(this.expandedClass)
    } else {
      this.element.classList.remove(this.expandedClass)
    }
    this.dispatch('toggle', {
      prefix: '',
      detail: {
        tab: this.tabValue,
        index: this.indexValue,
        expanded: expanded
      }
    })
  }
}
