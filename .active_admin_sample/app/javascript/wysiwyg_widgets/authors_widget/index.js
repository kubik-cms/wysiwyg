import Wysiwyg from 'wysiwyg'

const Icon = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M78.477-163.172v-112.349q0-31.258 15.437-57.165 15.437-25.908 42.303-41.227 55.696-32.566 118.433-50.131 62.738-17.565 131.046-17.565 69.391 0 132.152 17.282 62.761 17.283 117.326 49.848 26.867 15.238 42.303 40.989 15.437 25.751 15.437 57.938v112.38H78.477Zm694.916 0v-110.654q0-44.261-18.935-83.087t-53.63-70.305q32.782 9.131 64.76 21.783 31.978 12.652 62.717 30.956 24.261 13 38.739 40.892 14.479 27.892 14.479 61.457v108.958h-108.13ZM385.696-489.609q-64.522 0-109.066-44.544-44.543-44.543-44.543-109.065 0-64.522 44.543-109.066 44.544-44.544 109.066-44.544t109.065 44.544q44.544 44.544 44.544 109.066t-44.544 109.065q-44.543 44.544-109.065 44.544Zm363.697-153.614q0 63.961-44.797 108.788-44.796 44.826-108.723 44.826-8.655 0-15.089-.783-6.435-.782-16.696-3.913 26.13-30.13 40.913-67.808 14.783-37.677 14.783-81.022 0-43.344-14.783-81.105t-40.913-67.892q8.565-2.565 15.565-3.63 7-1.066 15.864-1.066 64.074 0 108.975 44.822 44.901 44.821 44.901 108.783Z"/></svg>';

export default class extends Wysiwyg.PluginFactory {
  static get toolbox() {
    return {
      title: 'Author',
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
      widget_model: 'BookAuthor',
      widget_name: 'author-selector',
      tabs: [
        {
          name: 'items',
          label: 'Items',
          fields: [
            {
              name: 'author',
              label: 'Author',
              model: 'BookAuthor',
              type: 'resource',
            },
            {
              name: 'custom_name',
              label: 'Custom Name',
              type: 'text',
            }
          ],
          repeated: true,
          repeater_settings: {
            add_label: 'Add Author',
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
