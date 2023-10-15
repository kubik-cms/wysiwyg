import Wysiwyg from 'wysiwyg'

const Icon = '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M120-160v-60h720v60H120Zm0-580v-60h720v60H120Zm60 409q-24 0-42-18t-18-42v-178q0-24 18-42t42-18h600q24 0 42 18t18 42v178q0 24-18 42t-42 18H180Zm0-60h600v-178H180v178Zm0-178v178-178Z"/></svg>';

export default class extends Wysiwyg.PluginFactory {
  static get toolbox() {
    return {
      title: 'Column text',
      icon: Icon
    }
  }

  static get sanitize() {
    return {
      br: true,
      u: true,
      b: true,
      i: true,
    }
  }

  static get widgetConfig() {
    return {
      widget_name: 'column_text',
      icon: Icon,
      tabs: [
        {
          name: 'content',
          label: 'Content',
          fields: [
            {
              name: 'fake',
              label: 'Fake',
              type: 'text',
            },
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'body',
              label: 'Body',
              type: 'wysiwyg',
            },
          ],
          repeated: true,
          repeater_settings: {
            add_label: 'Add Column',
            header_label: 'Column',
            summary: 'title',
          }
        },
        {
          name: 'settings',
          label: 'Settings',
          fields: [
            {
              name: 'text_checkbox',
              label: 'Text checkbox',
              type: 'checkbox',
              options: [
                { label: 'Option 1', value: 'option_1' },
                { label: 'Option 2', value: 'option_2' },
                { label: 'Option 3', value: 'option_3' },
              ]
            },
            {
              name: 'test_radio',
              label: 'Test radio',
              type: 'radio',
              options: [
                { label: 'Option 1', value: 'option_1' },
                { label: 'Option 2', value: 'option_2' },
                { label: 'Option 3', value: 'option_3' },
              ]
            },
            {
              name: 'test_select',
              label: 'Test select',
              type: 'select',
              options: [
                { label: 'Option 1', value: 'option_1' },
                { label: 'Option 2', value: 'option_2' },
                { label: 'Option 3', value: 'option_3' },
              ]
            },
            {
              name: 'boolean_check',
              type: 'boolean',
              label: 'Boolean check',
              hint: 'This is a boolean check',
            },
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


