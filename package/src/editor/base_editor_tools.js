import Header from '@editorjs/header'
import NestedList from '@editorjs/nested-list'
import Underline from '@editorjs/underline'
import Embed from '@editorjs/embed'
import Paragraph from '@editorjs/paragraph'
import Quote from '@editorjs/quote'
import Hyperlink from 'editorjs-hyperlink'

import { DEFAULT_INLINE_TOOLBAR, WIDGET_INLINE_TOOLBAR } from './inline_toolbar'

/**
 * Standard Editor.js block/inline tools shared across Kubik host apps.
 * Merge with app-specific widget tools in wysiwyg_tools.js.
 */
export function buildBaseEditorTools({
  widgetInlineToolbar = WIDGET_INLINE_TOOLBAR,
  richInlineToolbar = DEFAULT_INLINE_TOOLBAR,
} = {}) {
  return {
    paragraph: {
      class: Paragraph,
      inlineToolbar: widgetInlineToolbar,
    },
    hyperlink: {
      class: Hyperlink,
      config: {},
    },
    embed: {
      class: Embed,
      config: {
        services: {
          youtube: true,
          vimeo: true,
          twitter: true,
          instagram: true,
        },
      },
    },
    header: {
      class: Header,
      config: {
        placeholder: 'Add header text',
        levels: [2, 3, 4, 5, 6],
        defaultLevel: 2,
      },
      inlineToolbar: richInlineToolbar,
    },
    nested_list: {
      class: NestedList,
      inlineToolbar: richInlineToolbar,
    },
    quote: {
      class: Quote,
      inlineToolbar: richInlineToolbar,
      shortcut: 'CMD+SHIFT+O',
      config: {
        quotePlaceholder: 'Enter a quote',
        captionPlaceholder: "Quote's author",
      },
    },
    underline: Underline,
  }
}
