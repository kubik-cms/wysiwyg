import Header from '@editorjs/header';
import NestedList from '@editorjs/nested-list';
import Underline from '@editorjs/underline';
import Embed from '@editorjs/embed';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import MediaWidget from './media_widget';
import AuthorSelector from './authors_widget';
import Hyperlink from 'editorjs-hyperlink';

export default {
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
}
