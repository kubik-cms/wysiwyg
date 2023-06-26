import { makeElement } from '../plugins/templates/widget_generation_tools'
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  settingsValue: {
    thumb: String;
  }
  labelValue: String

  static targets = ['image']

  static values = {
    settings: Object,
    label: { type: String, default: 'Select image' }
  }

  connect():void {
    this._render()
  }

  _render(): void {
    if(this.settingsValue && this.settingsValue.thumb && this.settingsValue.thumb != '') {
      this._renderThumb()
    } else {
      this._renderEmpty()
    }
  }

  _renderEmpty(): void {
    const imageContainer = makeElement('div', ['kubik-media-gallery--file_select_container', 'kubik-media-gallery--file_select_container__small'])
    const imagePlaceholder = makeElement('div', ['kubik-image-placeholder'])
    const placeholderIcon = makeElement('div', ['material-symbols-outlined', 'material-icon'])
    placeholderIcon.innerText = 'add'

    const placeholderLabel = makeElement('div', ['kubik-media-gallery--file_select_header'])
    placeholderLabel.innerText = this.labelValue

    imageContainer.appendChild(placeholderIcon)
    imageContainer.appendChild(placeholderLabel)
    this.element.appendChild(imageContainer)
  }

  _renderThumb(): void {
    const img = makeElement('img', [], { src: this.settingsValue.thumb })
    this.element.appendChild(img)
  }
}
