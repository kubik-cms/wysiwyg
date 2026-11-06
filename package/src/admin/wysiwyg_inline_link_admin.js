import Wysiwyg from '@kubik-cms/wysiwyg'

const TARGET_OPTIONS = [
  ['Same tab', ''],
  ['New tab', '_blank'],
  ['Parent frame', '_parent'],
  ['Top frame', '_top'],
]

const REL_OPTIONS = [
  ['None', ''],
  ['noopener noreferrer', 'noopener noreferrer'],
  ['noopener', 'noopener'],
  ['noreferrer', 'noreferrer'],
  ['nofollow', 'nofollow'],
  ['sponsored', 'sponsored'],
  ['ugc', 'ugc'],
]

const REPEATER_FIELD_NAME = /^(\w+)\[repeated_items\]\[(\d+)\]\.(.+)$/

let activePanel = null
let outsidePointerHandler = null
let escapeKeyHandler = null

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
}

function buildSelectOptions(pairs, selected = '') {
  return pairs
    .map(([label, value]) => {
      const selectedAttr = String(value) === String(selected) ? ' selected' : ''
      return `<option value="${escapeAttr(value)}"${selectedAttr}>${escapeAttr(label)}</option>`
    })
    .join('')
}

function kubikNavigableWysiwygEnabled() {
  const meta = document.querySelector("meta[name='kubik-navigable-wysiwyg']")
  return meta?.content === 'true'
}

function navigableMeta() {
  const search = document.querySelector("meta[name='kubik-navigable-search-url']")
  const filters = document.querySelector("meta[name='kubik-navigable-filter-options']")
  return {
    searchUrl: search?.content,
    filterOptions: filters?.content ? JSON.parse(filters.content) : [],
  }
}

function styleOptionPairs() {
  const meta = document.querySelector("meta[name='kubik-navigable-link-style-options']")
  if (!meta?.content) {
    return [
      ['Default (text link)', ''],
      ['Blue button', 'blue'],
      ['Pink button', 'pink'],
      ['Green button', 'green'],
      ['Orange button', 'orange'],
      ['Red button', 'red'],
      ['Grey button', 'grey'],
      ['White button', 'white'],
    ]
  }
  try {
    return JSON.parse(meta.content).map((option) => [option.label, option.value])
  } catch {
    return [['Default (text link)', '']]
  }
}

function buildFilterOptions(filterOptions, selected = '') {
  return (filterOptions || [])
    .map((option) => {
      const selectedAttr = String(option.key) === String(selected) ? ' selected' : ''
      return `<option value="${escapeAttr(option.key)}"${selectedAttr}>${escapeAttr(option.label)}</option>`
    })
    .join('')
}

function rangeElement(node) {
  if (!node) return null
  return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement
}

export function findAnchorFromRange(range) {
  if (!range) return null

  const start = rangeElement(range.startContainer)?.closest?.('a')
  if (start) return start

  const end = rangeElement(range.endContainer)?.closest?.('a')
  if (end) return end

  const ancestor = rangeElement(range.commonAncestorContainer)
  return ancestor?.closest?.('a') || ancestor?.querySelector?.('a') || null
}

export function unwrapAnchor(anchor) {
  if (!anchor?.parentNode) return

  const parent = anchor.parentNode
  const editor = anchor.closest?.('[contenteditable="true"]')
  while (anchor.firstChild) {
    parent.insertBefore(anchor.firstChild, anchor)
  }
  anchor.remove()
  editor?.dispatchEvent(new Event('input', { bubbles: true }))
}

function payloadFromAnchor(anchor) {
  if (!anchor) return null

  let nav = {}
  const raw = anchor.getAttribute('data-kubik-nav')
  if (raw) {
    try {
      nav = JSON.parse(raw) || {}
    } catch {
      nav = {}
    }
  }

  const href = anchor.getAttribute('href') || ''
  const target = anchor.getAttribute('target') || nav.target || ''
  const rel = anchor.getAttribute('rel') || nav.rel || ''
  const style = anchor.getAttribute('data-kubik-link-style') || nav.style || ''
  const hasSystemRef = Boolean(nav.kind && nav.kind !== 'url') || Boolean(nav.id) || Boolean(nav.resource_type)
  const manual = nav.kind === 'url' || (!hasSystemRef && Boolean(href || nav.href))

  return {
    ...nav,
    ...(manual ? { kind: 'url', href: nav.href || href } : {}),
    ...(!manual && href && !nav.resolved_href ? { resolved_href: href } : {}),
    ...(target ? { target } : {}),
    ...(rel ? { rel } : {}),
    ...(style ? { style } : {}),
  }
}

