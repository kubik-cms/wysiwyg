import { Controller } from "@hotwired/stimulus"
import set from 'lodash/set'
import isEqual from 'lodash/isEqual'
import { updatedDiff } from 'deep-object-diff'
import deepKeys from 'deep-keys';


function getMetaValue(name) {
  const element = document.head.querySelector(`meta[name="${name}"]`)
  return element.getAttribute("content")
}

function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
          arr.push(undefined);
      }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
};

export default class extends Controller {
  widgetIdValue: String
  setupValue: Object
  dataValue: Object
  maxItemsValue: Number
  hasExpandedClass: Boolean

  static values = {
    widgetId: String,
    setup: Object,
    data: Object,
    maxItems: { type: Number, default: 0 }
  }

  connect():void {
    this.getNewWidget();
  }

  moveItemUp(event):void {
    const item = event.currentTarget
    this.moveItemToPosition(item, -1)
  }

  moveItemDown(event):void {
    const item = event.currentTarget
    this.moveItemToPosition(item, 1)
  }

  moveItemToPosition(item, change):void {
    const itemIndex = parseInt(item.dataset.itemIndex)
    const tab = item.dataset.targetList
    const items = this.dataValue[tab]['repeated_items']
    const newOrder = array_move(items, itemIndex, itemIndex + change)
    const newValues = Object.assign({}, this.dataValue)
    newValues[tab]['repeated_items'] = newOrder
    this.dataValue = newValues
  }

  removeItem(event):void {
    const target = event.currentTarget
    const index = target.dataset.itemIndex
    const tab = target.dataset.targetList
    const newValues = Object.assign({}, this.dataValue)
    newValues[tab]['repeated_items'].splice(index, 1)
    this.dataValue = newValues
    this.getNewWidget()
  }

  addItem(event):void {
    const target = event.currentTarget
    const tab = target.dataset.targetList
    if (typeof this.dataValue[tab] == 'undefined') {
      this.dataValue = Object.assign({}, this.dataValue, { [tab]: {'repeated_items': []}})
    }
    this.dataValue = Object.assign({}, this.dataValue, { [tab]: {'repeated_items': [...this.dataValue[tab]['repeated_items'], {}]}})
    this.getNewWidget()
  }

  dataValueChanged(value, previousValue): void {
    const diff = updatedDiff(value, previousValue)
    const changedKeys = deepKeys(diff)
    const addedItem = diff['items'] && diff['items']['repeated_items'] && JSON.stringify(Object.values(diff['items']['repeated_items'])[0]) === JSON.stringify({})
    if(addedItem || changedKeys.filter((key) => key.match(/^id$|\.id$/g)).length > 0) {
      this.getNewWidget()
    }
  }

  updateField(event):void {
     const name = event.currentTarget.name
     let v = event.currentTarget.value
     if(event.currentTarget.dataset.boolean === 'true' && event.currentTarget.type === 'checkbox' && !event.currentTarget.checked) {
       v = 0
     }
     if(event.currentTarget.dataset.checkbox === 'true' && event.currentTarget.type === 'checkbox') {
       v = Array.from(event.currentTarget.parentElement.parentElement.querySelectorAll("[name=`${event.currentTarget.name}`]")).map( (el:HTMLInputElement) => el.checked ? el.value : null).filter( (el) => el !== null)
     }

     const duplicateData = set(this.dataValue, name, v)
     this.dataValue = duplicateData
  }

  updateWysiwygField(event):void {
     const name = event.currentTarget.dataset.fieldName
     const duplicateData = set(this.dataValue, name, event.currentTarget.innerHTML)
     this.dataValue = duplicateData
  }

  selectResult(e:Event):void {
    const target = e.currentTarget as HTMLElement
    const returnObject = JSON.parse(target.dataset.returnObject)
    const duplicateData = set(this.dataValue, target.dataset.fieldName, returnObject.id)
    this.dataValue = duplicateData
    this.getNewWidget()
  }

  removeResource(e:Event):void {
    const target = e.currentTarget as HTMLElement
    const duplicateData = set(this.dataValue, target.dataset.fieldName, null)
    this.dataValue = duplicateData
    this.getNewWidget()
  }

  receiveModalReturn(return_value):void {
    const returnObject = return_value
    const duplicateData = set(this.dataValue, returnObject['return_payload']['field_name'], returnObject['payload']['id'])
    this.dataValue = duplicateData
    this.getNewWidget()
  }


  getNewWidget():void {
    fetch(`${this.setupValue['src']}.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getMetaValue("csrf-token")
      },
      body: JSON.stringify({
        widget_id: this.widgetIdValue,
        data: this.dataValue,
        setup: this.setupValue,
        max_items: this.maxItemsValue
      })
    }).then(response => response.json()).then((data) => {
      this.element.innerHTML = data.html_data
    })
  }
}
