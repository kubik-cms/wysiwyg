import set from 'lodash/set';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { updatedDiff } from 'deep-object-diff';
import deepKeys from 'deep-keys';
import sanitizeHtml from 'sanitize-html';

import { Controller } from "@hotwired/stimulus";

function getMetaValue(name) {
  const element = document.head.querySelector(`meta[name="${name}"]`);
  return element.getAttribute("content");
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
}

export default class extends Controller {
  static values = {
    widgetId: String,
    setup: Object,
    data: Object,
    maxItems: { type: Number, default: 0 }
  }

  connect() {
    this.getNewWidget();
    console.log('connected widget');
    const element = this.element;
    element.addEventListener("keydown", this.handleKeyDown.bind(this));
    element.addEventListener("paste", this.handlePaste.bind(this));
  }

  handleKeyDown(event) {
    const element = this.element;
    console.log(event.key);
    if (element.contains(document.activeElement) && (event.key === 'Tab' || event.key === 'Enter')) {
      event.stopPropagation();
    }
  }

  handlePaste(event) {
    const element = this.element;
    const activeElement = document.activeElement;
    if (element.contains(document.activeElement) && document.activeElement.tagName === 'DIV' && activeElement.contentEditable === 'true') {
      event.preventDefault();
      let paste = (event.clipboardData || window.clipboardData).getData("text");
      paste = sanitizeHtml(paste);
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(paste));
      selection.collapseToEnd();
    }
  }

  moveItemUp(event) {
    const item = event.currentTarget;
    this.moveItemToPosition(item, -1);
  }

  moveItemDown(event) {
    const item = event.currentTarget;
    this.moveItemToPosition(item, 1);
  }

  moveItemToPosition(item, change) {
    const itemIndex = parseInt(item.dataset.itemIndex);
    const tab = item.dataset.targetList;
    const items = this.dataValue[tab]['repeated_items'];
    const newOrder = array_move(items, itemIndex, itemIndex + change);
    const newValues = Object.assign({}, this.dataValue);
    newValues[tab]['repeated_items'] = newOrder;
    this.dataValue = newValues;
    this.getNewWidget();
  }

  removeItem(event) {
    const target = event.currentTarget;
    const index = target.dataset.itemIndex;
    const tab = target.dataset.targetList;
    const newValues = Object.assign({}, this.dataValue);
    newValues[tab]['repeated_items'].splice(index, 1);
    this.dataValue = newValues;
    this.getNewWidget();
  }

  addItem(event) {
    const target = event.currentTarget;
    const tab = target.dataset.targetList;
    if (typeof this.dataValue[tab] == 'undefined') {
      this.dataValue = Object.assign({}, this.dataValue, { [tab]: { 'repeated_items': [] } });
    }
    this.dataValue = Object.assign({}, this.dataValue, { [tab]: { 'repeated_items': [...this.dataValue[tab]['repeated_items'], {}] } });
    this.getNewWidget();
  }

  dataValueChanged(value, previousValue) {
    const diff = updatedDiff(value, previousValue);
    const changedKeys = deepKeys(diff);
    const addedItem = diff['items'] && diff['items']['repeated_items'] && JSON.stringify(Object.values(diff['items']['repeated_items'])[0]) === JSON.stringify({});
    if (addedItem || changedKeys.filter((key) => key.match(/^id$|\.id$/g)).length > 0) {
      this.getNewWidget();
    }
  }

  overrideData(event) {
    const fieldName = event.detail.fieldName;
    const value = event.detail.newValues;
    const duplicateData = set(this.dataValue, fieldName, value);
    this.dataValue = duplicateData;
  }

  updateField(event) {
    const name = event.currentTarget.name;
    let v = event.currentTarget.value;
    if (event.currentTarget.dataset.boolean === 'true' && event.currentTarget.type === 'checkbox' && !event.currentTarget.checked) {
      v = 0;
    }
    if (event.currentTarget.dataset.checkbox === 'true' && event.currentTarget.type === 'checkbox') {
      v = Array.from(event.currentTarget.parentElement.parentElement.querySelectorAll(`[name="${event.currentTarget.name}"]`)).map((el) => el.checked ? el.value : null).filter((el) => el !== null);
    }
    if (event.currentTarget.dataset.repeatedKeyValue === 'true') {
      const [field, idx, ...rest] = event.currentTarget.name.split('.').reverse();
      const fieldName = [rest.reverse().join('.'), idx.toString(), field].join('.');
      const fieldValues = get(this.dataValue, fieldName, '');
      //v = set(fieldValues, field, v)
    }
    if (event.currentTarget.dataset.repeated === 'true') {
      const i = event.currentTarget.dataset.index;
      const [field, index, ...rest] = event.currentTarget.name.split('.').reverse();
      const fieldName = rest.reverse().join('.');
      const fieldValues = get(this.dataValue, fieldName);
      v = set(fieldValues[index], field, v);
    }
    const duplicateData = set(this.dataValue, name, v);
    this.dataValue = duplicateData;
  }

  updateWysiwygField(event) {
    const name = event.currentTarget.dataset.fieldName;
    const duplicateData = set(this.dataValue, name, event.currentTarget.innerHTML);
    this.dataValue = duplicateData;
  }

  selectResult(event) {
    const target = event.currentTarget;
    const returnObject = JSON.parse(target.dataset.returnObject);
    const duplicateData = set(this.dataValue, target.dataset.fieldName, returnObject.id);
    this.dataValue = duplicateData;
    this.getNewWidget();
  }

  removeResource(event) {
    const target = event.currentTarget;
    const duplicateData = set(this.dataValue, target.dataset.fieldName, null);
    this.dataValue = duplicateData;
    this.getNewWidget();
  }

  receiveModalReturn(return_value) {
    const returnObject = return_value;
    const duplicateData = set(this.dataValue, returnObject['return_payload']['field_name'], returnObject['payload']['id']);
    this.dataValue = duplicateData;
    this.getNewWidget();
  }

  getNewWidget() {
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
      const element = this.element;
      element.innerHTML = data.html_data;
    });
  }
}