import { Dropzone } from "dropzone";
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "input", "text", "submit", "placeholder", "form" ]
  static values = { text: String, turbo: Boolean }
  connect() {
    const dropzone = new Dropzone(this.formTarget, {
      paramName: 'kubik_media_upload[image]',
      thumbnailHeight: 180,
      thumbnailWidth: 180,
      thumbnailMethod: 'crop',
      headers: this.headers,
    })
    this.element.classList.add('dropzone_ready')
  }
  textValueChanged() {
    this.textTarget.innerHTML = this.textValue
  }
  get headers() {
    return this.turboValue === true ? {"Accept": "text/vnd.turbo-stream.html" } : null
  }
  file_changed(e) {
    const filename = e.target.files[0].name
    this.textValue = filename
    if(filename.length > 0) {
      this.submitTarget.style.display = 'block'
      this.placeholderTarget.classList.remove('no-file')
    } else {
      this.placeholderTarget.classList.add('no-file')
    }
  }
}

