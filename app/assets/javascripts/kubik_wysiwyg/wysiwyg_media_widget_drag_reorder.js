import Wysiwyg from '@kubik-cms/wysiwyg'

const MEDIA_TAB = 'media'
const MEDIA_FRAME_SELECTOR = 'turbo-frame.kubik-wysiwyg-component:not(.kubik-wysiwyg-record-list)'
const DRAG_HANDLE_SELECTOR = '.kubik-wysiwyg-repeated-item-header .kubik-wysiwyg-component--items-action--more'
const DROP_PLACEHOLDER_CLASS = 'kubik-wysiwyg-repeated-item-drop-placeholder'

function stimulusApplication() {
  return window.KubikInterfaceStimulus
}

function widgetController(frame) {
  const app = stimulusApplication()
  if (!app || !frame?.hasAttribute?.('data-controller')) return null
  return app.getControllerForElementAndIdentifier(frame, 'kubik-widget')
}

function mediaRepeaterContainer(frame) {
  const panel = frame.querySelector(`[class*="-tabs-${MEDIA_TAB}"]`)
  if (!panel) return null
  return panel.querySelector('.kubik-wysiwyg-tabs-container:has(> .kubik-wysiwyg-repeated-item)')
}

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

function watchMediaWidgetFrame(frame) {
  if (frame._mediaWidgetMutationObserver) return

  let scheduled = false
  const scheduleEnhance = () => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      enhanceDragHandles(frame)
    })
  }

  frame._mediaWidgetMutationObserver = new MutationObserver(scheduleEnhance)
  frame._mediaWidgetMutationObserver.observe(frame, { childList: true, subtree: true })
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

function moveRepeaterItem(controller, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return
  const tabData = controller.dataValue[MEDIA_TAB] || {}
  const items = [...(tabData.repeated_items || [])]
  if (fromIndex >= items.length || toIndex >= items.length) return
  const [moved] = items.splice(fromIndex, 1)
  items.splice(toIndex, 0, moved)
  controller.dataValue = {
    ...controller.dataValue,
    [MEDIA_TAB]: {
      ...tabData,
      repeated_items: items,
    },
  }
  controller.getNewWidget()
}

function installMediaDragReorder(frame) {
  if (frame.dataset.mediaWidgetReorderBound === 'true') return
  frame.dataset.mediaWidgetReorderBound = 'true'

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
    moveRepeaterItem(controller, fromIndex, toIndex)
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

      const container = mediaRepeaterContainer(frame)
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
      const offsets = mountDragGhost(ghost, frame, event, rowRect)
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
    true,
  )
}

function enhanceMediaWidgetFrame(frame) {
  if (!mediaRepeaterContainer(frame)) return
  enhanceDragHandles(frame)
  installMediaDragReorder(frame)
  watchMediaWidgetFrame(frame)
}

function scanMediaWidgetFrames(scope = document) {
  scope.querySelectorAll(MEDIA_FRAME_SELECTOR).forEach(enhanceMediaWidgetFrame)
}

function patchMediaWidgetConnect() {
  const Controller = Wysiwyg.KubikWidgetController
  if (!Controller || Controller.__readingSchoolsMediaDragConnectPatched) return

  const previousConnect = Controller.prototype.connect
  Controller.prototype.connect = function connectMediaDragEnhancements() {
    previousConnect.call(this)
    requestAnimationFrame(() => enhanceMediaWidgetFrame(this.element))
  }
  Controller.__readingSchoolsMediaDragConnectPatched = true
}

function patchMediaWidgetStreamRebind() {
  if (document.__readingSchoolsMediaDragStreamPatched) return
  document.__readingSchoolsMediaDragStreamPatched = true

  document.addEventListener(
    'turbo:before-stream-render',
    (event) => {
      const { render } = event.detail
      if (typeof render !== 'function') return
      event.detail.render = (streamElement) => {
        render(streamElement)
        requestAnimationFrame(() => scanMediaWidgetFrames())
      }
    },
    { capture: true },
  )
}

export default function applyMediaWidgetDragReorder() {
  patchMediaWidgetConnect()
  patchMediaWidgetStreamRebind()
  scanMediaWidgetFrames()
  document.addEventListener('turbo:frame-load', (event) => {
    if (event.target instanceof Element) scanMediaWidgetFrames(event.target)
  })
  document.addEventListener('turbo:load', () => scanMediaWidgetFrames())
}
