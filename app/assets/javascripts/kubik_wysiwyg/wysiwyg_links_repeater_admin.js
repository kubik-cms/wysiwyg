import Wysiwyg from '@kubik-cms/wysiwyg'

const LINKS_REPEATER_SELECTOR = '.kubik-wysiwyg-links-repeater--expandable'
const LINKS_CONTAINER_SELECTOR = `${LINKS_REPEATER_SELECTOR} > .kubik-wysiwyg-tabs-container`
const DRAG_HANDLE_SELECTOR =
  '.kubik-wysiwyg-repeated-item-header .kubik-wysiwyg-component--items-action--more'
const DROP_PLACEHOLDER_CLASS = 'kubik-wysiwyg-repeated-item-drop-placeholder'
const ROW_SELECTOR = `${LINKS_REPEATER_SELECTOR} .kubik-wysiwyg-repeated-item[data-kubik-links-repeater-field-value]`

function stimulusApplication() {
  return window.KubikInterfaceStimulus
}

function widgetController(frame) {
  const app = stimulusApplication()
  if (!app || !frame?.hasAttribute?.('data-controller')) return null
  return app.getControllerForElementAndIdentifier(frame, 'kubik-widget')
}

function linksRepeaterContainer(frame) {
  return frame.querySelector(LINKS_CONTAINER_SELECTOR)
}

function linksRepeaterContainerForHandle(handle) {
  const repeater = handle.closest(LINKS_REPEATER_SELECTOR)
  return repeater?.querySelector(':scope > .kubik-wysiwyg-tabs-container') || null
}

function setLinksAtPath(dataValue, tab, field, links) {
  return {
    ...dataValue,
    [tab]: {
      ...(dataValue[tab] || {}),
      [field]: links,
    },
  }
}

function linksRepeaterMaxItems(setup, tab, fieldName) {
  const tabs = setup?.config?.tabs || []
  const tabConfig = tabs.find((entry) => entry.name === tab)
  const fieldConfig = tabConfig?.fields?.find((entry) => entry.name === fieldName)
  const raw = fieldConfig?.max_items ?? fieldConfig?.maxItems ?? 0
  const limit = Number(raw)
  return Number.isFinite(limit) && limit > 0 ? limit : null
}

function navLinkPresent(nav) {
  if (nav == null || nav === '') return false
  if (typeof nav === 'string') return nav.trim() !== '' && nav.trim() !== '{}'
  if (typeof nav !== 'object') return false
  return ['text', 'href', 'url', 'kind', 'id'].some((key) => String(nav[key] || '').trim() !== '')
}

function isOccupiedLinkRow(row) {
  if (!row || typeof row !== 'object') return false
  if (row._ui?.expanded === true) return true
  return (
    String(row.text || '').trim() !== '' ||
    String(row.url || '').trim() !== '' ||
    String(row.rel || '').trim() !== '' ||
    navLinkPresent(row.nav_link)
  )
}

function compactLinkRowsForLimit(links, limit) {
  const occupied = (Array.isArray(links) ? links : []).filter(isOccupiedLinkRow)
  if (limit && occupied.length > limit) return occupied.slice(0, limit)
  return occupied
}

function syncLinksRepeaterExpandedFromDom(dataValue, root) {
  if (!root) return dataValue

  let next = dataValue
  root.querySelectorAll(ROW_SELECTOR).forEach((element) => {
    const tab = element.dataset.kubikRepeaterTabValue
    const field = element.dataset.kubikLinksRepeaterFieldValue
    const index = Number(element.dataset.kubikRepeaterIndexValue)
    if (!tab || !field || Number.isNaN(index)) return

    const expanded = element.classList.contains('kubik-widget-expanded')
    const tabData = { ...(next[tab] || {}) }
    const links = [...(tabData[field] || [])]
    if (!links[index]) return

    links[index] = {
      ...links[index],
      _ui: { ...(links[index]._ui || {}), expanded },
    }
    next = setLinksAtPath(next, tab, field, links)
  })

  return next
}

