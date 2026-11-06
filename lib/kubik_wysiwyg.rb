# frozen_string_literal: true
require "activeadmin"
require "view_component"
require_relative "kubik/wysiwyg/block_data"
require_relative "kubik_wysiwyg/configuration"
require_relative "kubik_wysiwyg/link_style"
require_relative "kubik_wysiwyg/record_list_model_config"
require_relative "kubik/wysiwyg/wysiwyg_pickable"
require_relative "kubik/wysiwyg/wysiwyg_autocomplete"
require_relative "kubik/wysiwyg/record_list_resolver"
require_relative "kubik/wysiwyg/link_resolver"
require_relative "kubik/wysiwyg/nav_link_snapshot"
require_relative "kubik/wysiwyg/snapshots_nav_links"
require_relative "wysiwyg_renderer"

module KubikWysiwyg
  module Rails
    class Engine < ::Rails::Engine
      config.assets.paths << root.join("app/assets/javascripts")
      config.assets.precompile += %w[
        kubik_wysiwyg.js
        kubik_wysiwyg/admin_editor_patches.js
        kubik_wysiwyg/admin_ui_enhancements.js
        kubik_wysiwyg/wysiwyg_editor_controller.js
        kubik_wysiwyg/kubik_navigable_picker_controller.js
        kubik_wysiwyg/wysiwyg_links_repeater_admin.js
        kubik_wysiwyg/wysiwyg_media_widget_drag_reorder.js
        kubik_wysiwyg/wysiwyg_inline_link_admin.js
        kubik_wysiwyg/wysiwyg_navigable_link_admin.js
        kubik_wysiwyg/media_management_fields.js
        kubik_wysiwyg/record_listing_block.js
      ]
      config.autoload_paths << root.join("app/inputs")

      # ActiveAdmin DSL files (register_page blocks) must not be Zeitwerk-managed.
      initializer "kubik_wysiwyg.ignore_admin_for_zeitwerk", before: :setup_main_autoloader do
        admin_dir = root.join("app/admin").to_s
        ::Rails.autoloaders.main.ignore(admin_dir)
        ::Rails.autoloaders.once.ignore(admin_dir) if ::Rails.autoloaders.respond_to?(:once)
      end

      initializer "kubik_wysiwyg.active_admin_load_paths", after: "active_admin.load_app_path" do
        admin_dir = root.join("app/admin")
        paths = ::ActiveAdmin.application.load_paths
        paths << admin_dir unless paths.map(&:to_s).include?(admin_dir.to_s)
      end

      initializer "kubik_wysiwyg.autoloading", before: :set_autoload_paths do
        lib_kubik = root.join("lib/kubik")
        ::Rails.autoloaders.main.push_dir(lib_kubik, namespace: Kubik)
        ::Rails.autoloaders.main.collapse(root.join("lib/kubik/components"))
        ::Rails.autoloaders.main.collapse(root.join("lib/kubik/components/wysiwyg/image_component"))
        ::WysiwygRenderer = Module.new unless defined?(::WysiwygRenderer)
        ::Rails.autoloaders.main.push_dir(root.join("lib/wysiwyg_renderer"), namespace: ::WysiwygRenderer)
      end

      initializer "kubik_wysiwyg.view_paths" do
        ::Rails.application.config.paths["app/views"] << root.join("app/views")
      end

      initializer "kubik_wysiwyg.helper" do
        ActiveSupport.on_load(:action_controller) do
          helper Kubik::WysiwygHelper
        end
      end

      initializer "kubik_wysiwyg.kubik_ai_plain_text", after: :load_config_initializers do
        next unless defined?(KubikAi)

        KubikAi.configure do |config|
          config.plain_text_from_wysiwyg ||= ->(raw) { Kubik::Wysiwyg::PlainText.from(raw) }
        end
      end

      initializer "kubik_wysiwyg.remove_admin_from_eager_load", after: :set_load_path do
        admin_dir = root.join("app/admin").to_s
        config.eager_load_paths.delete(admin_dir)
        config.autoload_paths.delete(admin_dir)
        ::Rails.application.config.eager_load_paths.delete(admin_dir)
        ::Rails.application.config.autoload_paths.delete(admin_dir)
      end

      initializer "kubik_wysiwyg.importmap_pin", after: :load_config_initializers do
        map = ::Rails.application.config.kubik_importmap
        next unless map

        js = root.join("app/assets/javascripts/kubik_wysiwyg/admin_editor_patches.js")
        next unless js.exist?

        {
          "kubik_wysiwyg/admin_editor_patches" => true,
          "kubik_wysiwyg/admin_ui_enhancements" => true,
          "kubik_wysiwyg/wysiwyg_editor_controller" => false,
          "kubik_wysiwyg/kubik_navigable_picker_controller" => false,
          "kubik_wysiwyg/wysiwyg_links_repeater_admin" => false,
          "kubik_wysiwyg/wysiwyg_media_widget_drag_reorder" => false,
          "kubik_wysiwyg/wysiwyg_inline_link_admin" => false,
          "kubik_wysiwyg/wysiwyg_navigable_link_admin" => false,
          "kubik_wysiwyg/media_management_fields" => false,
          "kubik_wysiwyg/record_listing_block" => false,
        }.each do |name, preload|
          path = "#{name}.js"
          next unless root.join("app/assets/javascripts", path).exist?

          map.pin name, to: path, preload: preload
        end
      end

      initializer "kubik_wysiwyg.active_admin_head" do
        require_relative "kubik_wysiwyg/active_admin_head_extension"
        ActiveAdmin::Views::Pages::Base.prepend(KubikWysiwyg::ActiveAdminHeadExtension)
      end
    end
  end
end
