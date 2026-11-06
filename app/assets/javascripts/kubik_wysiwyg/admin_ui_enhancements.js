import applyKubikWysiwygEditorPatches from 'kubik_wysiwyg/admin_editor_patches'
import Wysiwyg from '@kubik-cms/wysiwyg'
import applyInlineLinkAdminEnhancements, {
  openRichTextLinkPanel,
  unlinkSelectionInEditor,
} from 'kubik_wysiwyg/wysiwyg_inline_link_admin'

const RICH_TEXT_TOOLBAR_ACTIONS = [
  { command: 'bold', label: 'Bold', icon: 'format_bold' },
  { command: 'italic', label: 'Italic', icon: 'format_italic' },
  { command: 'underline', label: 'Underline', icon: 'format_underlined' },
  { command: 'createLink', label: 'Link', icon: 'link_2', prompt: true },
  { command: 'unlink', label: 'Remove link', icon: 'link_off' },
]

function runEditorCommand(editor, command, value = null) {
  editor.focus()
  document.execCommand(command, false, value)
  editor.dispatchEvent(new Event('input', { bubbles: true }))
}

function bindRichTextEnterKey(editor) {
  editor.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return
    event.stopPropagation()
  })
}

function bindRichTextToolbar(toolbar, editor) {
  toolbar.addEventListener('mousedown', (event) => {
    event.preventDefault()
  })

  toolbar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-rich-text-command]')
    if (!button || !toolbar.contains(button)) return

    const command = button.dataset.richTextCommand
    if (command === 'createLink') {
      openRichTextLinkPanel(editor, button)
      return
    }

    if (command === 'unlink') {
      if (!unlinkSelectionInEditor(editor)) {
        runEditorCommand(editor, command)
      }
      return
    }

    runEditorCommand(editor, command)
  })
}

function wrapRichTextEditor(editor) {
  if (editor.dataset.richTextEnhanced === 'true') return
  if (editor.getAttribute('contenteditable') !== 'true') return

  editor.dataset.richTextEnhanced = 'true'
  try {
    document.execCommand('defaultParagraphSeparator', false, 'p')
  } catch {
    // Unsupported in some browsers; render still wraps loose text in <p>.
  }

  const shell = document.createElement('div')
  shell.className = 'kubik-wysiwyg-rich-text-field'

  const toolbar = document.createElement('div')
  toolbar.className = 'kubik-wysiwyg-rich-text-field__toolbar'
  toolbar.setAttribute('role', 'toolbar')
  toolbar.innerHTML = RICH_TEXT_TOOLBAR_ACTIONS.map(
    (action) =>
      `<button type="button" class="kubik-wysiwyg-rich-text-field__tool" data-rich-text-command="${action.command}" title="${action.label}" aria-label="${action.label}">
        <span class="material-symbols-outlined" aria-hidden="true">${action.icon}</span>
      </button>`,
  ).join('')

  const inputWrapper = document.createElement('div')
  inputWrapper.className = 'kubik-wysiwyg-rich-text-field__input'

  editor.parentNode.insertBefore(shell, editor)
  inputWrapper.appendChild(editor)
  shell.appendChild(toolbar)
  shell.appendChild(inputWrapper)

  bindRichTextToolbar(toolbar, editor)
  bindRichTextEnterKey(editor)
}

function enhanceRichTextFields(root = document) {
  root.querySelectorAll('.input.input-wysiwyg[contenteditable="true"]').forEach(wrapRichTextEditor)
}

function patchWidgetEnterKeyForTextareas() {
  const Controller = Wysiwyg.KubikWidgetController
  if (!Controller || Controller.__kubikWysiwygTextareaEnterPatched) return

  const previousHandleKeyDown = Controller.prototype.handleKeyDown

  Controller.prototype.handleKeyDown = function handleKeyDownWithTextareaEnter(event) {
    const active = document.activeElement
    if (!this.element.contains(active)) return

    if (active.tagName === 'TEXTAREA' && event.key === 'Enter') {
      event.stopPropagation()
      return
    }

    return previousHandleKeyDown.call(this, event)
  }

  Controller.__kubikWysiwygTextareaEnterPatched = true
}

const RECORD_LIST_EXPANDABLE_ITEMS_CLASS = 'kubik-wysiwyg-record-list--expandable-items'
const DOWNLOADS_WIDGET_FRAME_CLASS = 'kubik-wysiwyg-downloads'

const RECORD_LIST_ITEM_FIELDS_SELECTOR = [
  '.kubik-wysiwyg-repeated-item .kubik_widget_section__fields .input[name]',
  '.kubik-wysiwyg-repeated-item .fields-container .input[name*="link_text"]',
].join(', ')

