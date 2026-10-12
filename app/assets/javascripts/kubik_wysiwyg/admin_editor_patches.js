import Wysiwyg from "@kubik-cms/wysiwyg"

const EDITOR_UI_SELECTOR =
  ".ce-popover, .cdx-search-field, .ce-inline-toolbar, .ce-inline-tool-hyperlink-wrapper, .ce-settings, .ce-conversion-toolbar"

const TABBABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function editorRootFor(holder) {
  return holder.closest(".codex-editor") || holder
}

function isEditorChromeElement(element) {
  return element?.closest?.(EDITOR_UI_SELECTOR) != null
}

function tabbableInScope(scope) {
  return [...scope.querySelectorAll(TABBABLE_SELECTOR)].filter((element) => {
    if (element.closest("[hidden]")) return false
    return element.getClientRects().length > 0
  })
}

function focusAdjacentTabbable(from, scope, forward) {
  const tabbables = tabbableInScope(scope)
  const index = tabbables.indexOf(from)
  if (index === -1) return false
  const next = tabbables[index + (forward ? 1 : -1)]
  if (!next) return false
  next.focus()
  return true
}

function openBlockSettings(editorRoot) {
  const settingsButton =
    editorRoot.querySelector(
      ".ce-block--focused .ce-toolbar__settings-btn:not(.ce-toolbar__settings-btn--hidden)"
    ) || editorRoot.querySelector(".ce-toolbar__settings-btn:not(.ce-toolbar__settings-btn--hidden)")

  if (!settingsButton) return

  settingsButton.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }))
}

export function installEditorTabKeyBehavior(holder) {
  const editorRoot = () => editorRootFor(holder)
  const tabScope = () => holder.closest("form") || editorRoot()

  const handler = (event) => {
    if (event.key !== "Tab") return
    if (!editorRoot().contains(event.target)) return
    if (isEditorChromeElement(event.target)) return

    if (event.shiftKey) {
      event.preventDefault()
      event.stopImmediatePropagation()
      openBlockSettings(editorRoot())
      return
    }

    event.stopImmediatePropagation()

    const target = event.target
    const nativeField =
      target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT"

    if (nativeField) {
      return
    }

    if (target.isContentEditable) {
      event.preventDefault()
      focusAdjacentTabbable(target, tabScope(), true)
    }
  }

  document.addEventListener("keydown", handler, true)
  return () => document.removeEventListener("keydown", handler, true)
}

const REPEATER_FIELD_NAME = /^(\w+)\[repeated_items\]\[(\d+)\]\.(.+)$/

function parseRepeaterFieldName(name) {
  const match = name?.match(REPEATER_FIELD_NAME)
  if (!match) return null
  return { tab: match[1], index: Number(match[2]), field: match[3] }
}

