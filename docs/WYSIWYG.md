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

### Plain text from WYSIWYG

`Kubik::Wysiwyg::PlainText.from(content)` turns Editor.js JSON or HTML into plain text (for AI prompts, search, etc.). When `kubik_ai` is loaded, the gem registers `KubikAi.config.plain_text_from_wysiwyg` automatically. `Kubik::WysiwygPlainText` is a deprecated alias.

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
3. **Input**: `as: :'kubik/wysiwyg'` on JSON columns. Optional `disabled_tools:` (array of Editor.js tool keys) hides blocks from the toolbox for that field only, e.g. `disabled_tools: %w[hero listing]`.
4. **Tools**: `app/javascript/admin/controllers/wysiwyg_tools.js` spreads `buildBaseEditorTools()` from `@kubik-cms/wysiwyg` and adds app widget classes.
5. **Render**: `Kubik::EditorRenderer` (or equivalent) maps block `type` → `WysiwygRenderer::*`.

### Editor.js link toolbar

The npm package exports:

- `DEFAULT_INLINE_TOOLBAR` — `bold`, `italic`, `underline`, `hyperlink` (no built-in Editor.js `link` tool)
- `WIDGET_INLINE_TOOLBAR` — `underline`, `hyperlink` for custom blocks
- `buildBaseEditorTools()` — paragraph, header, lists, embed, quote, underline, hyperlink
- `ensureEditorJsInlineIcons()` — call before `new EditorJS(...)` so `editorjs-hyperlink` shows the link icon

Host importmap must pin `@editorjs/*` and `editorjs-hyperlink` (see cln-booking `config/kubik_importmap.rb`). Gem styles include hyperlink icon rules in `kubik_wysiwyg/_editor_inline_tools.scss`.

**Record-list admin (drag reorder, picker layout):** call once in the host admin bundle:

```javascript
import Wysiwyg from "@kubik-cms/wysiwyg"
Wysiwyg.applyRecordListWidgetAdminEnhancements()
```

Styles ship in `kubik_wysiwyg/_record_list_widget.scss` (turbo-frame class `kubik-wysiwyg-record-list`).

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

## Generators

Host apps scaffold site-owned widgets with Rails generators. **Canonical reference:** [GENERATORS.md](./GENERATORS.md).

```bash
bin/rails generate kubik:wysiwyg_block PromoBanner --editorjs-type=promo_banner
bin/rails generate kubik:wysiwyg_record_list Resource --model=ReadingSchools::Resource --widget-name=resources_listing
```

Each generator appends the bundle export, writes merge snippets under `docs/wysiwyg_snippets/`, and adds `docs/wysiwyg_*.md` for agents.

### Custom block (`kubik:wysiwyg_block`)

Creates widget JS, `WysiwygRenderer::*` stub, `wysiwyg_tools` + `EditorRenderer` snippets.

### Record list (`kubik:wysiwyg_record_list`)

Creates `defineRecordListBlock` JS, listing partial stubs, `register_record_list_model` initializer snippet, model stub, and tool registration snippet. Public rendering uses gem `WysiwygRenderer::RecordListing`.

## Legacy generator note

The block generator previously only printed manual next steps; it now matches the record-list generator output layout (snippets + agent doc).

## Manual vs resource-backed lists

**Manual items** — `presets.manualItemsTab` with repeater fields; renderer reads `items.repeated_items`.

**Resource-backed** — settings hold filter keys (e.g. `faq_type`); renderer loads records in Ruby (see FAQs pattern). Use `presets.resourceListSettingsTab` for consistent settings fields.

## Record list widgets (per-model)

Use **`defineRecordListBlock`** for CMS blocks that show database records (articles, resources, etc.). One thin JS file per model; shared behaviour lives in this gem.

### Host app (Ruby)

1. `include Kubik::WysiwygPickable` on the model (`return_object`, optional `wysiwyg_thumb_url`).
2. Implement `self.wysiwyg_scopes` (callables for live queries) and `self.wysiwyg_list_item(record, view_context:)` for public cards.
3. In Active Admin: `Kubik::WysiwygAutocomplete.register_collection_search!(self)` on the resource.
4. Register the model:

```ruby
KubikWysiwyg.configure do |config|
  config.register_record_list_model(
    "MyModel",
    widget_name: "my_models_listing",
    admin_search_path: -> { admin_my_models_path },
    render_partial: "my_models/listing",
    layout_partials: { "carousel" => "my_models/carousel" }
  )
end
```

5. Register the Editor.js tool key (`widget_name`) in `wysiwyg_tools.js`.

`Kubik::Wysiwyg::RecordListResolver` and `WysiwygRenderer::RecordListing` are registered automatically for each `widget_name`.

**Item source** (`settings.source`): `manual` (default, hand-picked + reorder), `live_query` (resolve on each page view). Configure source and query fields on the **Items** tab in the editor; the model class comes from `widget_model` / `defineRecordListBlock({ model: ... })` and is not edited in the UI. Optional `snapshot` (`items.snapshot_ids`) is off by default (`allowSnapshot: false`).

### Host app (JavaScript)

```javascript
import Wysiwyg from "@kubik-cms/wysiwyg"

export default Wysiwyg.defineRecordListBlock({
  toolbox: { title: "My models", icon: "<svg>...</svg>" },
  widget_name: "my_models_listing",
  model: "MyModel",
  adminSearchPath: "/my_models",
  queries: [{ value: "recent", label: "Recently added" }],
  layouts: [{ value: "default", label: "Default" }],
})
```

## Single record reference (`defineResourceReferenceBlock`)

For one picked record (e.g. a reusable Banner):

```javascript
export default Wysiwyg.defineResourceReferenceBlock({
  toolbox: { title: "Banner", icon: "<svg>...</svg>" },
  widget_name: "banner",
  model: "Banner",
  adminSearchPath: "/banners",
  referenceTabName: "banner",
  referenceFieldName: "banner",
})
```

Autocomplete hits `{adminSearchPath}/wysiwyg_search.json?kubik_search=1&q=...`.

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
- **`key_value_repeater` defaults** — empty array; blank rows are omitted until the user clicks Add
- **`Kubik::Wysiwyg::BlockData.strip_ui`** for public output
- **`bin/rails g kubik:wysiwyg_block`**
