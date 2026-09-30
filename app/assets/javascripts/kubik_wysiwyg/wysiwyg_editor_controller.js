import EditorJS from '@editorjs/editorjs'
import { ensureEditorJsInlineIcons } from '@kubik-cms/wysiwyg'
import { flushAllKubikWidgetFields } from 'kubik_wysiwyg/admin_editor_patches'
import { Controller } from '@hotwired/stimulus'
import debounce from 'lodash.debounce'

const formSubmitBindings = new WeakMap()

let configuredEditorTools = {}
let configuredInlineToolbar = []

export function configureKubikWysiwygEditor({ tools, inlineToolbar }) {
  if (tools) configuredEditorTools = tools
  if (inlineToolbar) configuredInlineToolbar = inlineToolbar
}

function persistAllEditorsOnForm(form, binding) {
  const app = window.KubikInterfaceStimulus
  const promises = []
  const seen = new Set()

  form.querySelectorAll('[data-controller~="editor"]').forEach((element) => {
    const controller = app?.getControllerForElementAndIdentifier?.(element, 'editor')
    if (controller?.persistEditorToInput && !seen.has(controller)) {
      seen.add(controller)
      promises.push(controller.persistEditorToInput())
    }
  })

  if (promises.length === 0) {
    binding.controllers.forEach((controller) => {
      if (controller.persistEditorToInput && !seen.has(controller)) {
        seen.add(controller)
        promises.push(controller.persistEditorToInput())
      }
    })
  }

  return Promise.all(promises)
}

function submitFormWithoutResyncing(form) {
  form.submit()
}

function handleWysiwygFormSubmit(event, form, binding) {
  const hasEditor = Array.from(binding.controllers).some((controller) => controller.editor?.save)
  if (!hasEditor) return

  event.preventDefault()
  event.stopImmediatePropagation()

  if (form.dataset.wysiwygSyncInFlight === '1') {
    return
  }

  form.dataset.wysiwygSyncInFlight = '1'

  binding.controllers.forEach((controller) => {
    controller.saveContentsDebounced?.cancel?.()
  })

  persistAllEditorsOnForm(form, binding)
    .then(() => {
      delete form.dataset.wysiwygSyncInFlight
      submitFormWithoutResyncing(form)
    })
    .catch((error) => {
      delete form.dataset.wysiwygSyncInFlight
      console.warn('WYSIWYG save before submit failed:', error)
    })
}

function bindFormSubmit(controller) {
  const form = controller.element.closest('form')
  if (!form) return

  let binding = formSubmitBindings.get(form)
  if (!binding) {
    binding = { controllers: new Set(), handler: null }
    binding.handler = (event) => handleWysiwygFormSubmit(event, form, binding)
    form.addEventListener('submit', binding.handler, true)
    formSubmitBindings.set(form, binding)
  }

  binding.controllers.add(controller)
}

function unbindFormSubmit(controller) {
  const form = controller.element.closest('form')
  if (!form) return

  const binding = formSubmitBindings.get(form)
  if (!binding) return

  binding.controllers.delete(controller)
  if (binding.controllers.size === 0) {
    form.removeEventListener('submit', binding.handler, true)
    formSubmitBindings.delete(form)
  }
}

export default class KubikWysiwygEditorController extends Controller {
  static targets = ['editor', 'input']
  static values = { content: Object, widgets: Object, url: String }

  connect() {
    this.fetchContents()
    this.saveContentsDebounced = debounce(() => this.saveContents(), 400)
    this.initializeEditor()
    bindFormSubmit(this)
  }

  disconnect() {
    unbindFormSubmit(this)
    if (this.saveContentsDebounced?.cancel) {
      this.saveContentsDebounced.cancel()
    }
    if (this.editor?.destroy) {
      this.editor.destroy()
      this.editor = null
    }
  }

  persistEditorToInput() {
    const holder = this.hasEditorTarget ? this.editorTarget : this.element
    const app = this.application || window.KubikInterfaceStimulus
    const ready = this.editor?.isReady ?? Promise.resolve()

    return ready.then(() => {
      flushAllKubikWidgetFields(app, holder)
      return this.editor.save()
    }).then((savedData) => {
      this.inputTarget.value = JSON.stringify(savedData)
    })
  }

  initializeEditor() {
    ensureEditorJsInlineIcons()

    const holder = this.hasEditorTarget ? this.editorTarget : this.element
    if (!holder.id) {
      holder.id = `kubik-editor-${this.element.dataset.editorId || Math.random().toString(36).slice(2, 9)}`
    }
    this.editor = new EditorJS({
      holder,
      minHeight: 100,
      inlineToolbar: configuredInlineToolbar,
      tools: configuredEditorTools,
      data: this.contentValue,
      onChange: () => {
        this.saveContentsDebounced()
      },
    })
  }

  saveContents() {
    if (!this.editor?.save) return

    this.persistEditorToInput().catch((error) => {
      console.warn('Saving failed: ', error)
    })
  }

  fetchContents() {
    try {
      this.contentValue = JSON.parse(this.inputTarget.value)
    } catch (_e) {
      this.contentValue = { blocks: [] }
    }
  }
}
