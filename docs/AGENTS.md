# kubik_wysiwyg — agent guide

Use this when adding or changing Kubik CMS WYSIWYG blocks in a host Rails app.

**Start here for new widgets:** [GENERATORS.md](./GENERATORS.md) — consistent Rails generators that drop skeleton files into host apps. Site-specific rendering stays in the app; shared editor behaviour stays in the gem.

## Where code lives

| Layer | Location |
|--------|-----------|
| **Gem (shared)** | GitHub `kubik-cms/wysiwyg` — npm `@kubik-cms/wysiwyg`, admin SCSS, presets, record-list admin JS, `WysiwygRenderer::RecordListing` |
| **Host app** | Generated + customised: `wysiwyg_widgets/*`, `wysiwyg_renderer/*`, listing partials, `kubik_wysiwyg_record_lists.rb`, `wysiwyg_tools.js` |

After gem or npm changes: `cd /path/to/wysiwyg/package && yarn build`, then host `bin/kubik-gems sync --link-js`.

## Generators (host app)

| Command | Use when |
|---------|----------|
| `bin/rails g kubik:wysiwyg_block Name` | Custom block — you own renderer + tab fields |
| `bin/rails g kubik:wysiwyg_record_list Name` | DB-backed list — Items / Content / Settings |

Each run creates widget JS, merge snippets under `docs/wysiwyg_snippets/`, and `docs/wysiwyg_*.md` checklist.

Record-list hosts must call `Wysiwyg.applyRecordListWidgetAdminEnhancements()` once in the admin bundle.

## Docs

- [GENERATORS.md](./GENERATORS.md) — skeleton workflow
- [WYSIWYG.md](./WYSIWYG.md) — JS/Ruby API
- Host `docs/wysiwyg_integration.md` — site block inventory (per project)