function isManualPayload(payload) {
  if (!payload) return false
  return payload.kind === 'url' || (!payload.kind && Boolean(payload.href) && !payload.id)
}

function destinationLabelFromPayload(payload) {
  if (!payload || isManualPayload(payload)) return ''
  return String(payload.title || payload.label || '').trim()
}

function copyAnchorAttributes(from, to) {
  ;['href', 'target', 'rel', 'data-kubik-nav', 'data-kubik-link-style'].forEach((name) => {
    const value = from.getAttribute(name)
    if (value) to.setAttribute(name, value)
    else to.removeAttribute(name)
  })
}

export function inlineLinkPanelInnerHtml({ filterOptions = [], existingPayload = null } = {}) {
  const { searchUrl } = navigableMeta()
  const payload = existingPayload || {}
  const hasPayload = Boolean(existingPayload) && Object.keys(existingPayload).length > 0
  const manual = hasPayload && isManualPayload(payload)
  const href = String(payload.href || payload.resolved_href || '')
  const queryLabel = destinationLabelFromPayload(payload)
  const filterSelected =
    payload.kind === 'item' ? 'navigation' : payload.resource_type || ''
  const systemHidden = manual ? ' kubik-navigable-link__system-control--hidden' : ''
  const manualHidden = manual ? '' : ' kubik-navigable-link__manual-url--hidden'
  const systemUrlHidden = manual ? ' kubik-navigable-link__system-url-row--hidden' : ''
  const hiddenValue = hasPayload ? JSON.stringify(payload) : '{}'

  return `<div class="kubik-navigable-link"
       data-controller="kubik-navigable-link"
       data-kubik-navigable-link-search-url-value="${escapeAttr(searchUrl)}"
       data-kubik-navigable-link-filter-options-value="${escapeAttr(JSON.stringify(filterOptions))}"
       data-kubik-navigable-link-editing-value="true">
    <div class="kubik-navigable-link__editor" data-kubik-navigable-link-target="editor">
      <div class="kubik-navigable-link__metadata kubik-wysiwyg-link-metadata">
        <div class="input select kubik-wysiwyg-link-metadata__style">
          <label class="label">Style</label>
          <select class="input" data-kubik-navigable-link-target="linkStyle" data-action="change->kubik-navigable-link#syncHidden">
            ${buildSelectOptions(styleOptionPairs(), payload.style || '')}
          </select>
        </div>
        <div class="input select kubik-wysiwyg-link-metadata__target">
          <label class="label">Target</label>
          <select class="input" data-kubik-navigable-link-target="linkTarget" data-action="change->kubik-navigable-link#syncHidden">
            ${buildSelectOptions(TARGET_OPTIONS, payload.target || '')}
          </select>
        </div>
        <div class="input select kubik-wysiwyg-link-metadata__rel">
          <label class="label">Rel</label>
          <select class="input" data-kubik-navigable-link-target="linkRel" data-action="change->kubik-navigable-link#syncHidden">
            ${buildSelectOptions(REL_OPTIONS, payload.rel || '')}
          </select>
        </div>
      </div>
      <div class="kubik-navigable-link__primary-row">
        <div class="input select kubik-navigable-link__mode">
          <label class="label">Link to</label>
          <select class="input" data-kubik-navigable-link-target="mode" data-action="change->kubik-navigable-link#modeChange">
            <option value="system"${manual ? '' : ' selected'}>System</option>
            <option value="manual"${manual ? ' selected' : ''}>URL</option>
          </select>
        </div>
        <div class="input kubik-navigable-link__query-wrap kubik-navigable-link__system-control${systemHidden}">
          <label class="label">Destination</label>
          <input type="text" class="input" placeholder="Search pages and navigation…" autocomplete="off"
                 value="${escapeAttr(queryLabel)}" ${manual ? 'disabled' : ''}
                 data-kubik-navigable-link-target="query"
                 data-action="focus->kubik-navigable-link#queryFocus input->kubik-navigable-link#queryInput keydown->kubik-navigable-link#queryKeydown click->kubik-navigable-link#queryFocus" />
          <div class="kubik-navigable-link__results" hidden data-kubik-navigable-link-target="resultsPanel"
               data-action="click->kubik-navigable-link#resultClick"></div>
        </div>
        <div class="input select kubik-navigable-link__filter kubik-navigable-link__system-control${systemHidden}">
          <label class="label">Filter</label>
          <select class="input" data-kubik-navigable-link-target="filter" data-action="change->kubik-navigable-link#filterChange" ${manual ? 'disabled' : ''}>
            ${buildFilterOptions(filterOptions, filterSelected)}
          </select>
        </div>
        <div class="input kubik-navigable-link__manual-url${manualHidden}" data-kubik-navigable-link-target="manualUrl">
          <label class="label">URL</label>
          <input type="text" class="input kubik-navigable-link__href" placeholder="https://example.com or /path"
                 value="${escapeAttr(manual ? href : '')}" ${manual ? '' : 'disabled'}
                 data-kubik-navigable-link-target="hrefManual"
                 data-action="input->kubik-navigable-link#hrefInput blur->kubik-navigable-link#manualHrefBlur" />
        </div>
      </div>
      <div class="kubik-navigable-link__system-url-row${systemUrlHidden}" data-kubik-navigable-link-target="systemUrlRow">
        <div class="input kubik-navigable-link__href-wrap">
          <label class="label">URL</label>
          <input type="text" class="input kubik-navigable-link__href kubik-navigable-link__href--locked" readonly tabindex="-1"
                 placeholder="Resolved from destination" value="${escapeAttr(manual ? '' : href)}"
                 data-kubik-navigable-link-target="hrefSystem" data-action="input->kubik-navigable-link#hrefInput" />
        </div>
        <div class="kubik-navigable-link__url-actions">
          <button type="button" class="kubik-navigable-link__icon-btn" title="Edit URL" aria-label="Edit URL"
                  data-kubik-navigable-link-target="urlEdit" data-action="kubik-navigable-link#startUrlEdit">
            <span class="material-symbols-outlined" aria-hidden="true">edit</span>
          </button>
          <button type="button" class="kubik-navigable-link__icon-btn" title="Cancel" aria-label="Cancel URL edit" hidden
                  data-kubik-navigable-link-target="urlCancel" data-action="kubik-navigable-link#cancelUrlEdit">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
          <button type="button" class="kubik-navigable-link__icon-btn kubik-navigable-link__icon-btn--approve" title="Approve" aria-label="Approve URL" hidden
                  data-kubik-navigable-link-target="urlApprove" data-action="kubik-navigable-link#approveUrlEdit">
            <span class="material-symbols-outlined" aria-hidden="true">check</span>
          </button>
        </div>
      </div>
      <input type="hidden" value="${escapeAttr(hiddenValue)}" data-kubik-navigable-link-target="value" />
    </div>
  </div>`
}