function downloadsWidgetFrame(frame) {
  if (!(frame instanceof Element)) return false
  if (frame.classList.contains(DOWNLOADS_WIDGET_FRAME_CLASS)) return true

  const setupRaw = frame.getAttribute('data-kubik-widget-setup-value')
  if (!setupRaw) return false

  try {
    const setup = JSON.parse(setupRaw)
    return setup.widget_type === 'downloads' || setup.config?.widget_name === 'downloads'
  } catch {
    return false
  }
}

function markRecordListExpandableItems(frame) {
  if (!(frame instanceof Element)) return

  if (downloadsWidgetFrame(frame)) {
    frame.classList.add(DOWNLOADS_WIDGET_FRAME_CLASS, RECORD_LIST_EXPANDABLE_ITEMS_CLASS)
    return
  }

  if (!frame.classList.contains('kubik-wysiwyg-record-list')) {
    frame.classList.remove(RECORD_LIST_EXPANDABLE_ITEMS_CLASS)
    return
  }

  if (frame.querySelector(RECORD_LIST_ITEM_FIELDS_SELECTOR)) {
    frame.classList.add(RECORD_LIST_EXPANDABLE_ITEMS_CLASS)
  } else {
    frame.classList.remove(RECORD_LIST_EXPANDABLE_ITEMS_CLASS)
  }
}

function patchDownloadsWidgetFrameClasses() {
  const PluginFactory = Wysiwyg.PluginFactory
  if (!PluginFactory || PluginFactory.__kubikWysiwygDownloadsFrameClassPatched) return

  const previousRender = PluginFactory.prototype.render
  PluginFactory.prototype.render = function renderWithDownloadsFrameClasses() {
    const frame = previousRender.call(this)
    if (this.config?.widget_name === 'downloads') {
      frame.classList.add(DOWNLOADS_WIDGET_FRAME_CLASS, RECORD_LIST_EXPANDABLE_ITEMS_CLASS)
    }
    return frame
  }

  PluginFactory.__kubikWysiwygDownloadsFrameClassPatched = true
}

function observeRecordListExpandableItems(frame) {
  if (frame._kubikWysiwygExpandableItemsObserver) return

  let scheduled = false
  const run = () => {
    scheduled = false
    markRecordListExpandableItems(frame)
  }

  frame._kubikWysiwygExpandableItemsObserver = new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(run)
  })
  frame._kubikWysiwygExpandableItemsObserver.observe(frame, { childList: true, subtree: true })
}

function patchRecordListExpandableItems() {
  const Controller = Wysiwyg.KubikWidgetController
  if (!Controller || Controller.__kubikWysiwygExpandableItemsPatched) return

  const previousConnect = Controller.prototype.connect
  Controller.prototype.connect = function connectWithExpandableRecordListItems() {
    previousConnect.call(this)
    const frame = this.element
    if (!downloadsWidgetFrame(frame) && !frame.classList.contains('kubik-wysiwyg-record-list')) return
    observeRecordListExpandableItems(frame)
    requestAnimationFrame(() => markRecordListExpandableItems(frame))
  }

  Controller.__kubikWysiwygExpandableItemsPatched = true

  const scan = (root = document) => {
    root.querySelectorAll('turbo-frame.kubik-wysiwyg-component').forEach((frame) => {
      if (!downloadsWidgetFrame(frame) && !frame.classList.contains('kubik-wysiwyg-record-list')) return
      observeRecordListExpandableItems(frame)
      markRecordListExpandableItems(frame)
    })
  }

  document.addEventListener('turbo:load', () => scan())
  document.addEventListener('turbo:frame-load', (event) => {
    if (event.target instanceof Element) scan(event.target)
  })
  scan()
}

function observeRichTextFields() {
  if (window.__kubikWysiwygRichTextObserver) return
  window.__kubikWysiwygRichTextObserver = true

  const scan = () => enhanceRichTextFields()
  document.addEventListener('turbo:load', scan)
  document.addEventListener('turbo:frame-load', (event) => {
    if (event.target instanceof Element) enhanceRichTextFields(event.target)
  })

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return
        enhanceRichTextFields(node)
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
  scan()
}

export default function applyKubikWysiwygAdminUiEnhancements() {
  applyKubikWysiwygEditorPatches()
  applyInlineLinkAdminEnhancements()
  patchDownloadsWidgetFrameClasses()
  patchWidgetEnterKeyForTextareas()
  patchRecordListExpandableItems()
  observeRichTextFields()
}