function patchLinksRepeaterWidgetController() {
  const Controller = Wysiwyg.KubikWidgetController
  if (!Controller || Controller.__readingSchoolsLinksRepeaterPatched) return

  const previousGetNewWidget = Controller.prototype.getNewWidget
  Controller.prototype.getNewWidget = function getNewWidgetWithLinksRepeaterSync() {
    this.dataValue = syncLinksRepeaterExpandedFromDom(this.dataValue, this.element)
    return previousGetNewWidget.call(this)
  }

  Controller.prototype.setLinksRowExpanded = function setLinksRowExpanded(tab, field, index, expanded) {
    const tabData = { ...(this.dataValue[tab] || {}) }
    const links = [...(tabData[field] || [])]
    if (!links[index]) return

    links[index] = {
      ...links[index],
      _ui: { ...(links[index]._ui || {}), expanded },
    }
    this.dataValue = setLinksAtPath(this.dataValue, tab, field, links)
  }

  Controller.prototype.linksRepeaterToggle = function linksRepeaterToggle(event) {
    const { tab, index, expanded } = event.detail
    const field = event.currentTarget.dataset.kubikLinksRepeaterFieldValue
    if (!field || tab == null || index == null) return
    this.setLinksRowExpanded(tab, field, index, expanded)
  }

  Controller.prototype.saveLinksRow = function saveLinksRow(event) {
    const tab = event.params.tab
    const field = event.params.field
    const index = Number(event.params.index)
    if (!tab || !field || Number.isNaN(index)) return

    this.setLinksRowExpanded(tab, field, index, false)
    this.getNewWidget()
  }

  Controller.prototype.appendLinksRow = function appendLinksRow(event) {
    const tab = event.params.tab
    const field = event.params.field
    const limit = linksRepeaterMaxItems(this.setupValue, tab, field)
    const links = compactLinkRowsForLimit(this.dataValue?.[tab]?.[field] || [], limit)
    if (limit && links.length >= limit) return

    links.push({ _ui: { expanded: true } })
    this.dataValue = setLinksAtPath(this.dataValue, tab, field, links)
    this.getNewWidget()
  }

  Controller.__readingSchoolsLinksRepeaterPatched = true
}

function linksRowSummaryText(row, placeholderIndex) {
  const textInput = row.querySelector('input[name$=".text"]')
  const styleSelect = row.querySelector('select[name$=".style"]')
  const fallback = `Link ${placeholderIndex}`
  const text = textInput?.value?.trim() || fallback
  const styleLabel =
    styleSelect?.selectedOptions?.[0]?.text?.trim() ||
    styleSelect?.options?.[styleSelect.selectedIndex]?.text?.trim() ||
    'Default'

  return `${text} (${styleLabel})`
}

function syncLinksRepeaterRowHeader(row) {
  const header = row.querySelector('[data-kubik-repeater-target="header"]')
  if (!header) return

  const placeholderIndex = header.dataset.headerPlaceholder || '1'
  const text = linksRowSummaryText(row, placeholderIndex)
  const summaryText = header.querySelector('[data-kubik-link-summary-text]')
  if (summaryText) {
    summaryText.textContent = text
  } else {
    header.textContent = text
  }
}

function bindLinksRepeaterHeaderSync(frame) {
  frame.querySelectorAll(ROW_SELECTOR).forEach((row) => {
    if (row.dataset.linksRepeaterHeaderBound === 'true') return
    row.dataset.linksRepeaterHeaderBound = 'true'

    syncLinksRepeaterRowHeader(row)

    row.querySelectorAll('input[name$=".text"], select[name$=".style"]').forEach((field) => {
      field.addEventListener('input', () => syncLinksRepeaterRowHeader(row))
      field.addEventListener('change', () => syncLinksRepeaterRowHeader(row))
    })
  })
}

function enhanceDragHandles(frame) {
  frame.querySelectorAll(DRAG_HANDLE_SELECTOR).forEach((more) => {
    if (!more.closest(LINKS_REPEATER_SELECTOR)) return

    more.classList.add('kubik-wysiwyg-repeater-drag-handle')
    more.setAttribute('title', 'Drag to reorder')
    more.removeAttribute('tabindex')
    const icon = more.querySelector('.material-symbols-outlined')
    if (icon) {
      icon.textContent = 'drag_indicator'
    }
    more.querySelector('.kubik-wysiwyg-component--items-more-actions')?.remove()
  })
}

function watchLinksRepeaterFrame(frame) {
  if (frame._linksRepeaterMutationObserver) return

  let scheduled = false
  const scheduleEnhance = () => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      enhanceDragHandles(frame)
      bindLinksRepeaterHeaderSync(frame)
    })
  }

  frame._linksRepeaterMutationObserver = new MutationObserver(scheduleEnhance)
  frame._linksRepeaterMutationObserver.observe(frame, { childList: true, subtree: true })
}

function createDropPlaceholder(row) {
  const placeholder = document.createElement('div')
  placeholder.className = DROP_PLACEHOLDER_CLASS
  placeholder.setAttribute('aria-hidden', 'true')
  const header = row.querySelector('.kubik-wysiwyg-repeated-item-header')
  const slotHeight = header ? header.offsetHeight : row.offsetHeight
  placeholder.style.minHeight = `${Math.max(slotHeight, 40)}px`
  return placeholder
}