function detachPanelDismissListeners() {
  if (outsidePointerHandler) {
    document.removeEventListener('pointerdown', outsidePointerHandler, true)
    outsidePointerHandler = null
  }
  if (escapeKeyHandler) {
    document.removeEventListener('keydown', escapeKeyHandler, true)
    escapeKeyHandler = null
  }
}

function closeActivePanel() {
  detachPanelDismissListeners()
  if (!activePanel) return
  activePanel.remove()
  activePanel = null
}

function bindPanelDismissListeners(panel) {
  detachPanelDismissListeners()

  outsidePointerHandler = (event) => {
    if (!activePanel || activePanel !== panel) return
    const target = event.target
    if (target instanceof Node && (panel.contains(target) || target.closest?.('.ce-inline-toolbar'))) {
      return
    }
    closeActivePanel()
  }

  escapeKeyHandler = (event) => {
    if (event.key !== 'Escape') return
    if (!activePanel || activePanel !== panel) return
    event.preventDefault()
    closeActivePanel()
  }

  // Defer so the click that opened the panel does not immediately dismiss it.
  window.setTimeout(() => {
    if (activePanel !== panel) return
    document.addEventListener('pointerdown', outsidePointerHandler, true)
    document.addEventListener('keydown', escapeKeyHandler, true)
  }, 0)
}

function positionPanel(panel, anchorEl) {
  const rect = anchorEl?.getBoundingClientRect?.()
  const pad = 8
  let top = rect ? rect.bottom + pad : 96
  let left = rect ? rect.left : 96

  requestAnimationFrame(() => {
    const width = panel.offsetWidth
    const height = panel.offsetHeight
    if (left + width > window.innerWidth - pad) left = window.innerWidth - width - pad
    if (top + height > window.innerHeight - pad) {
      top = Math.max(pad, (rect?.top || height + pad) - height - pad)
    }
    if (left < pad) left = pad
    panel.style.top = `${top}px`
    panel.style.left = `${left}px`
  })
}

