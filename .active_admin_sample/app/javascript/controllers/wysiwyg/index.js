import EditorJS from '@editorjs/editorjs'
import WysiwygTools from '../wysiwyg_widgets/wysiwyg_tools';
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  static targets = ['editor', 'input']
  static values = { content: Object, widgets: Object, url: String }

  connect() {
    this.fetchContents()
    this.initializeEditor()
  }

  initializeEditor() {
    const element = this.element //as HTMLElement
    element.id = 'editor-test'
    this.editor = new EditorJS({
      holder: element,
      minHeight: 100,
      tools: WysiwygTools,
      data: this.contentValue,
      onChange: () => {
        this.saveContents()
      },
    });
  }

  saveContents() {
    if(this.editor && this.editor.save) {
      this.editor
        .save()
        .then((savedData) => {
          this.inputTarget.value = JSON.stringify(savedData)
        })
        .catch((error) => {
          console.warn('Saving failed: ', error)
        });
    }
  }

  fetchContents() {
    try {
      this.contentValue = JSON.parse(this.inputTarget.value)
    } catch (e) {
      this.contentValue = { blocks: []}
    }
  }
}

