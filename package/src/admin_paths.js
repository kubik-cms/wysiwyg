export function activeAdminPath() {
  return document.querySelector("meta[name='active-admin-path']")?.content || "/admin"
}

export function kubikWysiwygWidgetSrc() {
  return document.querySelector("meta[name='kubik-wysiwyg-widget-src']")?.content
    || `${activeAdminPath()}/kubik_wysiwyg_widget/show`
}

export function kubikMediaUploadsModalSrc() {
  return document.querySelector("meta[name='kubik-media-uploads-src']")?.content
    || `${activeAdminPath()}/kubik_media_uploads?modal=true&media_type=image`
}
