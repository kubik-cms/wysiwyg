import PluginFactory from './plugins/plugin_factory'

/**
 * Declarative Editor.js block: pass toolbox, optional sanitize, and widgetConfig.
 */
export function defineBlock({ toolbox, sanitize = {}, widgetConfig }) {
  if (!toolbox || !widgetConfig) {
    throw new Error('defineBlock requires toolbox and widgetConfig')
  }

  return class extends PluginFactory {
    static get toolbox() {
      return toolbox
    }

    static get sanitize() {
      return sanitize
    }

    static get widgetConfig() {
      return widgetConfig
    }
  }
}
