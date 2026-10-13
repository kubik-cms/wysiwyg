export default class KubikNavigableLinkTool {
  static get isInline() {
    return true
  }

  static get title() {
    return "Kubik link"
  }

  constructor({ api }) {
    this.api = api
    this.button = null
    this.state = false
  }

  render() {
    this.button = document.createElement("button")
    this.button.type = "button"
    this.button.textContent = "Nav"
    this.button.classList.add(this.api.styles.inlineToolButton)
    return this.button
  }

  surround(range) {
    const selected = range.toString()
    const kind = window.prompt("Link kind: item, resource, or url", "url")
    if (!kind) return

    const anchor = document.createElement("a")
    if (kind === "url") {
      const href = window.prompt("URL", "https://")
      if (!href) return
      anchor.setAttribute("href", href)
      anchor.setAttribute("data-kubik-nav", JSON.stringify({ kind: "url", href }))
    } else if (kind === "item") {
      const id = window.prompt("Navigation item id")
      if (!id) return
      anchor.setAttribute("href", "#")
      anchor.setAttribute("data-kubik-nav", JSON.stringify({ kind: "item", navigation_item_id: id }))
    } else {
      const resourceType = window.prompt("Resource type (e.g. Page)")
      const resourceId = window.prompt("Resource id")
      const locationId = window.prompt("Navigation item id (blank = canonical)", "")
      if (!resourceType || !resourceId) return
      const payload = { kind: "resource", resource_type: resourceType, resource_id: resourceId }
      if (locationId) payload.navigation_item_id = locationId
      anchor.setAttribute("href", "#")
      anchor.setAttribute("data-kubik-nav", JSON.stringify(payload))
    }
    anchor.textContent = selected
    range.deleteContents()
    range.insertNode(anchor)
  }

  checkState() {
    return false
  }
}