function buildAnchorFromPanel(panel, selectedText) {
  const navigable = kubikNavigableWysiwygEnabled()
  const linkRoot = panel.querySelector("[data-controller*='kubik-navigable-link']")
  let navPayload
  let href = '#'

  if (navigable && linkRoot) {
    const app = window.KubikInterfaceStimulus
    const controller = app?.getControllerForElementAndIdentifier(linkRoot, 'kubik-navigable-link')
    controller?.syncHidden()
    const raw = linkRoot.querySelector('[data-kubik-navigable-link-target="value"]')?.value
    if (raw) {
      navPayload = JSON.parse(raw)
      const manual = linkRoot.querySelector('[data-kubik-navigable-link-target="hrefManual"]')
      const system = linkRoot.querySelector('[data-kubik-navigable-link-target="hrefSystem"]')
      href =
        (manual && !manual.closest('.kubik-navigable-link__manual-url--hidden')
          ? manual.value
          : system?.value) ||
        navPayload.href ||
        navPayload.resolved_href ||
        '#'
    }
  } else {
    href = panel.querySelector('[data-kubik-link-href]')?.value?.trim() || '#'
  }

  const target = linkRoot?.querySelector('[data-kubik-navigable-link-target="linkTarget"]')?.value?.trim()
  const rel = linkRoot?.querySelector('[data-kubik-navigable-link-target="linkRel"]')?.value?.trim()
  const style = linkRoot?.querySelector('[data-kubik-navigable-link-target="linkStyle"]')?.value?.trim()
  if (navPayload && style) navPayload.style = style

  const anchor = document.createElement('a')
  anchor.setAttribute('href', href)
  if (navigable && navPayload) {
    anchor.setAttribute('data-kubik-nav', JSON.stringify(navPayload))
  }
  if (target) anchor.setAttribute('target', target)
  if (rel) anchor.setAttribute('rel', rel)
  if (style) anchor.setAttribute('data-kubik-link-style', style)
  const trimmed = String(selectedText || '').replace(/^\s+|\s+$/g, '')
  anchor.textContent = trimmed || href
  return anchor
}

function needsWordSpace(left, right) {
  return Boolean(left && right && /\S$/.test(left) && /^\S/.test(right))
}

function insertWordSpaceBefore(anchor) {
  const prev = anchor.previousSibling
  if (prev?.nodeType === Node.TEXT_NODE) {
    if (needsWordSpace(prev.textContent, anchor.textContent)) prev.textContent += ' '
    return
  }
  if (needsWordSpace(prev?.textContent, anchor.textContent)) {
    anchor.parentNode?.insertBefore(document.createTextNode(' '), anchor)
  }
}

function insertWordSpaceAfter(anchor) {
  const next = anchor.nextSibling
  if (next?.nodeType === Node.TEXT_NODE) {
    if (needsWordSpace(anchor.textContent, next.textContent)) next.textContent = ` ${next.textContent}`
    return
  }
  if (needsWordSpace(anchor.textContent, next?.textContent)) {
    anchor.parentNode?.insertBefore(document.createTextNode(' '), anchor.nextSibling)
  }
}

function insertAnchor(range, anchor, existingAnchor) {
  if (existingAnchor) {
    copyAnchorAttributes(anchor, existingAnchor)
    return existingAnchor
  }

  range.deleteContents()
  range.insertNode(anchor)
  if (!anchor.getAttribute('data-kubik-link-style')) {
    insertWordSpaceBefore(anchor)
    insertWordSpaceAfter(anchor)
  }
  return anchor
}

