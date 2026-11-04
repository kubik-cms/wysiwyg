import { Controller } from '@hotwired/stimulus'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default class extends Controller {
  static targets = ['valuesContainer', 'addButton']

  static values = {
    data: Array,
    widgetId: String,
    fields: Array,
    fieldName: String,
    prefix: String,
    fieldConfig: Object,
  }

  connect() {
    this.dataValue = this.compactRows(this.dataValue)
    this.renderFields()
    this.updateAddButton()
  }

  dataValueChanged() {
    this.dispatch('updateData', {
      detail: {
        fieldName: this.fieldNameValue,
        newValues: this.dataValue,
      },
    })
  }

  compactRows(rows) {
    return rows.filter((row) => !this.rowIsEmpty(row))
  }

  rowIsEmpty(row) {
    return this.fieldsValue.every((field) => (row[field] || '').trim() === '')
  }

  fieldMarkup(field, item, index) {
    const config = (this.fieldConfigValue || {})[field] || {}
    const value = escapeHtml(item[field] || '')

    if (config.type === 'select') {
      const options = (config.options || [])
        .map(
          (option) =>
            `<option value='${escapeHtml(option.value)}' ${option.value === (item[field] || '') ? 'selected' : ''}>${escapeHtml(option.label)}</option>`,
        )
        .join('')

      return `<div class="input select kubik--key_value_repeater--field-select">
        <select
          id='${this.fieldNameValue}-${this.widgetIdValue}-${field}-${index}'
          name='${field}'
          tabindex='1'
          class='input'
          data-index='${index}'
          data-repeated-key-value='true'
          data-action='change->kubik-key-value-repeater#updateField'
          data-item-index='${index}'
        >${options}</select>
      </div>`
    }

    return `<input
          id='${this.fieldNameValue}-${this.widgetIdValue}-${field}-${index}'
          name='${field}'
          tabindex='1'
          type='text'
          value='${value}'
          class='input'
          placeholder='${field}'
          data-index='${index}'
          data-repeated-key-value='true'
          data-action='input->kubik-key-value-repeater#updateField'
          data-item-index='${index}'
        >`
  }

  renderFields() {
    this.valuesContainerTarget.innerHTML = ''
    this.dataValue.forEach((item, index) => {
      const prefix =
        this.prefixValue !== ''
          ? `<span class='kubik--key_value_repeater--prefix para--small'>${this.prefixValue}</span>`
          : ''
      const formFields = this.fieldsValue.map((field) => this.fieldMarkup(field, item, index)).join('')
      const deleteButton = `<button
        class='kubik--key_value_repeater--delete_button material-symbols-outlined'
        data-action='click->kubik-key-value-repeater#deleteField'
        data-index='${index}'>close</button>`

      this.valuesContainerTarget.insertAdjacentHTML(
        'beforeend',
        `
        <div class='kubik--key_value_repeater'>
          ${prefix}
          ${formFields}
          ${deleteButton}
        </div>
        `,
      )
    })
    this.updateAddButton()
  }

  updateAddButton() {
    if (!this.hasAddButtonTarget) return
    const hasRows = this.dataValue.length > 0
    this.addButtonTarget.textContent = hasRows ? 'Add another' : 'Add'
  }

  deleteField(event) {
    const index = event.target.dataset.index
    this.dataValue = this.dataValue.filter((_, i) => i != index)
    this.valuesContainerTarget.innerHTML = ''
    this.renderFields()
  }

  updateField(event) {
    const index = event.target.dataset.index
    const name = event.target.name
    const value = event.target.value
    const updatedField = {
      ...this.dataValue[index],
      [name]: value,
    }
    this.dataValue = [...this.dataValue.slice(0, index), updatedField, ...this.dataValue.slice(index + 1)]
  }

  addField() {
    const newField = this.fieldsValue.reduce((acc, field) => {
      acc[field] = ''
      return acc
    }, {})
    this.dataValue = [...this.dataValue, newField]
    this.renderFields()
    this.updateAddButton()
  }
}
