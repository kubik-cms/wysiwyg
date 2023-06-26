import { widgetWrapper } from './templates/widget_wrapper'

export default class PluginFactory {

  static get defaultWidgetConfig() {
    return {
      data_src: '/admin/kubik_wysiwyg_widget/show'
    }
  }

  constructor({ data, api }) {
    this.data = data;
    this.api = api;
    this.randomString = Math.random().toString(36).substring(2,7);
    this.label = this.constructor.toolbox.title;
    const defaultConfig = this.constructor.defaultWidgetConfig
    const localConfig = this.constructor.widgetConfig

    this.config = Object.assign(
      defaultConfig,
      localConfig
    )
  }

  render() {
    const widgetId = [this.config.widget_name, this.randomString].join('-')

    //const dataPoint = this.api.ui.nodes.wrapper.parentElement.dataset.editorWidgetsValue

    const wrapper = widgetWrapper({
      setup: {
        label: this.label,
        widget_model: this.config.widget_model,
        src: this.config.data_src,
        widget_id: widgetId,
        widget_type: this.config.widget_name,
        config: this.config
      },
    }, this.data)

    return wrapper;
  }

  save(blockContent) {
    const data = JSON.parse(blockContent.attributes['data-kubik-widget-data-value'].value)
    let widgetData = {}
    this.config.tabs.forEach((tab) => {
      widgetData[tab['name']] = data[tab['name']]
    })
    return widgetData;
  }

  validate(savedData){
    return true;
  }
}
