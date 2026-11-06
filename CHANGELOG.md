## [Unreleased]

### Added

- Expandable navigable-link and links-repeater field templates, admin drag/inline-link JS, and Dart Sass `admin_sass_entry`.
- `KubikWysiwyg::LinkStyle` adapter for host brand style labels.
- Record-list source select blank-option handling and default active tab support.

## [0.2.10] - 2026-11-06

### Added

- `Kubik::Wysiwyg::LinkResolver` and nav-link snapshot helpers for resolving WYSIWYG link rows (URL, navigation ref, stale/broken flags).
- Editor fields: `simple_link`, `links_repeater_input`, and `title_with_heading_level` ViewComponents.
- Inline `KubikLinkTool` and navigable link panel HTML for the admin editor package.
- Tests for link resolution (`test/kubik/wysiwyg/link_resolver_test.rb`).

### Changed

- Repeater item styles (`_repeater.scss`) use `--kubik-repeater-*` custom properties; `.kubik-wysiwyg-repeated-item__compact` overrides density (header padding, summary type).
- Navigable link field markup and Stimulus wiring aligned with **kubik_navigation** navigable link editor.
- Tabbed content, field binding, visibility, and shared field chrome (select/text input/navigable link).
- Field presets and widget controller behaviour; `_field_styles.scss` updates.
- Rebuilt `@kubik-cms/wysiwyg` dist (`package/dist/*`).

### Package

- Bump `@kubik-cms/wysiwyg` to **0.1.29**, `npm run build` in `package/`, then `bin/kubik-gems sync --link-js` in host apps.

### Ruby gem

- Bump `kubik_wysiwyg` gemspec patch (currently **0.2.9**); host apps: `bundle update kubik_wysiwyg`.

## [0.2.9] - 2026-11-04

### Added

- Record list block, `WysiwygRenderer::RecordListing`, and record-list model configuration for DB-backed listing widgets.
- Resource reference block for pickable CMS records in the editor.
- Rails generators `kubik:wysiwyg_block` and `kubik:wysiwyg_record_list` with host-app checklist docs.
- Widget field presets, conditional visibility, and field binding for tabbed editor fields.
- Navigable link field component and Stimulus navigable picker (optional kubik_navigation integration).
- `Wysiwyg.applyRecordListWidgetAdminEnhancements()`, record list admin JS, and `_record_list_widget` styles.
- WYSIWYG autocomplete and pickable helpers; agent docs (`docs/AGENTS.md`, `FIELD_PRESETS.md`, `GENERATORS.md`).

### Package

- `@kubik-cms/wysiwyg` **0.1.28** (rebuild `package/` and run `bin/kubik-gems sync --link-js` in host apps).

### Changed

- Widget loading, tabbed content layout, and media-type field refresh in the admin editor.

## [0.2.8] - 2026-10-13

### Added

- `KubikNavigableLinkTool` inline tool and toolbar entry for navigation/resource/url links. Optional; hyperlink still works without kubik_navigation.

## [0.1.0] - 2022-07-26

- Initial release