function dropInsertReference(container, over, placeholder, insertBefore) {
  let ref = insertBefore ? over : over.nextSibling
  while (ref && ref === placeholder) {
    ref = ref.nextSibling
  }
  return ref
}

function movePlaceholder(dragging, over, insertBefore) {
  const { container, placeholder } = dragging
  const ref = dropInsertReference(container, over, placeholder, insertBefore)
  if (!ref) {
    container.appendChild(placeholder)
    return
  }
  container.insertBefore(placeholder, ref)
}

function sanitizeDragGhost(ghost) {
  ghost.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'))
  ghost.querySelectorAll('[data-controller]').forEach((element) => element.removeAttribute('data-controller'))
  ghost.querySelectorAll('[data-action]').forEach((element) => element.removeAttribute('data-action'))
  ghost.querySelectorAll('.kubik-repeater-expand-action').forEach((icon) => {
    icon.closest('.kubik-wysiwyg-component--items-action')?.remove()
  })
}

function createDragGhost(row) {
  const ghost = row.cloneNode(true)
  ghost.classList.add('kubik-wysiwyg-repeated-item-drag-ghost')
  ghost.classList.remove('kubik-widget-expanded')
  ghost.setAttribute('aria-hidden', 'true')
  sanitizeDragGhost(ghost)
  return ghost
}

function mountDragGhost(ghost, frame, event, rowRect) {
  ghost.style.width = `${rowRect.width}px`
  ghost.style.maxWidth = `${rowRect.width}px`
  ghost.style.boxSizing = 'border-box'
  ghost.style.position = 'fixed'
  ghost.style.margin = '0'
  ghost.style.zIndex = '100000'
  ghost.style.pointerEvents = 'none'
  frame.classList.add('kubik-wysiwyg-component--drag-active')
  document.body.appendChild(ghost)
  const offsets = {
    offsetX: event.clientX - rowRect.left,
    offsetY: event.clientY - rowRect.top,
  }
  moveDragGhost(ghost, event, offsets)
  return offsets
}

function moveDragGhost(ghost, event, offsets) {
  ghost.style.left = `${event.clientX - offsets.offsetX}px`
  ghost.style.top = `${event.clientY - offsets.offsetY}px`
}

function removeDragGhost(ghost, frame) {
  frame?.classList.remove('kubik-wysiwyg-component--drag-active')
  ghost?.remove()
}

function dropTargetRow(container, event) {
  const target = document.elementFromPoint(event.clientX, event.clientY)
  let over = target?.closest('.kubik-wysiwyg-repeated-item')
  if (!over && target?.closest(`.${DROP_PLACEHOLDER_CLASS}`)) {
    const placeholder = target.closest(`.${DROP_PLACEHOLDER_CLASS}`)
    const prev = placeholder.previousElementSibling
    const next = placeholder.nextElementSibling
    if (prev?.classList.contains('kubik-wysiwyg-repeated-item')) {
      over = prev
    } else if (next?.classList.contains('kubik-wysiwyg-repeated-item')) {
      over = next
    }
  }
  if (!over || !container.contains(over)) return null
  return over
}

function finishDragPlacement(row, container, placeholder) {
  container.insertBefore(row, placeholder)
  placeholder.remove()
}

function moveLinksRepeaterItem(controller, tab, field, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return
  const tabData = controller.dataValue[tab] || {}
  const links = [...(tabData[field] || [])]
  if (fromIndex >= links.length || toIndex >= links.length) return

  const [moved] = links.splice(fromIndex, 1)
  links.splice(toIndex, 0, moved)
  controller.dataValue = setLinksAtPath(controller.dataValue, tab, field, links)
  controller.getNewWidget()
}

