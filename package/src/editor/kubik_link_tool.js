import {
  kubikNavigableWysiwygEnabled,
  navigableMeta,
  navigableLinkPanelInnerHtml,
} from "./navigable_link_panel_html.js"

export default class KubikLinkTool {
  static get isInline() {
    return true
  }

  static get title() {
    return "Link"
  }

  constructor({ api }) {
    this.api = api
    this.button = null
    this.panel = null
  }

  render() {
    this.button = document.createElement("button")
    this.button.type = "button"
    this.button.innerHTML = "Link"
    this.button.classList.add(this.api.styles.inlineToolButton)
    return this.button
  }

  surround(range) {
    const selectedText = range.toString()
    this.openPanel(range, selectedText)
  }

  openPanel(range, selectedText) {
    this.closePanel()
    const navigable = kubikNavigableWysiwygEnabled()
    const panel = document.createElement("div")
    panel.className = "kubik-wysiwyg-inline-link-panel"
    const { filterOptions } = navigableMeta()
    const inner = navigable
      ? navigableLinkPanelInnerHtml({ selectedText, filterOptions })
      : `<div class="kubik-wysiwyg-inline-link-panel__inner">
          <label>URL <input type="text" data-kubik-link-href placeholder="https://example.com" /></label>
        </div>`

    panel.innerHTML = `<div class="kubik-wysiwyg-inline-link-panel__inner">${inner}
      <div class="kubik-wysiwyg-inline-link-panel__actions">
        <button type="button" data-kubik-link-cancel>Cancel</button>
        <button type="button" data-kubik-link-apply>Apply</button>
      </div>
    </div>`

    document.body.appendChild(panel)
    this.panel = panel
    this.activeRange = range

    const linkRoot = panel.querySelector(".kubik-navigable-link")
    if (linkRoot && window.KubikInterfaceStimulus?.load) {
      window.KubikInterfaceStimulus.load(linkRoot)
    }

    panel.querySelector("[data-kubik-link-cancel]")?.addEventListener("click", () => this.closePanel())
    panel.querySelector("[data-kubik-link-apply]")?.addEventListener("click", () => {
      this.applyLink(navigable)
      this.closePanel()
    })
  }

  applyLink(navigable) {
    const panel = this.panel
    if (!panel || !this.activeRange) return

    const linkRoot = panel.querySelector("[data-controller*='kubik-navigable-link']")
    let navPayload
    let href = "#"

    if (navigable && linkRoot) {
      const app = window.KubikInterfaceStimulus
      const controller = app?.getControllerForElementAndIdentifier(linkRoot, "kubik-navigable-link")
      controller?.syncHidden()
      const raw = linkRoot.querySelector('[data-kubik-navigable-link-target="value"]')?.value
      if (raw) {
        navPayload = JSON.parse(raw)
        const manual = linkRoot.querySelector('[data-kubik-navigable-link-target="hrefManual"]')
        const system = linkRoot.querySelector('[data-kubik-navigable-link-target="hrefSystem"]')
        href =
          (manual && !manual.closest(".kubik-navigable-link__manual-url--hidden") ? manual.value : system?.value) ||
          navPayload.href ||
          navPayload.resolved_href ||
          "#"
      }
    } else {
      href = panel.querySelector("[data-kubik-link-href]")?.value?.trim() || "#"
    }

    const text =
      linkRoot?.querySelector('[data-kubik-navigable-link-target="text"]')?.value?.trim() ||
      this.activeRange.toString()
    const target = linkRoot?.querySelector('[data-kubik-navigable-link-target="linkTarget"]')?.value?.trim()
    const rel = linkRoot?.querySelector('[data-kubik-navigable-link-target="linkRel"]')?.value?.trim()

    const anchor = document.createElement("a")
    if (navigable && navPayload) {
      anchor.setAttribute("href", href)
      anchor.setAttribute("data-kubik-nav", JSON.stringify(navPayload))
    } else {
      anchor.setAttribute("href", href)
    }
    if (target) anchor.setAttribute("target", target)
    if (rel) anchor.setAttribute("rel", rel)
    anchor.textContent = text

    this.activeRange.deleteContents()
    this.activeRange.insertNode(anchor)
  }

  closePanel() {
    if (this.panel) {
      this.panel.remove()
      this.panel = null
    }
  }

  checkState() {
    return false
  }
}
