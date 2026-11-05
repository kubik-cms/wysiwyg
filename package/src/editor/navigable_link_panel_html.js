const TARGET_OPTIONS = [
  ["Same tab", ""],
  ["New tab", "_blank"],
  ["Parent frame", "_parent"],
  ["Top frame", "_top"],
]

const REL_OPTIONS = [
  ["None", ""],
  ["noopener noreferrer", "noopener noreferrer"],
  ["noopener", "noopener"],
  ["noreferrer", "noreferrer"],
  ["nofollow", "nofollow"],
  ["sponsored", "sponsored"],
  ["ugc", "ugc"],
]

function kubikNavigableWysiwygEnabled() {
  const meta = document.querySelector("meta[name='kubik-navigable-wysiwyg']")
  return meta?.content === "true"
}

function navigableMeta() {
  const search = document.querySelector("meta[name='kubik-navigable-search-url']")
  const filters = document.querySelector("meta[name='kubik-navigable-filter-options']")
  return {
    searchUrl: search?.content,
    filterOptions: filters?.content ? JSON.parse(filters.content) : [],
  }
}

function buildSelectOptions(pairs, selected) {
  return pairs
    .map(
      ([label, value]) =>
        `<option value="${value.replace(/"/g, "&quot;")}"${value === selected ? " selected" : ""}>${label}</option>`,
    )
    .join("")
}

function buildFilterOptions(filterOptions) {
  return filterOptions
    .map(
      (o) =>
        `<option value="${String(o.key).replace(/"/g, "&quot;")}">${String(o.label).replace(/</g, "&lt;")}</option>`,
    )
    .join("")
}

export function navigableLinkPanelInnerHtml({ selectedText = "", filterOptions = [] } = {}) {
  const { searchUrl } = navigableMeta()
  return `<div class="kubik-navigable-link"
       data-controller="kubik-navigable-link"
       data-kubik-navigable-link-search-url-value="${searchUrl || ""}"
       data-kubik-navigable-link-filter-options-value='${JSON.stringify(filterOptions).replace(/'/g, "&#39;")}'
       data-kubik-navigable-link-editing-value="true">
    <div class="kubik-navigable-link__editor" data-kubik-navigable-link-target="editor">
      <div class="kubik-navigable-link__metadata kubik-wysiwyg-link-metadata">
        <div class="input">
          <label class="label">Link text</label>
          <input type="text" class="input" value="${(selectedText || "").replace(/"/g, "&quot;")}"
                 data-kubik-navigable-link-target="text"
                 data-action="input->kubik-navigable-link#syncHidden" />
        </div>
        <div class="input select">
          <label class="label">Target</label>
          <select data-kubik-navigable-link-target="linkTarget" data-action="change->kubik-navigable-link#syncHidden">
            ${buildSelectOptions(TARGET_OPTIONS, "")}
          </select>
        </div>
        <div class="input select">
          <label class="label">Rel</label>
          <select data-kubik-navigable-link-target="linkRel" data-action="change->kubik-navigable-link#syncHidden">
            ${buildSelectOptions(REL_OPTIONS, "")}
          </select>
        </div>
      </div>
      <div class="kubik-navigable-link__primary-row">
        <div class="input select kubik-navigable-link__mode">
          <label class="label">Link to</label>
          <select data-kubik-navigable-link-target="mode" data-action="change->kubik-navigable-link#modeChange">
            <option value="system" selected>System</option>
            <option value="manual">URL</option>
          </select>
        </div>
        <div class="input kubik-navigable-link__query-wrap kubik-navigable-link__system-control">
          <label class="label">Destination</label>
          <input type="text" class="input" placeholder="Search pages and navigation…" autocomplete="off"
                 data-kubik-navigable-link-target="query"
                 data-action="focus->kubik-navigable-link#queryFocus input->kubik-navigable-link#queryInput keydown->kubik-navigable-link#queryKeydown" />
          <div class="kubik-navigable-link__results" hidden data-kubik-navigable-link-target="resultsPanel"
               data-action="click->kubik-navigable-link#resultClick"></div>
        </div>
        <div class="input select kubik-navigable-link__filter kubik-navigable-link__system-control">
          <label class="label">Filter</label>
          <select data-kubik-navigable-link-target="filter" data-action="change->kubik-navigable-link#filterChange">
            ${buildFilterOptions(filterOptions)}
          </select>
        </div>
        <div class="input kubik-navigable-link__manual-url kubik-navigable-link__manual-url--hidden" data-kubik-navigable-link-target="manualUrl">
          <label class="label">URL</label>
          <input type="text" class="input" placeholder="https://example.com or /path" disabled
                 data-kubik-navigable-link-target="hrefManual"
                 data-action="input->kubik-navigable-link#hrefInput blur->kubik-navigable-link#manualHrefBlur" />
        </div>
      </div>
      <div class="kubik-navigable-link__system-url-row" data-kubik-navigable-link-target="systemUrlRow">
        <div class="input kubik-navigable-link__href-wrap">
          <label class="label">URL</label>
          <input type="text" class="input kubik-navigable-link__href kubik-navigable-link__href--locked" readonly tabindex="-1"
                 placeholder="Resolved from destination"
                 data-kubik-navigable-link-target="hrefSystem" data-action="input->kubik-navigable-link#hrefInput" />
        </div>
        <div class="kubik-navigable-link__url-actions">
          <button type="button" class="kubik-navigable-link__icon-btn" title="Edit URL" aria-label="Edit URL"
                  data-kubik-navigable-link-target="urlEdit" data-action="kubik-navigable-link#startUrlEdit">
            <span class="material-symbols-outlined" aria-hidden="true">edit</span>
          </button>
          <button type="button" class="kubik-navigable-link__icon-btn" title="Cancel" aria-label="Cancel URL edit" hidden
                  data-kubik-navigable-link-target="urlCancel" data-action="kubik-navigable-link#cancelUrlEdit">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
          <button type="button" class="kubik-navigable-link__icon-btn kubik-navigable-link__icon-btn--approve" title="Approve" aria-label="Approve URL" hidden
                  data-kubik-navigable-link-target="urlApprove" data-action="kubik-navigable-link#approveUrlEdit">
            <span class="material-symbols-outlined" aria-hidden="true">check</span>
          </button>
        </div>
      </div>
      <input type="hidden" value="{}" data-kubik-navigable-link-target="value" />
    </div>
  </div>`
}

export { kubikNavigableWysiwygEnabled, navigableMeta, buildSelectOptions, TARGET_OPTIONS, REL_OPTIONS }
