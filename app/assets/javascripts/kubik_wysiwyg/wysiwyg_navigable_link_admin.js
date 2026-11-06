import Wysiwyg from '@kubik-cms/wysiwyg'

const EXPANDABLE_NAVIGABLE_SELECTOR = '.kubik-navigable-input--expandable'
const EXPANDABLE_NAVIGABLE_ITEM_SELECTOR = `${EXPANDABLE_NAVIGABLE_SELECTOR} .kubik-navigable-input__item`
const EXPANDABLE_LINKS_REPEATER_SELECTOR = '.kubik-wysiwyg-links-repeater--expandable'
const COLLAPSIBLE_SUMMARY_SELECTOR = '.kubik-navigable-link__summary--collapsible'
const DRAG_HANDLE_SELECTOR =
  '.kubik-wysiwyg-repeated-item-header .kubik-wysiwyg-component--items-action--more'

function usesRepeaterStyleChrome(element) {
  return Boolean(
    element?.closest(`${EXPANDABLE_NAVIGABLE_SELECTOR}, ${EXPANDABLE_LINKS_REPEATER_SELECTOR}`),
  )
}

function usesCollapsibleSummary(element) {
  return Boolean(element?.querySelector(COLLAPSIBLE_SUMMARY_SELECTOR))
}

export function patchKubikNavigableLinkController(KubikNavigableLinkController) {
  if (!KubikNavigableLinkController || KubikNavigableLinkController.__kubikWysiwygRepeaterChromePatched) {
    return KubikNavigableLinkController
  }

  const proto = KubikNavigableLinkController.prototype
  const previousConnect = proto.connect
  const previousCommitEditor = proto.commitEditor
  const previousEditLink = proto.editLink

  proto.updateCollapsibleSummaryChrome = function updateCollapsibleSummaryChrome() {
    if (!usesCollapsibleSummary(this.element)) return false

    const expanded = Boolean(this.editingValue)
    this.element.classList.toggle('kubik-navigable-link--expanded', expanded)

    const toggle = this.element.querySelector('.kubik-navigable-link__toggle')
    if (toggle) toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false')

    if (this.hasSummaryTarget) this.summaryTarget.hidden = false
    if (this.hasEditorTarget) this.editorTarget.hidden = !expanded
    if (!expanded && this.hasSummaryTextTarget) {
      this.summaryTextTarget.textContent = this.buildSummaryText()
    }
    return true
  }

  proto.toggleEditor = function toggleEditor(event) {
    event?.preventDefault?.()
    if (!usesCollapsibleSummary(this.element)) {
      previousEditLink.call(this)
      return
    }

    this.editingValue = !this.editingValue
    this.updateCollapsibleSummaryChrome()

    if (this.editingValue && !this.isManualMode() && this.hasQueryTarget && this.queryTarget.value === '') {
      this.fetchResults('', { recent: true })
    }
  }

  proto.editLink = function editLinkWithCollapsibleSummary(event) {
    if (usesCollapsibleSummary(this.element)) {
      this.toggleEditor(event)
      return
    }
    previousEditLink.call(this)
  }

  proto.hydrateDestinationQuery = function hydrateDestinationQuery() {
    if (this.isManualMode() || !this.hasQueryTarget) return

    const existing = this.queryTarget.value.trim()
    if (existing) {
      this.selectedLabelValue = existing
      return
    }

    const cur = this.currentValue
    const label = String(cur?.title || cur?.label || '').trim()
    if (!label) return

    this.queryTarget.value = label
    this.selectedLabelValue = label
  }

  proto.connect = function connectWithRepeaterChrome() {
    previousConnect.call(this)
    this.hydrateDestinationQuery()
    if (this.updateCollapsibleSummaryChrome()) return
    if (!usesRepeaterStyleChrome(this.element)) return
    this.editingValue = true
    this.showEditor()
  }

  proto.commitEditor = function commitEditorWithoutSummary() {
    this.syncHidden()
    if (this.element?.closest?.('.kubik-wysiwyg-inline-link-panel')) {
      this.editingValue = true
      this.showEditor()
      return
    }
    if (usesCollapsibleSummary(this.element)) {
      this.editingValue = false
      this.updateCollapsibleSummaryChrome()
      return
    }
    if (usesRepeaterStyleChrome(this.element)) {
      this.editingValue = true
      this.showEditor()
      return
    }
    previousCommitEditor.call(this)
  }

  KubikNavigableLinkController.__kubikWysiwygRepeaterChromePatched = true
  return KubikNavigableLinkController
}

function setNavLinkUiExpanded(dataValue, tab, field, expanded) {
  const tabData = { ...(dataValue[tab] || {}) }
  const ui = { ...(tabData._ui || {}) }
  const fieldUi = { ...(ui[field] || {}), expanded }
  ui[field] = fieldUi
  tabData._ui = ui
  return { ...dataValue, [tab]: tabData }
}

export class KubikExpandableWidgetController extends Wysiwyg.KubikWidgetController {
  navigableLinkToggle(event) {
    const { tab, expanded } = event.detail
    const field = event.currentTarget.dataset.kubikNavigableLinkFieldValue
    if (!tab || !field) return
    this.dataValue = setNavLinkUiExpanded(this.dataValue, tab, field, expanded)
  }

