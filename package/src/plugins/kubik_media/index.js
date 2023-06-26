import { widgetWrapper } from '../templates/widget_wrapper'
import PluginFactory from '../plugin_factory'
//import { tabbedControls } from '../templates/tabbed_controls'
//import { itemsContents } from './items_contents'
//import { textContents } from './text_contents'
//import { settingsContents } from './settings_contents'

const widgetName = 'media-widget'
const Icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="2,2,16,16"><path d="M4.646 17.396q-.875 0-1.458-.594-.584-.594-.584-1.448V4.646q0-.854.584-1.448.583-.594 1.458-.594h10.708q.875 0 1.458.594.584.594.584 1.448v10.708q0 .854-.584 1.448-.583.594-1.458.594Zm.646-3.25h9.416L11.5 9.771l-2.25 3-1.5-2Z"/></svg>';

export default class KubikMedia extends PluginFactory {
  static get toolbox() {
    return {
      title: 'Image',
      icon: Icon
    }
  }

  static get sanitize(){
    return {
      intro: {
        br: true,
      }
    }
  }

  static get widgetConfig() {
    return {
      widget_model: 'Kubik::MediaGallery',
      widget_name: 'media-selector'
    }
  }
}
 // constructor({ data }){
 //   this.data = data;
 //   this.randomString = Math.random().toString(36).substring(2,7);
 // }

 // render() {
 //   const widgetId = [widgetName, this.randomString].join('-')

 //   const dataPoint = this.api.ui.nodes.wrapper.parentElement.dataset.editorWidgetsValue
 //   const widgetsSrc = JSON.parse(dataPoint)
 //   const itemsSrc = widgetsSrc['images']

 //   const wrapper = widgetWrapper({
 //     label: 'Media',
 //     widget_model: 'Kubik::MediaGallery',
 //     icon: Icon,
 //     widgetId: widgetId,
 //     widget_type: widgetName
 //   }, this.data)

 //   return wrapper;
 // }

 // save(blockContent) {
 //   return {
 //     items: JSON.parse(blockContent.attributes['data-kubik-widget-items-items-value'].value),
 //     content: JSON.parse(blockContent.attributes['data-kubik-widget-content-content-value'].value),
 //     settings: JSON.parse(blockContent.attributes['data-kubik-widget-settings-settings-value'].value)
 //   }
 // }

 // validate(savedData){
 //   return true;
 // }