export function openInlineLinkPanel({ range, selectedText = '', anchorEl, existingAnchor = null, onApplied, onUnlinked } = {}) {
  closeActivePanel()

  const currentAnchor = existingAnchor || findAnchorFromRange(range)
  const existingPayload = payloadFromAnchor(currentAnchor)
  const navigable = kubikNavigableWysiwygEnabled()
  const { filterOptions } = navigableMeta()
  const panel = document.createElement('div')
  panel.className = 'kubik-wysiwyg-inline-link-panel'
  const inner = navigable
    ? inlineLinkPanelInnerHtml({ filterOptions, existingPayload })
    : `<label>URL <input type="text" data-kubik-link-href placeholder="https://example.com" value="${escapeAttr(currentAnchor?.getAttribute('href') || '')}" /></label>`

  const unlinkButton = currentAnchor
    ? `<button type="button" data-kubik-link-unlink>Unlink</button>`
    : ''

  panel.innerHTML = `<div class="kubik-wysiwyg-inline-link-panel__inner">${inner}
      <div class="kubik-wysiwyg-inline-link-panel__actions">
        ${unlinkButton}
        <button type="button" data-kubik-link-cancel>Cancel</button>
        <button type="button" data-kubik-link-apply>Apply</button>
      </div>
    </div>`

  document.body.appendChild(panel)
  activePanel = panel
  positionPanel(panel, anchorEl)
  bindPanelDismissListeners(panel)

  panel.querySelector('[data-kubik-link-cancel]')?.addEventListener('click', () => closeActivePanel())
  panel.querySelector('[data-kubik-link-unlink]')?.addEventListener('click', () => {
    unwrapAnchor(currentAnchor)
    onUnlinked?.(currentAnchor)
    closeActivePanel()
  })
  panel.querySelector('[data-kubik-link-apply]')?.addEventListener('click', () => {
    const built = buildAnchorFromPanel(panel, selectedText || range?.toString?.() || '')
    const applied = range ? insertAnchor(range, built, currentAnchor) : built
    onApplied?.(applied)
    closeActivePanel()
  })

  return panel
}

export function openRichTextLinkPanel(editor, toolbarButton) {
  editor.focus()
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0).cloneRange()
  if (!editor.contains(range.commonAncestorContainer)) return

  const existingAnchor = findAnchorFromRange(range)
  openInlineLinkPanel({
    range,
    selectedText: range.toString() || existingAnchor?.textContent || '',
    anchorEl: toolbarButton,
    existingAnchor,
    onApplied: () => {
      editor.dispatchEvent(new Event('input', { bubbles: true }))
    },
  })
}

export function unlinkSelectionInEditor(editor) {
  editor?.focus()
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  if (editor && !editor.contains(range.commonAncestorContainer)) return false

  const anchor = findAnchorFromRange(range)
  if (!anchor) return false

  unwrapAnchor(anchor)
  return true
}

export const INLINE_LINK_SANITIZE = {
  a: {
    href: true,
    target: true,
    rel: true,
    'data-kubik-nav': true,
    'data-kubik-link-style': true,
  },
}

function notifyEditorFromAnchor(anchor) {
  const editor = anchor?.closest?.('[contenteditable="true"]')
  editor?.dispatchEvent(new Event('input', { bubbles: true }))
}

export class KubikUnlinkTool {
  static get isInline() {
    return true
  }

  static get title() {
    return 'Unlink'
  }

  constructor({ api }) {
    this.api = api
    this.button = null
  }

  render() {
    this.button = document.createElement('button')
    this.button.type = 'button'
    this.button.classList.add(this.api.styles.inlineToolButton)
    this.button.innerHTML =
      '<span class="material-symbols-outlined" aria-hidden="true">link_off</span>'
    this.button.setAttribute('title', 'Unlink')
    this.button.setAttribute('aria-label', 'Unlink')
    return this.button
  }

  surround(range) {
    const anchor = findAnchorFromRange(range)
    if (!anchor) return
    unwrapAnchor(anchor)
  }

  checkState() {
    const selection = window.getSelection()
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null
    const inLink = Boolean(findAnchorFromRange(range))
    this.button?.classList.toggle(this.api.styles.inlineToolButtonActive, inLink)
    return inLink
  }
}

