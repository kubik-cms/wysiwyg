import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ['valuesContainer']
  static values = { 
    data: Array,
    widgetId: String,
    fields: Array,
    fieldName: String,
    prefix: String
  }
  connect() {
    this.renderFields()
  }

  dataValueChanged() {
    console.log('dataValueChanged', this.dataValue)
    this.dispatch('updateData', { 
      detail: {
        fieldName: this.fieldNameValue,
        newValues: this.dataValue
      }
    })
  }

  renderFields() {
    this.valuesContainerTarget.innerHTML = ''
    this.dataValue.forEach((item, index) => {
      const prefix = this.prefixValue  != '' ? 
        `<span class='kubik--key_value_repeater--prefix para--small'>${this.prefixValue}</span>` : ''
             
      const formFields = this.fieldsValue.map(field => {
        return `<input 
          id='${this.fieldNameValue}-${this.widgetIdValue}' 
          name='${field}' 
          tabindex='1' 
          type='text' 
          value='${item[field]}' 
          class='input' 
          placeholder='${field}' 
          data-index='${index}' 
          data-repeated-key-value='true'
          data-action='input->kubik-key-value-repeater#updateField'
          data-item-index='${index}'
        >`
      }).join('')
      const deleteButton = `<button 
        class='kubik--key_value_repeater--delete_button material-symbols-outlined' 
        data-action='click->kubik-key-value-repeater#deleteField'
        data-index='${index}'>close</button>
      `
      this.valuesContainerTarget.insertAdjacentHTML('beforeend', `
        <div class='kubik--key_value_repeater'>
          ${prefix}
          ${formFields}
          ${deleteButton}
        </div>
        `
      )
    })
  }
  deleteField(event) {
    const index = event.target.dataset.index
    this.dataValue = this.dataValue.filter((_, i) => i != index)
    this.valuesContainerTarget.innerHTML = ''
    this.renderFields()
  }
  updateField(event) {
    const index = event.target.dataset.index;
    const name = event.target.name;
    const value = event.target.value;

    // Create a new object with the updated field
    const updatedField = {
      ...this.dataValue[index],
      [name]: value
    };

    // Create a new array with the updated field
    this.dataValue = [
      ...this.dataValue.slice(0, index),
      updatedField,
      ...this.dataValue.slice(index + 1)
    ];
  }
  addField() {
    const newField = this.fieldsValue.reduce((acc, field) => {
      acc[field] = '';
      return acc;
    }, {});
    this.dataValue = [...this.dataValue, newField];
    this.renderFields()
  }
}
