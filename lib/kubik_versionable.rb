# frozen_string_literal: true

require "kubik_publishable"

module KubikVersionable
  class Error < StandardError; end

  module Rails
    class Engine < ::Rails::Engine
      isolate_namespace KubikVersionable

      config.autoload_paths += Dir["#{root}/app/models"]

      initializer "kubik_versionable.assets" do |app|
        app.config.assets.paths << root.join("app/assets/stylesheets")
      end
    end
  end
end

module Kubik
  require "kubik/admin/content_version_snapshot"
  require "kubik/admin_content_versioning"
  require "kubik/content_version_admin_support"
  require "kubik/versionable"
  require "kubik/versionable/public_view"
  require "kubik/versionable_admin_action"
end
