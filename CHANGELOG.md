## [Unreleased]

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
