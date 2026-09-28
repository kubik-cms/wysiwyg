import set from 'lodash/set';
import get from 'lodash/get';
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
  return arr;
}

function uiPatch(data, patch) {
  const ui = Object.assign({}, data._ui || {}, patch);
  return Object.assign({}, data, { _ui: ui });
}

function parseAdditionalInformation(payload) {
  const raw = payload?.additional_information ?? payload?.additional_info;
  if (raw == null || raw === '') return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function itemPathForResourceId(idPath) {
  const withoutId = idPath.replace(/\.id$/, '');
  const lastDot = withoutId.lastIndexOf('.');
  if (lastDot === -1) return withoutId;
  return withoutId.substring(0, lastDot);
}

function applyMediaMetadataFromGallery(data, resourceIdPath, payload) {
  const info = parseAdditionalInformation(payload);
  if (!info) return data;

  const itemPath = itemPathForResourceId(resourceIdPath);
  const mappings = [
    ['alt_text', info.alt_text],
    ['caption', info.img_title ?? info.caption],
    ['credit', info.img_credit ?? info.credit],
  ];

  let result = data;
  mappings.forEach(([field, value]) => {
    if (value == null || String(value).trim() === '') return;
    result = set(result, `${itemPath}.${field}`, String(value).trim());
  });
  return result;
}

export default class extends Controller {
  static values = {
    widgetId: String,
    setup: Object,
    data: Object,
    maxItems: { type: Number, default: 0 },
    expanded: { type: Boolean, default: false }
  }

  static targets = ['expandedInput']

  static classes = ['expanded']

  connect() {
    this.syncExpandedFromData();
    this.getNewWidget();
    const element = this.element;
    if(this.expandedValue) {
      element.classList.add(this.expandedClass);
    } else {
      element.classList.remove(this.expandedClass);
    }
    element.addEventListener("keydown", this.handleKeyDown.bind(this));
    element.addEventListener("paste", this.handlePaste.bind(this));
  }

  syncExpandedFromData() {
    const ui = this.dataValue._ui || {};
    if (typeof ui.expanded === 'boolean') {
      this.expandedValue = ui.expanded;
    } else if (typeof this.dataValue.expanded === 'boolean') {
      this.expandedValue = this.dataValue.expanded;
    }
  }

  toggleExpanded() {
    this.expandedValue = !this.expandedValue;
    if (this.hasExpandedInputTarget) {
      this.expandedInputTarget.value = this.expandedValue;
    }
    this.dataValue = uiPatch(this.dataValue, { expanded: this.expandedValue });
  }

  setActiveTab(event) {
    const tab = event.currentTarget.value;
    this.dataValue = uiPatch(this.dataValue, { active_tab: tab });
  }

  repeaterToggle(event) {
    const { tab, index, expanded } = event.detail;
    if (tab == null || index == null) return;

    const items = [...(this.dataValue[tab]?.repeated_items || [])];
    if (!items[index]) return;

    items[index] = Object.assign({}, items[index], {
      _ui: Object.assign({}, items[index]._ui || {}, { expanded: expanded })
    });
    const tabData = Object.assign({}, this.dataValue[tab], { repeated_items: items });
    this.dataValue = Object.assign({}, this.dataValue, { [tab]: tabData });
  }

  expandedValueChanged() {
    if(this.expandedValue) {
      this.element.classList.add(this.expandedClass);
    } else {
      this.element.classList.remove(this.expandedClass);
    }
  }

  handleKeyDown(event) {
    const element = this.element;
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
    if (!previousValue || !value) return;

    const diff = updatedDiff(previousValue, value);
    const changedKeys = deepKeys(diff);
    if (changedKeys.length === 0) return;

    if (changedKeys.every((key) => key === '_ui' || key.startsWith('_ui.'))) {
      return;
    }

    const addedItem = diff['items'] && diff['items']['repeated_items'] && JSON.stringify(Object.values(diff['items']['repeated_items'])[0]) === JSON.stringify({});
    const resourceIdChange = changedKeys.some((key) => key.match(/(^|\.)id$/));

    if (addedItem || resourceIdChange) {
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
    const fieldPath = returnObject['return_payload']['field_name'];
    let duplicateData = set(this.dataValue, fieldPath, returnObject['payload']['id']);
    duplicateData = applyMediaMetadataFromGallery(
      duplicateData,
      fieldPath,
      returnObject['payload']
    );
    this.dataValue = duplicateData;
    this.getNewWidget();
  }

  getNewWidget() {
    fetch(`${this.setupValue['src']}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/vnd.turbo-stream.html',
        'X-CSRF-Token': getMetaValue("csrf-token")
      },
      body: JSON.stringify({
        widget_id: this.widgetIdValue,
        data: this.dataValue,
        setup: this.setupValue,
        max_items: this.maxItemsValue
      })
    }).then(response => response.text()).then((html) => {
      Turbo.renderStreamMessage(html)
      this.syncExpandedFromData();
      if(this.expandedValue) {
        this.element.classList.add(this.expandedClass);
      } else {
        this.element.classList.remove(this.expandedClass);
      }
    });
  }
}
