import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header';
import NestedList from '@editorjs/nested-list';
import Underline from '@editorjs/underline';
import Embed from '@editorjs/embed';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import MediaWidget from '../plugins/media_widget';
import AuthorSelector from '../plugins/authors_widget';
import Hyperlink from 'editorjs-hyperlink';
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  editor: any

  contentValue: {
    blocks: any
  }
  widgetsValue: object

  inputTarget: HTMLInputElement

  static targets = ['editor', 'input']
  static values = { content: Object, widgets: Object, url: String }

  connect():void {
    this.fetchContents()
    this.initializeEditor()
  }

  initializeEditor():void {
    const element = this.element as HTMLElement
    element.id = 'editor-test'
    this.editor = new EditorJS({
      holder: element,
      minHeight: 100,
      tools: {
        image: {
          class: MediaWidget,
          inlineToolbar: ['bold', 'underline', 'hyperlink', 'italic'],
        },
        author: {
          class: AuthorSelector,
          inlineToolbar: ['bold', 'underline', 'hyperlink', 'italic'],
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: ['bold', 'underline', 'hyperlink', 'italic'],
        },
        hyperlink: {
          class: Hyperlink,
          config: {}
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              vimeo: true,
              twitter: true,
              instagram: true,
            }
          }
        },
        header: {
          class: Header,
          config: {
            placeholder: "Add header text",
            levels: [2, 3, 4, 5, 6],
            defaultLevel: 2
          }
        },
        nested_list: {
          class: NestedList,
          inlineToolbar: true
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+O',
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote\'s author',
          },
        },
        underline: Underline,
      },
      data: this.contentValue,
      onChange: () => {
        this.saveContents()
      },
    });
  }

  saveContents():void {
    if(this.editor && this.editor.save) {
      this.editor
        .save()
        .then((savedData) => {
          this.inputTarget.value = JSON.stringify(savedData)
        })
        .catch((error) => {
          console.warn('Saving failed: ', error)
        });
    }
  }

  fetchContents():void {
    try {
      this.contentValue = JSON.parse(this.inputTarget.value)
    } catch (e) {
      this.contentValue = { blocks: []}
    }
  }
}
