import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  itemValue: {
    id: Number;
    kubik_media_upload_id: Number;
    thumb: Array<Object>;
    additional_information: any
  }

  widgetIdValue: String
  sourceWidgetValue: String
  itemIndexValue: Number

  static targets = ['widgetContainer']
  static values = {
    item: Object,
    itemIndex: Number,
    widgetId: String,
    sourceWidget: String
  }

  connect():void {
    this._render()
  }

  fields():Array<string> {
    return ['media_type', 'alt_text', 'caption', 'credit']
  }

  fieldMapping():Object {
    const additional_info = this.itemValue.additional_information ? JSON.parse(this.itemValue.additional_information) : {}
    return {
      'media_type': additional_info.media_type ? additional_info.media_type : 'image',
      'alt_text': additional_info.alt_text ? additional_info.alt_text : '',
      'caption': additional_info.img_title ? additional_info.img_title : '',
      'credit': additional_info.img_credit ? additional_info.img_credit : ''
    }
  }

  update_index(templateClone):HTMLTemplateElement {
    const itemsToIndex = templateClone.content.querySelectorAll('[data-item-index=""]') as NodeListOf<HTMLElement>
    itemsToIndex.forEach((item) => {
      item.dataset.itemIndex = this.itemIndexValue.toString()
    })
    return templateClone
  }

  update_fields_values(templateClone):HTMLTemplateElement {
    const values = this.itemValue

    this.fields().forEach((field) => {
      const f = templateClone.content.querySelector(`[data-kubik-name="${field}"]`) as HTMLInputElement

      const value = this.fieldMapping()[field]

      f.value = value
    })
    return templateClone
  }

  _render(): void {
    this.element.innerHTML = ''
    const template = document.getElementById([this.widgetIdValue, 'template'].join('-')) as HTMLTemplateElement

    let templateClone = template.cloneNode(true) as HTMLTemplateElement

    templateClone = this.update_index(templateClone)
    templateClone = this.update_fields_values(templateClone)

    const imageField = templateClone.content.getElementById([this.widgetIdValue.toString(), 'image'].join('-')) as HTMLInputElement

    imageField.dataset.kubikModalReturnPayload = JSON.stringify({index: this.itemIndexValue})
    imageField.dataset.kubikImageSelectSettingsValue = JSON.stringify({thumb: this.itemValue.thumb})

    this.element.appendChild(templateClone.content)
  }
}
