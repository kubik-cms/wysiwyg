import Wysiwyg from 'wysiwyg'

const Icon = '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M120-160v-60h720v60H120Zm0-580v-60h720v60H120Zm60 409q-24 0-42-18t-18-42v-178q0-24 18-42t42-18h600q24 0 42 18t18 42v178q0 24-18 42t-42 18H180Zm0-60h600v-178H180v178Zm0-178v178-178Z"/></svg>';

export default class extends Wysiwyg.PluginFactory {
  static get toolbox() {
    return {
      title: 'Content with media',
      icon: Icon
    }
  }

  static get sanitize() {
    return {
      intro: {
        br: true,
      }
    }
  }

  static get widgetConfig() {
    return {
      widget_name: 'content_with_media',
      icon: Icon,
      tabs: [
        {
          name: 'content',
          label: 'Content',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'body',
              label: 'Body',
              type: 'textarea',
            },
            {
              name: 'additional_content',
              label: 'Additional content',
              type: 'textarea',
            },
          ],
        },
        {
          name: 'media',
          label: 'Media',
          fields: [
            {
              name: 'media',
              label: 'Media',
              model: 'Kubik::MediaUpload',
              type: 'resource',
              variant: 'media'
            },
          ]
        },
        {
          name: 'settings',
          label: 'Settings',
          fields: [
            {
              name: 'additional_classes',
              type: 'text',
              label: 'Additional classes',
            },
            {
              name: 'element_id',
              type: 'text',
              label: 'Element ID',
            }
          ]
        }
      ]
    }
  }
}


