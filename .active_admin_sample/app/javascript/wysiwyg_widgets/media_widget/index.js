import Wysiwyg from 'wysiwyg';

const Icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="2,2,16,16"><path d="M4.646 17.396q-.875 0-1.458-.594-.584-.594-.584-1.448V4.646q0-.854.584-1.448.583-.594 1.458-.594h10.708q.875 0 1.458.594.584.594.584 1.448v10.708q0 .854-.584 1.448-.583.594-1.458.594Zm.646-3.25h9.416L11.5 9.771l-2.25 3-1.5-2Z"/></svg>';

export default class extends Wysiwyg.PluginFactory {
  static get toolbox() {
    return {
      title: 'Media',
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
      widget_model: 'Kubik::Media',
      widget_name: 'media-selector',
      tabs: [
        {
          name: 'media',
          label: 'Media',
          sections: [
            {
              name: 'thumb',
              classes: 'tumb'
            },
            {
              name: 'fileds',
              classes: 'fields'
            }
          ],
          fields: [
            {
              name: 'media',
              label: 'Media',
              model: 'Kubik::MediaUpload',
              type: 'resource',
              section: 'thumb',
              hint: 'Should be at least 1200px wide and not bigger than 4MB',
              variant: 'media'
            },
            {
              name: 'alt_text',
              label: 'Alt text',
              type: 'text',
              section: 'fileds'
            },
            {
              name: 'credit',
              label: 'Credit',
              type: 'text',
              section: 'fileds'
            },
            {
              name: 'caption',
              label: 'Caption',
              type: 'textarea',
              section: 'fileds'
            }
          ],
          repeated: true,
          repeater_settings: {
            add_label: 'Add Media',
          }
        },
        {
          name: 'content',
          label: 'Content',
          fields:[
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'intro',
              label: 'Intro',
              type: 'textarea',
            }
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


