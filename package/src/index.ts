import KubikWidgetController from "./controllers/kubik_widget_controller"
import KubikRepeaterController from "./controllers/kubik_repeater_controller"
import KubikKeyValueRepeaterController from "./controllers/kubik_key_value_repeater_controller"
import KubikAutocompleteController from "./controllers/kubik_autocomplete_controller"
import PluginFactory from "./plugins/plugin_factory"
import { defineBlock } from "./define_block"
import { presets } from "./block_presets"
import { DEFAULT_INLINE_TOOLBAR, WIDGET_INLINE_TOOLBAR } from "./editor/inline_toolbar"
import { ensureEditorJsInlineIcons } from "./editor/editor_icons"
import { buildBaseEditorTools } from "./editor/base_editor_tools"

export default {
  KubikWidgetController,
  KubikRepeaterController,
  KubikKeyValueRepeaterController,
  PluginFactory,
  KubikAutocompleteController,
  defineBlock,
  presets,
  DEFAULT_INLINE_TOOLBAR,
  WIDGET_INLINE_TOOLBAR,
  ensureEditorJsInlineIcons,
  buildBaseEditorTools,
}

export {
  KubikWidgetController,
  KubikRepeaterController,
  KubikKeyValueRepeaterController,
  PluginFactory,
  KubikAutocompleteController,
  defineBlock,
  presets,
  DEFAULT_INLINE_TOOLBAR,
  WIDGET_INLINE_TOOLBAR,
  ensureEditorJsInlineIcons,
  buildBaseEditorTools,
}
