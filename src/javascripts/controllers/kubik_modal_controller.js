import { Controller } from "@hotwired/stimulus"
export default class extends Controller {

  static targets = ['modalTemplate', 'modalContainer', 'modalFrame', 'modalHeader']
  static values = {
    modalHeader: { type: String, default: '' },
    modalStatus: { type: String, default: 'closed'},
    modalSrc: { type: String, default: ''},
    modalAction: { type: String, default: ''},
    modalReturnPayload: { type: Object, default: {}},
    modalReturnController: { type: String, default: ''}
  }

  initialize() {
    this._renderDOMElements()
    document.addEventListener("keydown", event => {
      if (event.keyCode === 27) {
        this.closeModal();
      }
    })
  }

  connect() {
  }

  get modalTemplate() {
    return this.modalTemplateTarget.innerHTML;
  }

  selectModal(e) {
    if(this.modalActionValue == 'return') {
      const [targetControllerName, targetControllerId] = this.modalReturnControllerValue.split('#')
      const targetController = this.application.getControllerForElementAndIdentifier(document.getElementById(targetControllerId), targetControllerName)
      targetController.receiveModalReturn({ payload: { kubik_media_upload_id: parseInt(e.currentTarget.dataset.selectedKubikMediaUploadId), thumb: e.currentTarget.dataset.selectedThumb }, return_payload: this.modalReturnPayloadValue})
      this.closeModal()
    }
  }

  modalStatusValueChanged() {
    if(this.hasModalContainerTarget) {
      if(this.modalStatusValue == 'opened') {
        this.modalContainerTarget.classList.add('kubik-modal-element__open')
      } else {
        this.modalContainerTarget.classList.remove('kubik-modal-element__open')
      }
    }
  }

  modalSrcValueChanged() {
    if(this.hasModalFrameTarget) {
      if(this.modalSrcValue == '') {
        this.modalFrameTarget.src = this.modalSrcValue
        this.modalFrameTarget.innerHTML = ''
      } else {
        this.modalFrameTarget.src = this.modalSrcValue
      }
    }
  }

  modalHeaderValueChanged() {
    if(this.hasModalHeaderTarget) {
      this.modalHeaderTarget.innerText = this.modalHeaderValue
    }
  }

  openModal(e) {
    this.modalSrcValue = e.currentTarget.attributes.src.value
    this.modalHeaderValue = e.currentTarget.dataset.kubikModalHeaderText
    this.modalActionValue = e.currentTarget.dataset.kubikModalAction
    this.modalReturnControllerValue = e.currentTarget.dataset.kubikModalReturnController
    if(e.currentTarget.dataset.kubikModalReturnPayload) {
      this.modalReturnPayloadValue = JSON.parse(e.currentTarget.dataset.kubikModalReturnPayload)
    }
    this.modalStatusValue = 'opened'
  }

  modalReturnPayloadValueChanged() {
  }

  closeModal() {
    this.modalStatusValue = 'closed'
    this.modalSrcValue = ''
    this.modalHeaderValue = ''
    this.modalActionValue = ''
    this.modalReturnControllerValue = ''
    this.modalReturnPayloadValue = {}
  }

  _renderDOMElements() {
    if (!document.getElementById('kubik-modal')) {
      document.body.insertAdjacentHTML('beforeend', this.modalTemplate)
    }
  }
}

