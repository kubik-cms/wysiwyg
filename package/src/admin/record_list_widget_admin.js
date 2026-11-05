import KubikWidgetController from '../controllers/kubik_widget_controller'
import KubikAutocompleteController from '../controllers/kubik_autocomplete_controller'

const RECORD_LIST_FRAME_SELECTOR =
  'turbo-frame.kubik-wysiwyg-component.kubik-wysiwyg-record-list'
const ITEMS_TAB = 'items'

function stimulusApplication() {
  return window.KubikInterfaceStimulus
}

function recordListFrames(scope = document) {
  return scope.querySelectorAll(RECORD_LIST_FRAME_SELECTOR)
}

function widgetController(frame) {
  const app = stimulusApplication()
  if (!app || !frame?.hasAttribute?.('data-controller')) return null
  return app.getControllerForElementAndIdentifier(frame, 'kubik-widget')
}

function itemsRepeaterContainer(frame) {
  const panel = frame.querySelector(`[class*="-tabs-${ITEMS_TAB}"]`)
  if (!panel) return null

  return panel.querySelector('.kubik-wysiwyg-tabs-container:has(> .kubik-wysiwyg-repeated-item)')
}

const DRAG_HANDLE_SELECTOR =
  '.kubik-wysiwyg-repeated-item-header .kubik-wysiwyg-component--items-action--more'

function enhanceDragHandles(frame) {
  frame.querySelectorAll(DRAG_HANDLE_SELECTOR).forEach((more) => {
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

function watchRecordListFrame(frame) {
  if (frame._recordListMutationObserver) return

  let scheduled = false
  const scheduleEnhance = () => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      enhanceDragHandles(frame)
    })
  }

  frame._recordListMutationObserver = new MutationObserver(scheduleEnhance)
  frame._recordListMutationObserver.observe(frame, { childList: true, subtree: true })
}

const DROP_PLACEHOLDER_CLASS = 'kubik-wysiwyg-repeated-item-drop-placeholder'

function createDropPlaceholder(row) {
  const placeholder = document.createElement('div')
  placeholder.className = DROP_PLACEHOLDER_CLASS
  placeholder.setAttribute('aria-hidden', 'true')
  const rowHeight = row.offsetHeight
  const header = row.querySelector('.kubik-wysiwyg-repeated-item-header')
  const slotHeight = header ? header.offsetHeight : rowHeight
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

function mountDragGhost(ghost, row, frame, event, rowRect) {
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

  if (!over || !container.contains(over)) {
    return null
  }

  return over
}

function finishDragPlacement(row, container, placeholder) {
  container.insertBefore(row, placeholder)
  placeholder.remove()
}

function moveRepeaterItem(controller, tab, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return

  const tabData = controller.dataValue[tab] || {}
  const items = [...(tabData.repeated_items || [])]
  if (fromIndex >= items.length || toIndex >= items.length) return

  const [moved] = items.splice(fromIndex, 1)
  items.splice(toIndex, 0, moved)

  controller.dataValue = {
    ...controller.dataValue,
    [tab]: {
      ...tabData,
      repeated_items: items,
    },
  }
  controller.getNewWidget()
}

function installManualDragReorder(frame) {
  if (frame.dataset.recordListReorderBound === 'true') return

  frame.dataset.recordListReorderBound = 'true'
  let dragging = null

  const endDrag = (event) => {
    if (!dragging) return
    if (event.type === 'pointerup' && event.pointerId !== dragging.pointerId) return

    document.removeEventListener('pointermove', onPointerMove, true)
    document.removeEventListener('pointerup', endDrag, true)
    document.removeEventListener('pointercancel', endDrag, true)

    const { row, ghost, container, fromIndex, placeholder } = dragging
    removeDragGhost(ghost, frame)
    finishDragPlacement(row, container, placeholder)
    dragging = null

    const controller = widgetController(frame)
    if (!controller) return

    const rows = [...container.querySelectorAll(':scope > .kubik-wysiwyg-repeated-item')]
    const toIndex = rows.indexOf(row)
    moveRepeaterItem(controller, ITEMS_TAB, fromIndex, toIndex)
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

      const container = itemsRepeaterContainer(frame)
      const row = handle.closest('.kubik-wysiwyg-repeated-item')
      if (!container || !row || !container.contains(row)) return

      const fromIndex = Number(row.dataset.kubikRepeaterIndexValue)
      if (Number.isNaN(fromIndex)) return

      const rowRect = row.getBoundingClientRect()

      event.preventDefault()
      event.stopImmediatePropagation()

      const placeholder = createDropPlaceholder(row)
      container.insertBefore(placeholder, row)
      container.removeChild(row)

      const ghost = createDragGhost(row)
      const offsets = mountDragGhost(ghost, row, frame, event, rowRect)

      dragging = {
        row,
        ghost,
        container,
        fromIndex,
        placeholder,
        pointerId: event.pointerId,
        ...offsets,
      }

      document.addEventListener('pointermove', onPointerMove, true)
      document.addEventListener('pointerup', endDrag, true)
      document.addEventListener('pointercancel', endDrag, true)
    },
    true
  )
}

function enhanceRecordListFrame(frame) {
  enhanceDragHandles(frame)
  installManualDragReorder(frame)
  watchRecordListFrame(frame)
}

function scanRecordListWidgets(scope = document) {
  recordListFrames(scope).forEach(enhanceRecordListFrame)
}

function patchGetNewWidgetRebind() {
  if (document.__recordListStreamPatched) return
  document.__recordListStreamPatched = true

  document.addEventListener(
    'turbo:before-stream-render',
    (event) => {
      const { render } = event.detail
      if (typeof render !== 'function') return

      event.detail.render = (streamElement) => {
        render(streamElement)
        requestAnimationFrame(() => scanRecordListWidgets())
      }
    },
    { capture: true }
  )
}

function patchRecordListWidgetConnect() {
  if (KubikWidgetController.__recordListConnectPatched) return

  const previousConnect = KubikWidgetController.prototype.connect

  KubikWidgetController.prototype.connect = function connectRecordListEnhancements() {
    previousConnect.call(this)
    if (this.element.classList.contains('kubik-wysiwyg-record-list')) {
      requestAnimationFrame(() => enhanceRecordListFrame(this.element))
    }
  }

  KubikWidgetController.__recordListConnectPatched = true
}

function patchAutocompleteUnpublishedResults() {
  if (KubikAutocompleteController.__recordListUnpublishedClassPatched) return

  const previousResultsChanged = KubikAutocompleteController.prototype.resultsValueChanged

  KubikAutocompleteController.prototype.resultsValueChanged = function resultsValueChangedWithUnpublishedClass() {
    previousResultsChanged.call(this)
    this.resultTargets.forEach((result) => {
      try {
        const payload = JSON.parse(result.dataset.returnObject || '{}')
        const statusInfo = payload.return_object?.status_info || {}
        if (statusInfo.unpublished) {
          result.classList.add('kubik-wysiwyg-autocomplete-result--unpublished')
        }
      } catch {
        // ignore malformed autocomplete rows
      }
    })
  }

  KubikAutocompleteController.__recordListUnpublishedClassPatched = true
}

export function applyRecordListWidgetAdminEnhancements() {
  patchRecordListWidgetConnect()
  patchGetNewWidgetRebind()
  patchAutocompleteUnpublishedResults()
  scanRecordListWidgets()

  document.addEventListener('turbo:frame-load', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    scanRecordListWidgets(target)
  })

  document.addEventListener('turbo:load', () => scanRecordListWidgets())
}
