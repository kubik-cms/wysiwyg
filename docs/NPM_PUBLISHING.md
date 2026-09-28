# Publishing `@kubik-cms/*` JavaScript packages

Kubik gems ship a **`package/`** subdirectory (Vite build → `package/dist/`). The Ruby gem and the npm package are released from the **same repo** but **different version fields**:

| Artifact | Version file |
|----------|----------------|
| Ruby gem | `kubik_wysiwyg.gemspec` (or `*.gemspec`) |
| npm package | `package/package.json` → `"version"` |

## Do you still publish manually?

**Day to day:** bump `package/package.json` version, merge to `master`, and CI publishes to npm if the version is new.

**Optional manual publish** (emergency or without CI):

```bash
cd package
yarn install
yarn build
yarn np    # or: npm publish --access public
```

Requires npm login and permission on `@kubik-cms/*`.

## GitHub Actions (this repo)

| Workflow | When | What |
|----------|------|------|
| [`javascript.yml`](../.github/workflows/javascript.yml) | PR / push touching `package/` | `yarn build` — catches TS/Vite errors |
| [`npm-publish.yml`](../.github/workflows/npm-publish.yml) | Push to `master` touching `package/` | Build + publish if version &gt; npm registry |

### One-time repo setup

1. Create an npm **Automation** or **Publish** token for the `@kubik-cms` scope.
2. Add GitHub repository secret: **`NPM_AUTH_TOKEN`**.
3. Ensure the default branch is **`master`** (or edit workflow `branches`).

The publish step uses [pascalgn/npm-publish-action](https://github.com/pascalgn/npm-publish-action): it compares `package/package.json` version to npm and publishes only when you have bumped the version.

### Release checklist

1. Implement JS changes under `package/src/`.
2. Run locally: `cd package && yarn build`.
3. Bump **`package/package.json`** version (semver).
4. Commit built **`package/dist/*`** if your repo tracks dist (current convention).
5. Merge to **`master`** → npm publish runs automatically.
6. Bump Ruby **gemspec** version separately when you cut a Ruby gem release (RubyGems / tag — not automated here).

## Same pattern on other Kubik repos

These repos use the same layout and workflows:

- [kubik-cms/wysiwyg](https://github.com/kubik-cms/wysiwyg) — `@kubik-cms/wysiwyg`
- [kubik-cms/media_library](https://github.com/kubik-cms/media_library) — `@kubik-cms/media_library`
- [kubik-cms/kubik_interface_elements](https://github.com/kubik-cms/kubik_interface_elements) — `@kubik-cms/interface_elements`
- kubik_ai — `@kubik-cms/kubik_ai`

Copy `.github/workflows/javascript.yml` and `npm-publish.yml`; set `tag_message` to the package name. Keep `workspace: "package"`.

## Host apps (e.g. cln-booking)

After npm publish, either:

- Pin importmap to the new npm version (CDN), or
- `yarn build` in the mounted gem and use `vendor/javascript/.../dist/*.es.js` (local symlink).

See [WYSIWYG.md](./WYSIWYG.md) for importmap notes.
