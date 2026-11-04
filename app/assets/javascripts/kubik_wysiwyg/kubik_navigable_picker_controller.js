import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["kind", "item", "resourceType", "resource", "location", "value"]
  static values = {
    resourcesUrl: String,
    itemsUrl: String,
    locationsUrl: String,
  }

  connect() {
    this.loadItems()
    this.syncHidden()
    this.kindChange()
  }

  kindChange() {
    const kind = this.hasKindTarget ? this.kindTarget.value : "item"
    if (this.hasItemTarget) this.itemTarget.style.display = kind === "item" ? "" : "none"
    if (this.hasResourceTypeTarget) this.resourceTypeTarget.style.display = kind === "resource" ? "" : "none"
    if (this.hasResourceTarget) this.resourceTarget.style.display = kind === "resource" ? "" : "none"
    if (this.hasLocationTarget) this.locationTarget.style.display = kind === "resource" ? "" : "none"
    this.syncHidden()
  }

  resourceTypeChange() {
    this.loadResources()
  }

  resourceChange() {
    this.loadLocations()
    this.syncHidden()
  }

  syncHidden() {
    if (!this.hasValueTarget) return
    const kind = this.hasKindTarget ? this.kindTarget.value : "item"
    const payload = { kind }
    if (kind === "item") {
      payload.navigation_item_id = this.hasItemTarget ? this.itemTarget.value : null
    } else {
      payload.resource_type = this.hasResourceTypeTarget ? this.resourceTypeTarget.value : null
      payload.resource_id = this.hasResourceTarget ? this.resourceTarget.value : null
      payload.navigation_item_id = this.hasLocationTarget ? this.locationTarget.value : null
    }
    this.valueTarget.value = JSON.stringify(payload)
    this.valueTarget.dispatchEvent(new Event("input", { bubbles: true }))
  }

  loadItems() {
    if (!this.itemsUrlValue || !this.hasItemTarget) return
    fetch(this.itemsUrlValue, { headers: { Accept: "application/json" } })
      .then((res) => res.json())
      .then((items) => {
        this.itemTarget.innerHTML = '<option value=""></option>'
        items.forEach((item) => {
          const option = document.createElement("option")
          option.value = String(item.id)
          option.textContent = `${item.tree}: ${item.title} (${item.uri})`
          this.itemTarget.appendChild(option)
        })
      })
  }

  loadResources() {
    if (!this.hasResourceTypeTarget || !this.resourcesUrlValue) return
    const type = this.resourceTypeTarget.value
    const url = `${this.resourcesUrlValue}?resource_type=${encodeURIComponent(type)}&kubik_navigable_scope=published`
    fetch(url, { headers: { Accept: "application/json" } })
      .then((res) => res.json())
      .then((rows) => {
        this.resourceTarget.innerHTML = '<option value=""></option>'
        rows.forEach((row) => {
          const option = document.createElement("option")
          option.value = String(row.id)
          option.textContent = row.title
          this.resourceTarget.appendChild(option)
        })
      })
  }

  loadLocations() {
    if (!this.hasLocationTarget || !this.hasResourceTarget) return
    const type = this.resourceTypeTarget.value
    const id = this.resourceTarget.value
    const url = `${this.locationsUrlValue}?resource_type=${encodeURIComponent(type)}&resource_id=${encodeURIComponent(id)}`
    fetch(url, { headers: { Accept: "application/json" } })
      .then((res) => res.json())
      .then((rows) => {
        this.locationTarget.innerHTML = '<option value="">Canonical</option>'
        rows.forEach((row) => {
          const option = document.createElement("option")
          option.value = String(row.id)
          option.textContent = `${row.tree}: ${row.title} (${row.uri})${row.canonical ? " — canonical" : ""}`
          this.locationTarget.appendChild(option)
        })
        if (rows.length === 1) this.locationTarget.value = String(rows[0].id)
        this.syncHidden()
      })
  }
}
