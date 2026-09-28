const EDITORJS_INLINE_ICON_SPRITE_ID = 'kubik-editorjs-inline-icons'

// Same link/unlink symbols as Editor.js built-in Link inline tool (Codex Team).
const EDITORJS_LINK_ICON_SPRITE = `
<symbol id="link" viewBox="0 0 14 10">
  <path d="M6 0v2H5a3 3 0 000 6h1v2H5A5 5 0 115 0h1zm2 0h1a5 5 0 110 10H8V8h1a3 3 0 000-6H8V0zM5 4h4a1 1 0 110 2H5a1 1 0 110-2z"/>
</symbol>
<symbol id="unlink" viewBox="0 0 15 11">
  <path d="M13.073 2.099l-1.448 1.448A3 3 0 009 2H8V0h1c1.68 0 3.166.828 4.073 2.099zM6.929 4l-.879.879L7.172 6H5a1 1 0 110-2h1.929zM6 0v2H5a3 3 0 100 6h1v2H5A5 5 0 115 0h1zm6.414 7l2.122 2.121-1.415 1.415L11 8.414l-2.121 2.122L7.464 9.12 9.586 7 7.464 4.879 8.88 3.464 11 5.586l2.121-2.122 1.415 1.415L12.414 7z"/>
</symbol>
`

export function ensureEditorJsInlineIcons() {
  if (document.getElementById(EDITORJS_INLINE_ICON_SPRITE_ID)) return
  if (document.getElementById('link')) return

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('aria-hidden', 'true')
  svg.style.display = 'none'
  svg.id = EDITORJS_INLINE_ICON_SPRITE_ID
  svg.innerHTML = EDITORJS_LINK_ICON_SPRITE
  document.body.appendChild(svg)
}
