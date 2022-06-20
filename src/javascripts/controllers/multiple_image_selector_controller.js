import { Controller } from "@hotwired/stimulus"
import { template } from 'lodash'

export default class extends Controller {
  static values = {
    relatedMedia: { type: Array, default: [] }
  }

  static targets = [
    'imageContainer',
    'emptyTemplate',
    'imageTemplate',
    'newFieldsDeleteTemplate',
    'newFieldsTemplate',
    'existingFieldsTemplate',
    'existingFieldsDeleteTemplate',
    'associationId',
    'mediaUploadId',
    'mediaUploadDelete'
  ]

  connect() {
    this._renderImages()
  }

  _renderImages() {
    this.imageContainerTarget.innerHTML = ''
    this.relatedMediaValue.forEach( function(image, index) {
      const imageData = { ...image, ...{ index: index } }
      if(image.thumb && image.thumb.length > 0) {
        if(imageData.deleteImage) {
          this.imageContainerTarget.innerHTML += this.existingFieldsDeleteTemplate(imageData)
        } else {
          this.imageContainerTarget.innerHTML += this.imageTemplate(imageData)
        }
        if(typeof imageData.id !== 'undefined') {
          this.imageContainerTarget.innerHTML += this.existingFieldsTemplate(imageData)
        } else {
          this.imageContainerTarget.innerHTML += this.newFieldsTemplate(imageData)
        }
      }
    }, this)
    this.imageContainerTarget.innerHTML += this.emptyTemplate()
  }

  get imageTemplate() {
    return template(this.imageTemplateTarget.innerHTML);
  }

  get emptyTemplate() {
    return template(this.emptyTemplateTarget.innerHTML);
  }

  get existingFieldsDeleteTemplate() {
    return template(this.existingFieldsDeleteTemplateTarget.innerHTML);
  }

  get existingFieldsTemplate() {
    return template(this.existingFieldsTemplateTarget.innerHTML);
  }

  get newFieldsTemplate() {
    return template(this.newFieldsTemplateTarget.innerHTML);
  }
  relatedMediaValueChanged() {
    this._renderImages()
  }
  receiveModalReturn(returnObject) {
    if(typeof returnObject.return_payload.index !== 'undefined') {
      this.relatedMediaValue = [
        ...this.relatedMediaValue.slice(0, returnObject.return_payload.index),
        Object.assign(returnObject.payload, returnObject.return_payload),
        ...this.relatedMediaValue.slice(returnObject.return_payload.index + 1)
      ]
    } else {
      this.relatedMediaValue = [
        ...this.relatedMediaValue,
        Object.assign(returnObject.payload, { id: null })
      ]
    }
  }
  removeImage(e) {
    const index = e.currentTarget.dataset.imageIndex
    if(this.relatedMediaValue[index].id) {
      this.relatedMediaValue = Object.assign([], this.relatedMediaValue, {[index]: Object.assign(this.relatedMediaValue[index], { deleteImage: true })})
    } else {
      this.relatedMediaValue = [
        ...this.relatedMediaValue.slice(0, (index)),
        ...this.relatedMediaValue.slice(index + 1)
      ]
    }
  }
}
