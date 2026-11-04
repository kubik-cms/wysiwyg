const DEFAULT_MEDIA_TYPE_FIELD = 'media.media_type'

function refreshWidgetAfterMediaTypeChange(select) {
  const widgetEl = select.closest('[data-controller~="kubik-widget"]')
  if (!widgetEl) return

  const app = window.KubikInterfaceStimulus
  const controller = app?.getControllerForElementAndIdentifier(widgetEl, 'kubik-widget')
  controller?.getNewWidget?.()
}

function onMediaTypeChange(event, fieldName) {
  const select = event.target
  if (!select.matches(`select[name="${fieldName}"]`)) return
  window.requestAnimationFrame(() => refreshWidgetAfterMediaTypeChange(select))
}

/** Re-render widget after media type changes so server-side visible_when applies. */
export function installMediaTypeChangeRefresh({ fieldName = DEFAULT_MEDIA_TYPE_FIELD } = {}) {
  const key = `__kubikMediaTypeRefresh_${fieldName}`
  if (window[key]) return
  window[key] = true

  document.addEventListener('change', (event) => onMediaTypeChange(event, fieldName))
}

export default installMediaTypeChangeRefresh