  appendNavigableLink(event) {
    const tab = event.params.tab
    const field = event.params.field
    if (!tab || !field) return
    this.dataValue = setNavLinkUiExpanded(this.dataValue, tab, field, true)
    this.getNewWidget()
  }

  clearNavigableLink(event) {
    const tab = event.params.tab
    const field = event.params.field
    if (!tab || !field) return

    const tabData = { ...(this.dataValue[tab] || {}) }
    tabData[field] = {}
    this.dataValue = setNavLinkUiExpanded({ ...this.dataValue, [tab]: tabData }, tab, field, false)
    this.getNewWidget()
  }
}

export function patchNavigableLinkWidgetController() {
  const Controller = Wysiwyg.KubikWidgetController
  if (!Controller || Controller.__kubikWysiwygNavigableLinkPatched) return

  Controller.prototype.navigableLinkToggle = KubikExpandableWidgetController.prototype.navigableLinkToggle
  Controller.prototype.appendNavigableLink = KubikExpandableWidgetController.prototype.appendNavigableLink
  Controller.prototype.clearNavigableLink = KubikExpandableWidgetController.prototype.clearNavigableLink

  Controller.__kubikWysiwygNavigableLinkPatched = true
}

function navigableLinkHeaderSummary(element) {
  const placeholder = element.querySelector('[data-header-placeholder]')?.dataset.headerPlaceholder || '1'
  const textInput = element.querySelector('[data-kubik-navigable-link-target="text"]')
  const styleSelect = element.querySelector('[data-kubik-navigable-link-target="linkStyle"]')
  const fallback = `Link ${placeholder}`
  const text = textInput?.value?.trim() || fallback
  const styleLabel =
    styleSelect?.selectedOptions?.[0]?.text?.trim() ||
    styleSelect?.options?.[styleSelect.selectedIndex]?.text?.trim() ||
    'Default'

  return `${text} (${styleLabel})`
}

function syncNavigableLinkHeader(item) {
  const header = item.querySelector('[data-kubik-repeater-target="header"]')
  if (!header) return
  const summaryText = header.querySelector('[data-kubik-link-summary-text]')
  const text = navigableLinkHeaderSummary(item)
  if (summaryText) {
    summaryText.textContent = text
  } else {
    header.textContent = text
  }
}

function bindNavigableLinkHeaderSync(item) {
  if (item.dataset.navigableLinkHeaderBound === 'true') return
  item.dataset.navigableLinkHeaderBound = 'true'

  syncNavigableLinkHeader(item)

  item
    .querySelectorAll('[data-kubik-navigable-link-target="text"], [data-kubik-navigable-link-target="linkStyle"]')
    .forEach((field) => {
      field.addEventListener('input', () => syncNavigableLinkHeader(item))
      field.addEventListener('change', () => syncNavigableLinkHeader(item))
    })
}

function enhanceStandaloneNavigableDragHandle(frame) {
  frame.querySelectorAll(`${EXPANDABLE_NAVIGABLE_SELECTOR} ${DRAG_HANDLE_SELECTOR}`).forEach((more) => {
    more.classList.add('kubik-wysiwyg-repeater-drag-handle')
    more.setAttribute('title', 'Drag to reorder')
    more.removeAttribute('tabindex')
    const icon = more.querySelector('.material-symbols-outlined')
    if (icon) icon.textContent = 'drag_indicator'
    more.querySelector('.kubik-wysiwyg-component--items-more-actions')?.remove()
  })
}

function enhanceNavigableLinkFrame(frame) {
  if (!frame.querySelector(EXPANDABLE_NAVIGABLE_SELECTOR)) return
  frame.querySelectorAll(EXPANDABLE_NAVIGABLE_ITEM_SELECTOR).forEach(bindNavigableLinkHeaderSync)
  enhanceStandaloneNavigableDragHandle(frame)
}

function scanNavigableLinkFrames(scope = document) {
  scope.querySelectorAll('turbo-frame.kubik-wysiwyg-component').forEach((frame) => {
    enhanceNavigableLinkFrame(frame)
  })
}

function patchNavigableLinkConnect() {
  const Controller = Wysiwyg.KubikWidgetController
  if (!Controller || Controller.__kubikWysiwygNavigableLinkConnectPatched) return

  const previousConnect = Controller.prototype.connect
  Controller.prototype.connect = function connectNavigableLinkEnhancements() {
    previousConnect.call(this)
    requestAnimationFrame(() => enhanceNavigableLinkFrame(this.element))
  }
  Controller.__kubikWysiwygNavigableLinkConnectPatched = true
}

export default function applyNavigableLinkAdminEnhancements() {
  patchNavigableLinkWidgetController()
  patchNavigableLinkConnect()
  scanNavigableLinkFrames()
  document.addEventListener('turbo:frame-load', (event) => {
    if (event.target instanceof Element) scanNavigableLinkFrames(event.target)
  })
  document.addEventListener('turbo:load', () => scanNavigableLinkFrames())
}
