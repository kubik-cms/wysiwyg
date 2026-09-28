# Kubik WYSIWYG

Editor.js integration for Kubik CMS Active Admin: declarative widget blocks, server-rendered admin UI (ViewComponent + Turbo), and JSON stored on your models.

## Architecture

| Layer | Responsibility |
|--------|----------------|
| **Host app** | Widget definitions (JS), `wysiwyg_tools.js`, `WysiwygRenderer::*` classes, public ViewComponents/partials |
| **This gem** | `PluginFactory`, Stimulus controllers, admin field components, Turbo refresh endpoint, shared presets |

### Block JSON shape

Each custom block saves data like:

```json
{
  "content": { "title": "...", "intro": "..." },
  "settings": { "layout": "default", "element_id": "", "data_attributes": [{ "key": "track", "value": "hero" }] },
  "items": { "repeated_items": [{ "title": "...", "_ui": { "expanded": true } }] },
  "_ui": { "expanded": true, "active_tab": "settings" }
}
```

- **`_ui`** is admin-only. Strip it before public rendering with `Kubik::Wysiwyg::BlockData.strip_ui`.
- **`repeated_items[]. _ui`** stores repeater row expand/collapse in the editor.

## JavaScript API (npm `@kubik-cms/wysiwyg`)

Pin the built bundle in importmap (recommended: local `vendor/javascript/kubik_wysiwyg/wysiwyg.es.js` after `yarn build` in `package/`).

Register Stimulus controllers from the package:

```javascript
import Wysiwyg from "@kubik-cms/wysiwyg"

application.register("kubik-widget", Wysiwyg.KubikWidgetController)
application.register("kubik-repeater", Wysiwyg.KubikRepeaterController)
application.register("kubik-key-value-repeater", Wysiwyg.KubikKeyValueRepeaterController)
application.register("kubik-autocomplete", Wysiwyg.KubikAutocompleteController)
```

### `defineBlock`

Prefer `defineBlock` over subclassing `PluginFactory` manually:

```javascript
import Wysiwyg from '@kubik-cms/wysiwyg';

const { defineBlock, presets } = Wysiwyg;

export default defineBlock({
  toolbox: { title: 'Hero', icon: '<svg>...</svg>' },
  sanitize: { intro: { br: true } },
  widgetConfig: {
    widget_name: 'hero', // must match Editor.js tool key and Ruby renderer map
    icon: '<svg>...</svg>',
    tabs: [
      presets.contentTab([{ name: 'body', label: 'Body', type: 'textarea' }]),
      presets.settingsTab({
        layouts: [{ value: 'auto', label: 'Auto' }],
        extras: [{ name: 'height', type: 'select', label: 'Height', options: [] }],
      }),
    ],
  },
});
```

### Presets (`Wysiwyg.presets`)

| Helper | Purpose |
|--------|---------|
| `contentTab(extraFields?)` | Standard title, intro, link, link_text + optional fields |
| `settingsTab({ layouts, extras })` | Layout select, classes, element id |
| `standardSettingsExtras()` | `image_loading`, `data_attributes` key/value repeater |
| `thumbAndFieldsSections()` | Repeater layout sections (`thumb`, `fields`) |
| `manualItemsTab({ itemFields, ... })` | Repeated items tab |
| `resourceListSettingsTab({ filterOptions, layouts })` | Model-backed lists (filter + layout in settings) |

### Field types

| `type` | Notes |
|--------|--------|
| `text`, `textarea` | Standard inputs |
| `select`, `radio`, `checkbox`, `boolean` | Settings |
| `resource` | `model`, optional `src`, `variant: 'media'` |
| `key_value_repeater` | `fields: ['key','value']`, optional `prefix: 'data'` |
| `wysiwyg` | Nested inline HTML field |

Repeated tabs: set `repeated: true` and `repeater_settings: { add_label, summary }`.

## Host app setup

1. **Gem** in `Gemfile`: `gem 'kubik_wysiwyg', github: 'kubik-cms/wysiwyg'`
2. **Active Admin** pages `Kubik Wysiwyg` and `Kubik Wysiwyg Widget` (menu false) — provided by gem.
3. **Input**: `as: :'kubik/wysiwyg'` on JSON columns.
4. **Tools**: `app/javascript/admin/controllers/wysiwyg_tools.js` spreads `buildBaseEditorTools()` from `@kubik-cms/wysiwyg` and adds app widget classes.
5. **Render**: `Kubik::EditorRenderer` (or equivalent) maps block `type` → `WysiwygRenderer::*`.

### Editor.js link toolbar

The npm package exports:

- `DEFAULT_INLINE_TOOLBAR` — `bold`, `italic`, `underline`, `hyperlink` (no built-in Editor.js `link` tool)
- `WIDGET_INLINE_TOOLBAR` — `underline`, `hyperlink` for custom blocks
- `buildBaseEditorTools()` — paragraph, header, lists, embed, quote, underline, hyperlink
- `ensureEditorJsInlineIcons()` — call before `new EditorJS(...)` so `editorjs-hyperlink` shows the link icon

Host importmap must pin `@editorjs/*` and `editorjs-hyperlink` (see cln-booking `config/kubik_importmap.rb`). Gem styles include hyperlink icon rules in `kubik_wysiwyg/_editor_inline_tools.scss`.

### Public rendering

Always strip UI metadata:

```ruby
data = Kubik::Wysiwyg::BlockData.strip_ui(block_data)
WysiwygRenderer::Hero.new.render(data)
```

In a central renderer:

```ruby
parsed["blocks"].each do |block|
  block["data"] = Kubik::Wysiwyg::BlockData.strip_ui(block["data"]) if block["data"]
end
```

Map `settings[:data_attributes]` to HTML `data-*` in your ViewComponents (see `ComponentsHelper#transform_data_attributes`).

## Generator

```bash
bin/rails generate kubik:wysiwyg_block PromoBanner --editorjs-type=promo_banner
```

Creates:

- `app/javascript/admin/wysiwyg_widgets/promo_banner_widget/index.js`
- `app/components/wysiwyg_renderer/promo_banner.rb`
- Appends export to `wysiwyg_widgets_bundle.js`

Then register the tool and `EditorRenderer::BLOCKS` entry (generator prints reminders).

## Manual vs resource-backed lists

**Manual items** — `presets.manualItemsTab` with repeater fields; renderer reads `items.repeated_items`.

**Resource-backed** — settings hold filter keys (e.g. `faq_type`); renderer loads records in Ruby (see FAQs pattern). Use `presets.resourceListSettingsTab` for consistent settings fields.

## Development

```bash
cd package
yarn install
yarn build   # outputs dist/wysiwyg.es.js
```

Symlink or copy `dist/wysiwyg.es.js` to the host app `vendor/javascript/kubik_wysiwyg/` and pin importmap to that file (avoid stale unpkg versions).

**npm releases:** see [NPM_PUBLISHING.md](./NPM_PUBLISHING.md) — CI publishes when `package/package.json` version is bumped on `master` (secret `NPM_AUTH_TOKEN` required).

## Changelog (recent)

- **`defineBlock` + `presets`** for smaller host widget files
- **`_ui` persistence** (widget expanded, active tab, repeater row expanded)
- **Fewer full Turbo refreshes** on plain field edits; refresh on resource id changes and repeater structure changes
- **`key_value_repeater` defaults** — one empty row `{ key, value }`, not one row per field
- **`Kubik::Wysiwyg::BlockData.strip_ui`** for public output
- **`bin/rails g kubik:wysiwyg_block`**
