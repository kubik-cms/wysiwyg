import Wysiwyg from '@kubik-cms/wysiwyg';

const { defineBlock, presets } = Wysiwyg;

function activeAdminPath() {
  const meta = document.querySelector("meta[name='active-admin-path']");
  return meta?.content || '/admin';
}

function normalizeSearchPath(adminSearchPath) {
  const base = activeAdminPath().replace(/\/$/, '');
  let path = adminSearchPath.startsWith('/') ? adminSearchPath : `/${adminSearchPath}`;
  if (!path.startsWith(base)) {
    path = `${base}${path}`;
  }
  if (!path.endsWith('/wysiwyg_search')) {
    path = `${path.replace(/\/$/, '')}/wysiwyg_search`;
  }
  return path;
}

function defaultRecordItemFields(model, adminSearchPath) {
  return [
    {
      name: 'record',
      label: 'Record',
      model,
      type: 'resource',
      src: normalizeSearchPath(adminSearchPath),
      section: 'thumb',
    },
  ];
}

/** Content tab: title + title heading level (paired), intro, link fields. */
export function recordListContentTab({
  titleHeadingLevels,
  defaultTitleHeadingLevel = 'h2',
  contentLinks = 'default',
} = {}) {
  const introAndLinks = presets.contentTab([], { links: contentLinks }).fields.filter(
    (field) => field.name !== 'title',
  );

  const titleHeadingLevelFields = presets.titleWithHeadingLevel({
    titleName: 'title',
    levelName: 'title_header_level',
    ...(titleHeadingLevels ? { levels: titleHeadingLevels } : {}),
    defaultLevel: defaultTitleHeadingLevel,
  });

  return {
    name: 'content',
    label: 'Content',
    fields: [...titleHeadingLevelFields, ...introAndLinks],
  };
}

/**
 * Record list blocks with title + heading level on the Content tab.
 * Public default heading remains h2 when unset (see WysiwygRenderer::HeadingTag).
 */
export default function defineAppRecordListBlock({
  toolbox,
  sanitize = { intro: { br: true } },
  widget_name,
  model,
  adminSearchPath,
  itemFields,
  itemSections,
  queries = [],
  layouts = [],
  settingsExtras = [],
  addLabel = 'Add item',
  allowLiveQuery = true,
  allowSnapshot = false,
  titleHeadingLevels,
  defaultTitleHeadingLevel = 'h2',
  contentLinks = 'default',
}) {
  if (!toolbox || !widget_name || !model || !adminSearchPath) {
    throw new Error('defineAppRecordListBlock requires toolbox, widget_name, model, and adminSearchPath');
  }

  const fields = (itemFields || defaultRecordItemFields(model, adminSearchPath)).map((field) => {
    if (field.type === 'resource' && !field.src) {
      return { ...field, src: normalizeSearchPath(adminSearchPath) };
    }
    return field;
  });

  return defineBlock({
    toolbox,
    sanitize,
    widgetConfig: {
      widget_name,
      widget_model: model,
      icon: toolbox.icon,
      tabs: [
        presets.recordListItemsTab({
          model,
          adminSearchPath,
          itemFields: fields,
          ...(itemSections ? { sections: itemSections } : {}),
          addLabel,
          queries,
          allowLiveQuery,
          allowSnapshot,
        }),
        recordListContentTab({ titleHeadingLevels, defaultTitleHeadingLevel, contentLinks }),
        presets.recordListSettingsTab({
          layouts,
          extras: settingsExtras,
        }),
      ],
    },
  });
}
