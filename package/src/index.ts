import KubikWidgetController from "./controllers/kubik_widget_controller"
import KubikRepeaterController from "./controllers/kubik_repeater_controller"
import KubikKeyValueRepeaterController from "./controllers/kubik_key_value_repeater_controller"
import KubikAutocompleteController from "./controllers/kubik_autocomplete_controller"
import PluginFactory from "./plugins/plugin_factory"
import { defineBlock } from "./define_block"
import { presets } from "./block_presets"
import { defineRecordListBlock } from "./record_list_block"
import { defineResourceReferenceBlock } from "./resource_reference_block"
import { DEFAULT_INLINE_TOOLBAR, WIDGET_INLINE_TOOLBAR } from "./editor/inline_toolbar"
import { ensureEditorJsInlineIcons } from "./editor/editor_icons"
import { buildBaseEditorTools } from "./editor/base_editor_tools"
import KubikNavigableLinkTool from "./editor/navigable_link_tool"
import { applyRecordListWidgetAdminEnhancements } from "./admin/record_list_widget_admin"
import applyKubikWysiwygWidgetLoading from "./admin/widget_loading"
import installMediaTypeChangeRefresh from "./admin/media_type_field_refresh"
import * as fieldPresets from "./field_presets"

export default {
  KubikNavigableLinkTool,
  KubikWidgetController,
  KubikRepeaterController,
  KubikKeyValueRepeaterController,
  PluginFactory,
  KubikAutocompleteController,
  defineBlock,
  defineRecordListBlock,
  defineResourceReferenceBlock,
  presets,
  DEFAULT_INLINE_TOOLBAR,
  WIDGET_INLINE_TOOLBAR,
  ensureEditorJsInlineIcons,
  buildBaseEditorTools,
  applyRecordListWidgetAdminEnhancements,
  applyKubikWysiwygWidgetLoading,
  installMediaTypeChangeRefresh,
  fieldPresets,
}

export {
  KubikNavigableLinkTool,
  KubikWidgetController,
  KubikRepeaterController,
  KubikKeyValueRepeaterController,
  PluginFactory,
  KubikAutocompleteController,
  defineBlock,
  defineRecordListBlock,
  defineResourceReferenceBlock,
  presets,
  DEFAULT_INLINE_TOOLBAR,
  WIDGET_INLINE_TOOLBAR,
  ensureEditorJsInlineIcons,
  buildBaseEditorTools,
  applyRecordListWidgetAdminEnhancements,
  applyKubikWysiwygWidgetLoading,
  installMediaTypeChangeRefresh,
  fieldPresets,
}
