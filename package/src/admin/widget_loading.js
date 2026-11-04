import KubikWidgetController from '../controllers/kubik_widget_controller'
import PluginFactory from '../plugins/plugin_factory'

const LOADING_CLASS = 'kubik-wysiwyg-component--loading'
const LOADING_SELECTOR = '.kubik-wysiwyg-component__loading'
const SETTLE_MS = 120
const WIDGET_FRAME_SELECTOR = 'turbo-frame.kubik-wysiwyg-component'

function widgetContentLoaded(frame) {
  return Boolean(
    frame.querySelector(
      '.kubik-wysiwyg-tabs-container, .kubik-wysiwyg-widget-header, .kubik-wysiwyg--standard-fields',
    ),
  )
}

function ensureLoadingSpinner(frame) {
  if (!(frame instanceof Element)) return
  if (frame.querySelector(LOADING_SELECTOR)) return

  const overlay = document.createElement('div')
  overlay.className = 'kubik-wysiwyg-component__loading'
  overlay.setAttribute('aria-busy', 'true')
  overlay.setAttribute('aria-label', 'Loading widget')
  overlay.innerHTML = '<span class="kubik-wysiwyg-component__loading-spinner"></span>'
  frame.appendChild(overlay)
}

function showWidgetLoading(frame) {
  if (!(frame instanceof Element)) return
  ensureLoadingSpinner(frame)
  frame.classList.add(LOADING_CLASS)
  frame.setAttribute('aria-busy', 'true')
}

function hideWidgetLoading(frame) {
  if (!(frame instanceof Element)) return
  if (!widgetContentLoaded(frame)) return
  frame.classList.remove(LOADING_CLASS)
  frame.removeAttribute('aria-busy')
}

function waitForWidgetContent(frame) {
  return new Promise((resolve) => {
    if (widgetContentLoaded(frame)) {
      window.setTimeout(resolve, SETTLE_MS)
      return
    }

    let settleTimer

    const finish = () => {
      if (!widgetContentLoaded(frame)) return
      window.clearTimeout(settleTimer)
      observer.disconnect()
      window.setTimeout(resolve, SETTLE_MS)
    }

    const observer = new MutationObserver(() => {
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(finish, SETTLE_MS)
    })

    observer.observe(frame, { childList: true, subtree: true, attributes: true })
    settleTimer = window.setTimeout(() => {
      observer.disconnect()
      resolve()
    }, 15000)
  })
}

function scanWidgetFrames(root = document) {
  root.querySelectorAll(WIDGET_FRAME_SELECTOR).forEach((frame) => {
    if (widgetContentLoaded(frame)) {
      hideWidgetLoading(frame)
    } else {
      showWidgetLoading(frame)
    }
  })
}

function patchPluginFactoryInitialLoading() {
  if (!PluginFactory || PluginFactory.__initialWidgetLoadingPatched) return

  const originalRender = PluginFactory.prototype.render

  PluginFactory.prototype.render = function renderWithInitialLoading() {
    const wrapper = originalRender.call(this)
    showWidgetLoading(wrapper)
    return wrapper
  }

  PluginFactory.__initialWidgetLoadingPatched = true
}

function patchKubikWidgetLoading() {
  if (!KubikWidgetController || KubikWidgetController.__widgetLoadingUiPatched) return

  const previousConnect = KubikWidgetController.prototype.connect

  KubikWidgetController.prototype.connect = function connectWithLoadingUi() {
    showWidgetLoading(this.element)
    return previousConnect.call(this)
  }

  const previousGetNewWidget = KubikWidgetController.prototype.getNewWidget

  KubikWidgetController.prototype.getNewWidget = function getNewWidgetWithLoadingUi() {
    const frame = this.element
    showWidgetLoading(frame)

    previousGetNewWidget.call(this)

    waitForWidgetContent(frame).then(() => {
      hideWidgetLoading(frame)
    })
  }

  KubikWidgetController.__widgetLoadingUiPatched = true
}

function observeEditorWidgets() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return
        if (node.matches(WIDGET_FRAME_SELECTOR)) {
          scanWidgetFrames(node.parentElement || document)
          return
        }
        scanWidgetFrames(node)
      })
    })
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

export default function applyKubikWysiwygWidgetLoading() {
  patchPluginFactoryInitialLoading()
  patchKubikWidgetLoading()
  scanWidgetFrames()
  observeEditorWidgets()

  document.addEventListener('turbo:load', () => scanWidgetFrames())
  document.addEventListener('turbo:frame-load', (event) => {
    if (event.target instanceof Element) {
      scanWidgetFrames(event.target)
    }
  })
}