export function patchKubikLinkTool() {
  const Tool = Wysiwyg.KubikLinkTool
  if (!Tool || Tool.__readingSchoolsInlineLinkPatched) return Tool

  Object.defineProperty(Tool, 'sanitize', {
    configurable: true,
    get() {
      return INLINE_LINK_SANITIZE
    },
  })

  const proto = Tool.prototype

  proto.render = function renderWithLink2Icon() {
    this.button = document.createElement('button')
    this.button.type = 'button'
    this.button.classList.add(this.api.styles.inlineToolButton)
    this.button.innerHTML =
      '<span class="material-symbols-outlined" aria-hidden="true">link_2</span>'
    this.button.setAttribute('title', 'Link')
    this.button.setAttribute('aria-label', 'Link')
    return this.button
  }

  proto.surround = function surroundExistingOrNewLink(range) {
    const existingAnchor = findAnchorFromRange(range)
    const selectedText = range?.toString?.() || existingAnchor?.textContent || ''
    this.openPanel(range, selectedText, existingAnchor)
  }

  proto.openPanel = function openHostInlineLinkPanel(range, selectedText, existingAnchor) {
    this.closePanel()
    this.activeRange = range
    this.panel = openInlineLinkPanel({
      range,
      selectedText,
      anchorEl: this.button,
      existingAnchor,
      onApplied: (anchor) => {
        this.panel = null
        notifyEditorFromAnchor(anchor)
      },
      onUnlinked: (anchor) => {
        this.panel = null
        notifyEditorFromAnchor(anchor)
      },
    })
  }

  proto.closePanel = function closeHostInlineLinkPanel() {
    closeActivePanel()
    this.panel = null
  }

  proto.checkState = function checkStateForExistingLink() {
    const selection = window.getSelection()
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null
    const inLink = Boolean(findAnchorFromRange(range))
    this.button?.classList.toggle(this.api.styles.inlineToolButtonActive, inLink)
    return inLink
  }

  Tool.__readingSchoolsInlineLinkPatched = true
  return Tool
}

function parseRepeaterFieldName(name) {
  const match = name?.match(REPEATER_FIELD_NAME)
  if (!match) return null
  return { tab: match[1], index: Number(match[2]), field: match[3] }
}

function applyRepeaterFieldValue(dataValue, fieldName, value) {
  const parsed = parseRepeaterFieldName(fieldName)
  if (!parsed) return null
  const tabData = { ...(dataValue[parsed.tab] || {}) }
  const items = [...(tabData.repeated_items || [])]
  items[parsed.index] = { ...(items[parsed.index] || {}), [parsed.field]: value }
  tabData.repeated_items = items
  return { ...dataValue, [parsed.tab]: tabData }
}

function writeWysiwygHtml(controller, fieldName, html) {
  const repeaterData = applyRepeaterFieldValue(controller.dataValue, fieldName, html)
  if (repeaterData) {
    controller.dataValue = repeaterData
    return true
  }
  return false
}

export function flushNestedWysiwygFields(controller) {
  if (!controller?.element) return
  controller.element.querySelectorAll('.input.input-wysiwyg[contenteditable="true"]').forEach((editor) => {
    const name = editor.dataset.fieldName
    if (!name) return
    writeWysiwygHtml(controller, name, editor.innerHTML)
  })
}

export function patchWysiwygFieldPersistence() {
  const Controller = Wysiwyg.KubikWidgetController
  if (!Controller || Controller.__readingSchoolsWysiwygPersistPatched) return

  const previousUpdate = Controller.prototype.updateWysiwygField
  const previousGetNewWidget = Controller.prototype.getNewWidget
  const previousPaste = Controller.prototype.handlePaste

  Controller.prototype.updateWysiwygField = function updateWysiwygFieldWithRepeater(event) {
    const name = event.currentTarget.dataset.fieldName
    const html = event.currentTarget.innerHTML
    if (writeWysiwygHtml(this, name, html)) return
    return previousUpdate.call(this, event)
  }

  Controller.prototype.getNewWidget = function getNewWidgetAfterWysiwygFlush() {
    flushNestedWysiwygFields(this)
    return previousGetNewWidget.call(this)
  }

  Controller.prototype.handlePaste = function handlePasteAllowWysiwygHtml(event) {
    const active = document.activeElement
    if (active?.classList?.contains('input-wysiwyg') || active?.closest?.('.input.input-wysiwyg')) {
      return
    }
    return previousPaste.call(this, event)
  }

  Controller.__readingSchoolsWysiwygPersistPatched = true

  const PluginFactory = Wysiwyg.PluginFactory
  if (PluginFactory && !PluginFactory.__readingSchoolsWysiwygSavePatched) {
    const previousSave = PluginFactory.prototype.save
    PluginFactory.prototype.save = function saveWithNestedWysiwyg(blockContent) {
      const app = window.KubikInterfaceStimulus
      const controller = app?.getControllerForElementAndIdentifier?.(blockContent, 'kubik-widget')
      if (controller) flushNestedWysiwygFields(controller)
      return previousSave.call(this, blockContent)
    }
    PluginFactory.__readingSchoolsWysiwygSavePatched = true
  }
}

export default function applyInlineLinkAdminEnhancements() {
  patchKubikLinkTool()
  patchWysiwygFieldPersistence()
}