function installLinksDragReorder(frame) {
  if (frame.dataset.linksRepeaterReorderBound === 'true') return
  frame.dataset.linksRepeaterReorderBound = 'true'

  let dragging = null

  const endDrag = (event) => {
    if (!dragging) return
    if (event.type === 'pointerup' && event.pointerId !== dragging.pointerId) return

    document.removeEventListener('pointermove', onPointerMove, true)
    document.removeEventListener('pointerup', endDrag, true)
    document.removeEventListener('pointercancel', endDrag, true)

    const { row, ghost, container, fromIndex, placeholder, tab, field } = dragging
    removeDragGhost(ghost, frame)
    finishDragPlacement(row, container, placeholder)
    dragging = null

    const controller = widgetController(frame)
    if (!controller) return

    const rows = [...container.querySelectorAll(':scope > .kubik-wysiwyg-repeated-item')]
    const toIndex = rows.indexOf(row)
    moveLinksRepeaterItem(controller, tab, field, fromIndex, toIndex)
  }

  const onPointerMove = (event) => {
    if (!dragging || event.pointerId !== dragging.pointerId) return
    moveDragGhost(dragging.ghost, event, dragging)
    const over = dropTargetRow(dragging.container, event)
    if (!over) return
    const rect = over.getBoundingClientRect()
    const insertBefore = event.clientY < rect.top + rect.height / 2
    movePlaceholder(dragging, over, insertBefore)
  }

  frame.addEventListener(
    'pointerdown',
    (event) => {
      const handle = event.target.closest(DRAG_HANDLE_SELECTOR)
      if (!handle || !frame.contains(handle)) return
      if (!handle.closest(LINKS_REPEATER_SELECTOR)) return

      const container = linksRepeaterContainerForHandle(handle)
      const row = handle.closest(`${LINKS_REPEATER_SELECTOR} > .kubik-wysiwyg-tabs-container > .kubik-wysiwyg-repeated-item`)
      const rowCount = container
        ? container.querySelectorAll(':scope > .kubik-wysiwyg-repeated-item').length
        : 0
      if (!container || rowCount < 2 || !row || !container.contains(row)) return

      const tab = row.dataset.kubikRepeaterTabValue
      const field = row.dataset.kubikLinksRepeaterFieldValue
      const fromIndex = Number(row.dataset.kubikRepeaterIndexValue)
      if (!tab || !field || Number.isNaN(fromIndex)) return

      const rowRect = row.getBoundingClientRect()
      event.preventDefault()
      event.stopImmediatePropagation()

      const placeholder = createDropPlaceholder(row)
      container.insertBefore(placeholder, row)
      container.removeChild(row)
      const ghost = createDragGhost(row)
      const offsets = mountDragGhost(ghost, frame, event, rowRect)
      dragging = {
        row,
        ghost,
        container,
        fromIndex,
        placeholder,
        tab,
        field,
        pointerId: event.pointerId,
        ...offsets,
      }
      document.addEventListener('pointermove', onPointerMove, true)
      document.addEventListener('pointerup', endDrag, true)
      document.addEventListener('pointercancel', endDrag, true)
    },
    true,
  )
}

function enhanceLinksRepeaterFrame(frame) {
  if (!linksRepeaterContainer(frame)) return
  enhanceDragHandles(frame)
  bindLinksRepeaterHeaderSync(frame)
  installLinksDragReorder(frame)
  watchLinksRepeaterFrame(frame)
}

function scanLinksRepeaterFrames(scope = document) {
  scope.querySelectorAll('turbo-frame.kubik-wysiwyg-component').forEach((frame) => {
    if (!frame.querySelector(LINKS_REPEATER_SELECTOR)) return
    enhanceLinksRepeaterFrame(frame)
  })
}

function patchLinksRepeaterConnect() {
  const Controller = Wysiwyg.KubikWidgetController
  if (!Controller || Controller.__readingSchoolsLinksRepeaterConnectPatched) return

  const previousConnect = Controller.prototype.connect
  Controller.prototype.connect = function connectLinksRepeaterEnhancements() {
    previousConnect.call(this)
    requestAnimationFrame(() => enhanceLinksRepeaterFrame(this.element))
  }
  Controller.__readingSchoolsLinksRepeaterConnectPatched = true
}

function patchLinksRepeaterStreamRebind() {
  if (document.__readingSchoolsLinksRepeaterStreamPatched) return
  document.__readingSchoolsLinksRepeaterStreamPatched = true

  document.addEventListener(
    'turbo:before-stream-render',
    (event) => {
      const { render } = event.detail
      if (typeof render !== 'function') return
      event.detail.render = (streamElement) => {
        render(streamElement)
        requestAnimationFrame(() => scanLinksRepeaterFrames())
      }
    },
    { capture: true },
  )
}

export default function applyLinksRepeaterAdminEnhancements() {
  patchLinksRepeaterWidgetController()
  patchLinksRepeaterConnect()
  patchLinksRepeaterStreamRebind()
  scanLinksRepeaterFrames()
  document.addEventListener('turbo:frame-load', (event) => {
    if (event.target instanceof Element) scanLinksRepeaterFrames(event.target)
  })
  document.addEventListener('turbo:load', () => scanLinksRepeaterFrames())
}