function parseAdditionalInformation(payload) {
  const raw = payload?.additional_information ?? payload?.additional_info
  if (raw == null || raw === "") return null
  if (typeof raw === "object") return raw
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function assignRepeaterField(item, fieldPath, value) {
  const next = { ...item }
  if (fieldPath === "image" || fieldPath.endsWith(".id")) {
    const parentKey = fieldPath === "image" ? "image" : fieldPath.slice(0, -3)
    next[parentKey] = { ...(next[parentKey] || {}), id: value }
  } else {
    next[fieldPath] = value
  }
  return next
}

function applyRepeaterMediaMetadata(dataValue, fieldName, payload) {
  const parsed = parseRepeaterFieldName(fieldName)
  if (!parsed) return dataValue

  const info = parseAdditionalInformation(payload)
  if (!info) return dataValue

  const mappings = [
    ["alt_text", info.alt_text],
    ["caption", info.img_title ?? info.caption],
    ["credit", info.img_credit ?? info.credit],
  ]

  let next = dataValue
  mappings.forEach(([field, value]) => {
    if (value == null || String(value).trim() === "") return
    const fullName = `${parsed.tab}[repeated_items][${parsed.index}].${field}`
    next = applyRepeaterFieldValue(next, fullName, String(value).trim()) || next
  })
  return next
}

function ensureRepeaterItemExpanded(dataValue, fieldName) {
  const parsed = parseRepeaterFieldName(fieldName)
  if (!parsed) return dataValue

  const tabData = { ...(dataValue[parsed.tab] || {}) }
  const items = [...(tabData.repeated_items || [])]
  const item = items[parsed.index] || {}
  items[parsed.index] = {
    ...item,
    _ui: { ...(item._ui || {}), expanded: true },
  }
  tabData.repeated_items = items
  return { ...dataValue, [parsed.tab]: tabData }
}

function syncRepeaterExpandedFromDom(dataValue, root) {
  if (!root) return dataValue

  let next = dataValue
  root.querySelectorAll(".kubik-wysiwyg-repeated-item[data-kubik-repeater-tab-value]").forEach((element) => {
    const tab = element.dataset.kubikRepeaterTabValue
    const index = Number(element.dataset.kubikRepeaterIndexValue)
    if (!tab || Number.isNaN(index)) return

    const expanded = element.classList.contains("kubik-widget-expanded")
    const tabData = { ...(next[tab] || {}) }
    const items = [...(tabData.repeated_items || [])]
    if (!items[index]) return

    items[index] = {
      ...items[index],
      _ui: { ...(items[index]._ui || {}), expanded },
    }
    tabData.repeated_items = items
    next = { ...next, [tab]: tabData }
  })
  return next
}

function applyRepeaterFieldValue(dataValue, fieldName, value) {
  const parsed = parseRepeaterFieldName(fieldName)
  if (!parsed) return null

  const tabData = { ...(dataValue[parsed.tab] || {}) }
  const items = [...(tabData.repeated_items || [])]
  const item = assignRepeaterField(items[parsed.index] || {}, parsed.field, value)
  items[parsed.index] = item
  tabData.repeated_items = items
  return { ...dataValue, [parsed.tab]: tabData }
}

function widgetDataElement(blockContent) {
  if (blockContent?.hasAttribute?.("data-kubik-widget-data-value")) return blockContent
  return (
    blockContent?.querySelector?.("[data-kubik-widget-data-value]") ||
    blockContent?.closest?.("[data-kubik-widget-data-value]")
  )
}

export function flushAllKubikWidgetFields(application, root = document) {
  if (!application) return
  root.querySelectorAll('[data-controller~="kubik-widget"]').forEach((element) => {
    const controller = application.getControllerForElementAndIdentifier(element, "kubik-widget")
    controller?.flushRepeaterFieldsFromDom?.()
  })
}

function patchKubikWidgetController() {
  const Controller = Wysiwyg.KubikWidgetController
  if (!Controller || Controller.__kubikWidgetPatched) return

  const originalHandleKeyDown = Controller.prototype.handleKeyDown
  const originalUpdateField = Controller.prototype.updateField
  const originalSelectResult = Controller.prototype.selectResult
  const originalRemoveResource = Controller.prototype.removeResource
  const originalReceiveModalReturn = Controller.prototype.receiveModalReturn

  Controller.prototype.connect = function connect() {
    this.syncExpandedFromData()
    this.getNewWidget()
    const element = this.element
    if (this.expandedValue) {
      element.classList.add(this.expandedClass)
    } else {
      element.classList.remove(this.expandedClass)
    }
    this._boundKeyDown = this._boundKeyDown || ((event) => this.handleKeyDown(event))
    this._boundPaste = this._boundPaste || ((event) => this.handlePaste(event))
    element.addEventListener("keydown", this._boundKeyDown)
    element.addEventListener("paste", this._boundPaste)
    this._boundRepeaterInput =
      this._boundRepeaterInput ||
      ((event) => {
        const target = event.target
        if (!target?.name || !parseRepeaterFieldName(target.name)) return
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA" && target.tagName !== "SELECT") return
        this.updateField({ currentTarget: target })
      })
    element.addEventListener("input", this._boundRepeaterInput)
    element.addEventListener("change", this._boundRepeaterInput)
  }

  Controller.prototype.disconnect = function disconnect() {
    if (this._boundKeyDown) {
      this.element.removeEventListener("keydown", this._boundKeyDown)
    }
    if (this._boundPaste) {
      this.element.removeEventListener("paste", this._boundPaste)
    }
    if (this._boundRepeaterInput) {
      this.element.removeEventListener("input", this._boundRepeaterInput)
      this.element.removeEventListener("change", this._boundRepeaterInput)
    }
  }

  Controller.prototype.flushRepeaterFieldsFromDom = function flushRepeaterFieldsFromDom() {
    this.element.querySelectorAll("input[name], textarea[name], select[name]").forEach((field) => {
      if (!field.name) return
      this.updateField({ currentTarget: field })
    })
  }

  Controller.prototype.handleKeyDown = function handleKeyDown(event) {
    const active = document.activeElement
    if (!this.element.contains(active)) return
    if (isEditorChromeElement(active)) return
    if (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT") return
    if (active.isContentEditable !== true) return
    if (event.key === "Enter") {
      return originalHandleKeyDown.call(this, event)
    }
  }

  Controller.prototype.updateField = function updateField(event) {
    const name = event.currentTarget.name
    const parsed = parseRepeaterFieldName(name)
    if (!parsed) {
      return originalUpdateField.call(this, event)
    }

    let value = event.currentTarget.value
    if (
      event.currentTarget.dataset.boolean === "true" &&
      event.currentTarget.type === "checkbox" &&
      !event.currentTarget.checked
    ) {
      value = 0
    }

    const next = applyRepeaterFieldValue(this.dataValue, name, value)
    if (next) this.dataValue = next
  }

  Controller.prototype.selectResult = function selectResult(event) {
    const fieldName = event.currentTarget.dataset.fieldName
    const returnObject = JSON.parse(event.currentTarget.dataset.returnObject)
    let next = applyRepeaterFieldValue(this.dataValue, fieldName, returnObject.id)
    if (next) {
      next = applyRepeaterMediaMetadata(next, fieldName, returnObject)
      next = ensureRepeaterItemExpanded(next, fieldName)
      this.dataValue = next
      this.getNewWidget()
      return
    }
    return originalSelectResult.call(this, event)
  }

  Controller.prototype.removeResource = function removeResource(event) {
    const fieldName = event.currentTarget.dataset.fieldName
    let next = applyRepeaterFieldValue(this.dataValue, fieldName, null)
    if (next) {
      next = ensureRepeaterItemExpanded(next, fieldName)
      this.dataValue = next
      this.getNewWidget()
      return
    }
    return originalRemoveResource.call(this, event)
  }

  Controller.prototype.receiveModalReturn = function receiveModalReturn(return_value) {
    const fieldPath = return_value["return_payload"]["field_name"]
    const payload = return_value["payload"]
    let next = applyRepeaterFieldValue(this.dataValue, fieldPath, payload["id"])
    if (next) {
      next = applyRepeaterMediaMetadata(next, fieldPath, payload)
      next = ensureRepeaterItemExpanded(next, fieldPath)
      this.dataValue = next
      this.getNewWidget()
      return
    }
    return originalReceiveModalReturn.call(this, return_value)
  }

  const originalGetNewWidget = Controller.prototype.getNewWidget
  Controller.prototype.getNewWidget = function getNewWidget() {
    this.dataValue = syncRepeaterExpandedFromDom(this.dataValue, this.element)
    return originalGetNewWidget.call(this)
  }

  Controller.__kubikWidgetPatched = true
}

function patchPluginFactorySave() {
  const PluginFactory = Wysiwyg.PluginFactory
  if (!PluginFactory || PluginFactory.__savePatched) return

  const originalSave = PluginFactory.prototype.save

  PluginFactory.prototype.save = function save(blockContent) {
    const dataEl = widgetDataElement(blockContent)
    const app = window.KubikInterfaceStimulus
    if (dataEl && app) {
      const controller = app.getControllerForElementAndIdentifier(dataEl, "kubik-widget")
      controller?.flushRepeaterFieldsFromDom?.()
    }
    if (dataEl?.attributes?.["data-kubik-widget-data-value"]) {
      return originalSave.call(this, dataEl)
    }
    return originalSave.call(this, blockContent)
  }

  PluginFactory.__savePatched = true
}

function patchKubikAutocompleteController() {
  const Controller = Wysiwyg.KubikAutocompleteController
  if (!Controller || Controller.__kubikAutocompletePatched) return

  const originalKeyCheck = Controller.prototype.keyCheck

  Controller.prototype.keyCheck = function keyCheck(event) {
    if (!this.element.classList.contains(this.activeListClass)) {
      return
    }
    return originalKeyCheck.call(this, event)
  }

  Controller.__kubikAutocompletePatched = true
}

export default function applyKubikWysiwygEditorPatches() {
  patchKubikWidgetController()
  patchPluginFactorySave()
  patchKubikAutocompleteController()
}
