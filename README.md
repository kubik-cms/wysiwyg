# kubik_versionable

Editorial content versions with a single live published snapshot for Kubik CMS.

Depends on [kubik_publishable](https://github.com/kubik-cms/kubik_publishable).

## Installation

```ruby
gem "kubik_versionable", github: "kubik-cms/kubik_versionable"
```

For local development, use `path: "vendor/kubik_versionable"` or a devcontainer mount at `/kubik_versionable`.

```bash
bundle install
bin/rails generate kubik:versionable:install
bin/rails db:migrate
```

Add a `published_version` reference on each versionable model in a host migration (foreign key to `kubik_content_versions`).

## Usage

```ruby
class Page < ApplicationRecord
  include Kubik::Versionable

  kubik_versionable fields: %i[title body], meta_tag: true
end
```

`Kubik::Versionable` includes `Kubik::AdminContentVersioning` for admin snapshot helpers (`admin_content_snapshot_for`, version selector options, etc.).

### ActiveAdmin

- Member actions: `Kubik::VersionableAdminAction` (create / publish / duplicate versions).
- Edit-form versioning: `include Kubik::ContentVersionAdminSupport` in the ActiveAdmin resource.

### Styles

In `active_admin.scss`:

```scss
@import "kubik_versionable/content_versions";
```

Admin versioning UI partials remain in the host app (resource-specific preview routes).

Public site reads use `published_snapshot`.
