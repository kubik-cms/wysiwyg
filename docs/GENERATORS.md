# WYSIWYG generators (host app skeleton)

Use these Rails generators in **host applications** to scaffold new Editor.js blocks. The gem owns shared admin UX, presets, and record-list rendering; **each site owns widget JS, Ruby renderers/partials, and design-system markup**.

Run from the host app root (with `kubik_wysiwyg` in the Gemfile):

```bash
bin/rails g kubik:wysiwyg_block …      # custom block (tabs you define in JS)
bin/rails g kubik:wysiwyg_record_list … # CMS records: Items + Content + Settings
```

After generation, complete the merge snippets and checklists under `docs/wysiwyg_*` created for that widget.

---

## Which generator?

| Goal | Generator | Public rendering |
|------|-----------|------------------|
| Marketing / layout block (hero, CTA band, accordion, …) | `kubik:wysiwyg_block` | Host `WysiwygRenderer::*` or ViewComponent |
| List of database records (pick or live query) | `kubik:wysiwyg_record_list` | Gem `WysiwygRenderer::RecordListing` + host partials |

---

## `kubik:wysiwyg_block`

```bash
bin/rails g kubik:wysiwyg_block PromoBanner \
  --editorjs-type=promo_banner \
  --toolbox-title="Promo banner"
```

**Creates**

| Output | Purpose |
|--------|---------|
| `app/javascript/admin/wysiwyg_widgets/promo_banner_widget/index.js` | `defineBlock` + `presets` starter |
| `app/components/wysiwyg_renderer/promo_banner.rb` | Renderer stub (`RenderContext`, `strip_ui`) |
| `app/javascript/admin/wysiwyg_widgets_bundle.js` | Export line (appended) |
| `docs/wysiwyg_block_promo_banner.md` | Agent / developer checklist |
| `docs/wysiwyg_snippets/promo_banner/wysiwyg_tools.js` | Paste into `wysiwyg_tools.js` |
| `docs/wysiwyg_snippets/promo_banner/editor_renderer.rb` | Paste into host `kubik_editor_renderer` prepend |

**You still implement:** tab fields in JS, real rendering (component/partial), site SCSS if needed.

---

## `kubik:wysiwyg_record_list`

```bash
bin/rails g kubik:wysiwyg_record_list Resource \
  --model=ReadingSchools::Resource \
  --widget-name=resources_listing \
  --toolbox-title="Resources listing" \
  --admin-search-path=reading_schools_resources \
  --queries=recent_published:Recently\ published,by_resource_type:By\ resource\ type \
  --layouts=small:Small,large:Large \
  --default-layout=large
```

**Creates**

| Output | Purpose |
|--------|---------|
| `app/javascript/admin/wysiwyg_widgets/resources_listing_widget/index.js` | `defineRecordListBlock` |
| `app/views/…/{small,large}_partial.html.erb` | Public layout stubs (customise per site) |
| `config/initializers/kubik_wysiwyg_record_lists_resource.rb` | Merge into `kubik_wysiwyg_record_lists.rb` |
| `docs/wysiwyg_record_list_resource.md` | Checklist |
| `docs/wysiwyg_snippets/resources_listing/wysiwyg_tools.js` | Paste into `wysiwyg_tools.js` |
| `docs/wysiwyg_snippets/resources_listing/model_wysiwyg.rb` | Copy pickable/scopes/list_item onto model |

**One-time host setup (record lists):** `Wysiwyg.applyRecordListWidgetAdminEnhancements()` in admin bundle; gem SCSS via `kubik_wysiwyg/kubik_wysiwyg`.

**You still implement:** `wysiwyg_list_item`, `wysiwyg_scopes`, AA autocomplete, helper normalisers, Card/ViewComponent markup in partials.

---

## Consistent workflow (agents)

1. Pick generator type (table above).
2. Run generator with `--toolbox-title` and correct `--editorjs-type` / `--widget-name`.
3. Merge Ruby snippets (initializer or `EditorRenderer#blocks`).
4. Paste `wysiwyg_tools.js` snippet; ensure bundle export exists.
5. Follow the generated `docs/wysiwyg_*.md` for that widget.
6. Customise rendering only in the host app — do not fork gem presets unless adding a new shared pattern.

---

## npm / gem sync

When changing `kubik_wysiwyg` package or styles:

```bash
cd path/to/wysiwyg/package && yarn build
# host:
bin/kubik-gems sync --link-js
```

See [AGENTS.md](./AGENTS.md) and [WYSIWYG.md](./WYSIWYG.md).
