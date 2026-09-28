import { widgetWrapper } from './templates/widget_wrapper';

function uiFromData(data) {
  if (!data || typeof data !== 'object') return {};
  return data._ui && typeof data._ui === 'object' ? data._ui : {};
}

export default class PluginFactory {

  static get defaultWidgetConfig() {
    return {
      data_src: '/admin/kubik_wysiwyg_widget/show'
    }
  }

  constructor({ data, api }) {
    this.data = data || {};
    this.api = api;
    this.randomString = Math.random().toString(36).substring(2,7);
    this.label = this.constructor.toolbox.title;
    const defaultConfig = this.constructor.defaultWidgetConfig
    const localConfig = this.constructor.widgetConfig

    this.config = Object.assign(
      defaultConfig,
      localConfig
    )

    const ui = uiFromData(this.data);
    if (this.data.expanded !== undefined && ui.expanded === undefined) {
      this.data = Object.assign({}, this.data, {
        _ui: Object.assign({}, ui, { expanded: this.data.expanded })
      });
    }
  }

  render() {
    const widgetId = [this.config.widget_name, this.randomString].join('-')
    const widgetClass = `widget_${this.api.ui.nodes.wrapper.parentElement.dataset.editorId}`

    const wrapper = widgetWrapper({
      setup: {
        label: this.label,
        widget_model: this.config.widget_model,
        src: this.config.data_src,
        widget_id: widgetId,
        widget_type: this.config.widget_name,
        widget_class: widgetClass,
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
    if (data._ui) {
      widgetData._ui = data._ui
    } else if (data.expanded !== undefined) {
      widgetData._ui = { expanded: data.expanded }
    }
    return widgetData;
  }

  validate(savedData){
    return true;
  }
}
