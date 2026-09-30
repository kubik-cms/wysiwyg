import Wysiwyg from "@kubik-cms/wysiwyg"

const EDITOR_UI_SELECTOR = ".ce-popover, .cdx-search-field, .ce-inline-toolbar, .ce-inline-tool-hyperlink-wrapper"

function isEditorChromeElement(element) {
  return element?.closest?.(EDITOR_UI_SELECTOR) != null
}

const REPEATER_FIELD_NAME = /^(\w+)\[repeated_items\]\[(\d+)\]\.(.+)$/

function parseRepeaterFieldName(name) {
  const match = name?.match(REPEATER_FIELD_NAME)
  if (!match) return null
  return { tab: match[1], index: Number(match[2]), field: match[3] }
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
    return originalHandleKeyDown.call(this, event)
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
    const next = applyRepeaterFieldValue(this.dataValue, fieldName, returnObject.id)
    if (next) {
      this.dataValue = next
      this.getNewWidget()
      return
    }
    return originalSelectResult.call(this, event)
  }

  Controller.prototype.removeResource = function removeResource(event) {
    const fieldName = event.currentTarget.dataset.fieldName
    const next = applyRepeaterFieldValue(this.dataValue, fieldName, null)
    if (next) {
      this.dataValue = next
      this.getNewWidget()
      return
    }
    return originalRemoveResource.call(this, event)
  }

  Controller.prototype.receiveModalReturn = function receiveModalReturn(return_value) {
    const fieldPath = return_value["return_payload"]["field_name"]
    const id = return_value["payload"]["id"]
    const next = applyRepeaterFieldValue(this.dataValue, fieldPath, id)
    if (next) {
      this.dataValue = next
      this.getNewWidget()
      return
    }
    return originalReceiveModalReturn.call(this, return_value)
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
