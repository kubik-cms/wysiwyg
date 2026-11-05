const REPEATER_MEDIA_TYPE = /^(\w+)\[repeated_items\]\[(\d+)\]\.media_type$/

function isMediaTypeSelect(select) {
  if (!(select instanceof HTMLSelectElement)) return false
  if (select.name === 'media.media_type') return true
  return REPEATER_MEDIA_TYPE.test(select.name)
}

function refreshWidgetAfterMediaTypeChange(select) {
  const widgetEl = select.closest('[data-controller~="kubik-widget"]')
  if (!widgetEl) return

  const app = window.KubikInterfaceStimulus
  const controller = app?.getControllerForElementAndIdentifier(widgetEl, 'kubik-widget')
  controller?.getNewWidget?.()
}

function onMediaTypeChange(event) {
  const select = event.target
  if (!isMediaTypeSelect(select)) return
  window.requestAnimationFrame(() => refreshWidgetAfterMediaTypeChange(select))
}

/** Re-render widget after media type changes so server-side visible_when applies. */
export function installMediaTypeChangeRefresh() {
  if (window.__kubikMediaTypeRefreshInstalled) return
  window.__kubikMediaTypeRefreshInstalled = true

  document.addEventListener('change', onMediaTypeChange)
}

export default installMediaTypeChangeRefresh
