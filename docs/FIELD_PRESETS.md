# WYSIWYG field presets (`@kubik-cms/wysiwyg`)

Host apps and generators should compose widget tabs from **`Wysiwyg.presets`** (re-exported field helpers from `package/src/field_presets.js`).

## Media

| Helper | Purpose |
|--------|---------|
| `imageResourceField({ name, label, hint, … })` | Kubik media library image picker (`variant: 'media'`) |
| `documentResourceField({ … })` | Downloadable file picker (`variant: 'document'`) |
| `mediaTypeField` / `mediaTypeSelectField({ types })` | Image / video / document selector |
| `mediaTabFields({ mode: 'full' \| 'content_with_media' })` | Image + video fields (CWM omits poster URL; uses image picker) |

## Typography / listing items

| Helper | Purpose |
|--------|---------|
| `headingLevelField({ name, label, options })` | Configurable H2–H6 select |
| `titleWithHeadingLevel({ titleName, levelName, levels })` | Title + heading level pair |
| `standardListingItemFields({ includeHeadingLevel, includeDataAttributes })` | Manual list row fields |
| `standardListingItemTabConfig(…)` | `{ sections, fields }` for `manualItemsTab` |

## Links

| Helper | Purpose |
|--------|---------|
| `urlLinkFields()` | Plain URL + link text |
| `navigableLinkField()` | `type: 'navigable_link'` when `meta[name=kubik-navigable-wysiwyg]` is `true` |
| `linkFieldsForHost({ preferNavigable: 'auto' })` | Navigable or URL fields |
| `linksKeyValueRepeater({ styleOptions, … })` | Button/link rows with optional select columns via `field_config` |

Use `presets.contentTab(extraFields, { links: 'navigable_auto' })` for content tabs that should use navigable links when **kubik_navigation** is loaded.

## Admin bootstrap (host app)

In `admin_with_wysiwyg.js` (once):

```javascript
import Wysiwyg from "@kubik-cms/wysiwyg"
import KubikNavigablePickerController from "kubik_wysiwyg/kubik_navigable_picker_controller"

application.register("kubik-key-value-repeater", Wysiwyg.KubikKeyValueRepeaterController)
application.register("kubik-navigable-picker", KubikNavigablePickerController)

Wysiwyg.applyKubikWysiwygWidgetLoading()
Wysiwyg.applyRecordListWidgetAdminEnhancements()
Wysiwyg.installMediaTypeChangeRefresh()
```

Rebuild the npm package after gem JS changes: `cd package && npm run build`, then sync `vendor/javascript/kubik_wysiwyg/wysiwyg.es.js` in the host app.
