import { Controller } from "@hotwired/stimulus"
import { template } from 'lodash'

export default class extends Controller {
  static values = {
    id: Number,
    relatedMedia: Object
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
    this._renderResults()
  }

  _renderResults() {
    if(this.relatedMediaValue.thumb && this.relatedMediaValue.thumb.length > 0) {
      this.imageContainerTarget.innerHTML = this.imageTemplate(this.relatedMediaValue)
      if(this.idValue) {
        this.imageContainerTarget.innerHTML += this.existingFieldsTemplate(this.relatedMediaValue)
      } else {
        this.imageContainerTarget.innerHTML += this.newFieldsTemplate(this.relatedMediaValue)
      }
    } else {
      this.imageContainerTarget.innerHTML = this.emptyTemplate(this.relatedMediaValue)
      if(this.idValue) {
        this.imageContainerTarget.innerHTML += this.existingFieldsDeleteTemplate(this.relatedMediaValue)
      }
    }
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
    this._renderResults()
  }

  receiveModalReturn(returnObject) {
    this.relatedMediaValue = returnObject.payload
  }

  removeImage() {
    this.relatedMediaValue = { id: null, thumb: null, kubik_media_upload_id: null }
  }
}
