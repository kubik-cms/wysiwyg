import { makeElement } from '../plugins/templates/widget_generation_tools'
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  srcValue: string
  errorValue: string
  queryValue: string
  returnControllerValueValue: string
  resultActiveValue?: number
  hasResultActiveValue: boolean
  resultsValue: Array<Object>
  resultsListTarget: HTMLElement
  resultTargets: Array<HTMLElement>
  errorResultTarget: HTMLElement
  inputTarget: HTMLInputElement
  feedbackTarget: HTMLElement
  connectionController: AbortController
  fieldNameValue: string
  loadingClass: string
  fetchErrorClass: string
  activeClass: string
  activeResultClass: string
  activeListClass: string
  noResultsClass: string

  static classes = ['fetchError', 'loading', 'active', 'activeResult', 'noResults', 'activeList']
  static targets = ['feedback', 'input', 'resultsList', 'result']

  static values = {
    returnController: String,
    src: String,
    fieldName: String,
    query: { type: String, default: '' },
    error: { type: String, default: '' },
    results: { type: Array, default: [] },
    resultActive: Number
  }

  connect():void {
    this._loadDefaultResults()
    //this.inputTarget.focus()
  }

  showForm():void {
    this.element.classList.add(this.activeListClass)
  }

  cancel(event):void {
    event.preventDefault()
    this.element.classList.remove(this.activeListClass)
  }

  errorValueChanged():void {
    if(this.errorValue == '') {
      this.element.classList.remove(this.fetchErrorClass)
    } else {
      this.element.classList.add(this.fetchErrorClass)
    }
  }

  resultActiveValueChanged():void {
    this.resultTargets.forEach( (result) => {
      result.classList.remove(this.activeResultClass)
    })
    if(!isNaN(this.resultActiveValue)) {
      const activeResult = this.resultActiveValue
      this.resultTargets[activeResult].classList.add(this.activeResultClass)
    }
  }

  mouseOver(e: MouseEvent):void {
    const target = e.currentTarget as HTMLElement
    this.resultActiveValue = parseInt(target.dataset['index'])
  }

  mouseOut(e: MouseEvent):void {
    this.resultActiveValue = null
  }

  resultsValueChanged():void {
    const fieldNameValue = this.fieldNameValue
    this.resultTargets.forEach(result => result.remove())
    this.resultActiveValue = null
    this.resultsValue.forEach( (result, index) => {
      const returnObject = Object.assign(
        { receive_index: this.inputTarget.dataset['itemIndex'] },
        result
      )
      const li = makeElement('li', [
        'kubik-wysiwyg-component--item-autocomplete-results-list-item'
      ], {
        'data-kubik-autocomplete-target': 'result',
        'data-index': index,
        'data-return-id': returnObject['id'],
        'data-return-object': JSON.stringify(returnObject),
        'data-field-name': fieldNameValue,
        'data-action': 'mouseout->kubik-autocomplete#mouseOut mouseover->kubik-autocomplete#mouseOver mousedown->kubik-widget#selectResult mousedown->kubik-autocomplete#blur',
      }, result['return_object']['display_name'])
      this.resultsListTarget.insertBefore(li, this.feedbackTarget)
    })
    if(this.resultActiveValue > this.resultsValue.length) {
      this.resultActiveValue = this.resultsValue.length - 1
    }
  }

  load():void {
    this._fetchResults()
  }

  focus():void {
    this.element.classList.add(this.activeClass)
  }

  blur():void {
    this.errorValue = '';
    this.inputTarget.blur()
    this.connectionController.abort()
    this.element.classList.remove(this.fetchErrorClass)
    this.element.classList.remove(this.loadingClass)
    this.element.classList.remove(this.activeClass)
  }

  _sourceURL():URL {
    const baseUrl = [window.location.protocol, window.location.host].join('//')
    const params = new URLSearchParams({
      kubik_search: '1',
      q: this.inputTarget.value
    })
    const url = new URL([this.srcValue, '.json?', params.toString()].join(''), baseUrl);
    return url
  }

  _loadDefaultResults():void {
    this._fetchResults()
  }

  keyCheck(e: KeyboardEvent):void {
    switch(e.key) {
      case "Down":
      case "ArrowDown":
        this._nextResult()
        e.preventDefault()
        e.stopImmediatePropagation()
        return;
      case "Up":
      case "ArrowUp":
        this._previousResult()
        e.preventDefault()
        e.stopImmediatePropagation()
        return;
      case "Enter":
        const selectedElement = this.resultTargets[this.resultActiveValue] as HTMLElement
        if(selectedElement) {
          selectedElement.dispatchEvent(new Event('mousedown'))
        }
        e.preventDefault()
        e.stopImmediatePropagation()
        return;
      case "Backspace":
        e.stopImmediatePropagation()
        return;
    }
  }

  _previousResult():void {
    if(isNaN(this.resultActiveValue)) {
      this.resultActiveValue = this.resultTargets.length > 1 ? this.resultTargets.length - 1 : 0
    } else {
      this.resultActiveValue = this.resultActiveValue == 0 ? this.resultTargets.length - 1 : this.resultActiveValue - 1
    }
  }

  _nextResult():void {
    if(isNaN(this.resultActiveValue)) {
      this.resultActiveValue = 0
    } else {
      this.resultActiveValue = this.resultActiveValue + 1 == this.resultTargets.length ? 0 : this.resultActiveValue + 1
    }
  }

  _fetchResults():void {
    this.errorValue = ''

    this.feedbackTarget.innerHTML = 'Loading...'

    this.connectionController = new AbortController();

    fetch(this._sourceURL(), {
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then((response) => { return response.json()})
    .then((result) => {
      this.errorValue = ''
      if(result.length > 0) {
        this.resultsValue = result
        this.queryValue = this.inputTarget.value
      }
      if(this.inputTarget.value == '') {
        this.queryValue = ''
        this.feedbackTarget.innerHTML = ''
        this.feedbackTarget.insertAdjacentHTML('beforeend', `Showing latest <span>${result.length}</span> results`);
      } else {
        this.feedbackTarget.innerHTML = ''
        if(this.queryValue == '') {
          this.feedbackTarget.insertAdjacentHTML('beforeend', `Showing latest <span>${result.length}</span> results`);
        } else {
          this.feedbackTarget.insertAdjacentHTML('beforeend', `Showing results for <span>${this.queryValue}</span>`);
        }
      }
      if(this.queryValue == this.inputTarget.value) {
        this.element.classList.remove(this.noResultsClass)
      } else {
        this.element.classList.add(this.noResultsClass)
      }
    })
    .catch((error) => {
      this.feedbackTarget.innerHTML = ''
      this.errorValue = 'Error loading the results';
      if(process.env.NODE_ENV == 'development') {
        console.warn('Error:', error);
      }
    })
  }
}
