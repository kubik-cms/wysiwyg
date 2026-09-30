# frozen_string_literal: true
require "activeadmin"
require "view_component"
require_relative "kubik/wysiwyg/block_data"

module KubikWysiwyg
  module Rails
    class Engine < ::Rails::Engine
      config.assets.paths << root.join("app/assets/javascripts")
      config.assets.precompile += %w[
        kubik_wysiwyg.js
        kubik_wysiwyg/admin_editor_patches.js
        kubik_wysiwyg/wysiwyg_editor_controller.js
      ]
      config.autoload_paths << root.join("app/inputs")

      # ActiveAdmin DSL files (register_page blocks) must not be Zeitwerk-managed.
      initializer "kubik_wysiwyg.ignore_admin_for_zeitwerk", before: :setup_main_autoloader do
        admin_dir = root.join("app/admin").to_s
        ::Rails.autoloaders.main.ignore(admin_dir)
        ::Rails.autoloaders.once.ignore(admin_dir) if ::Rails.autoloaders.respond_to?(:once)
      end

      initializer "kubik_wysiwyg.active_admin_load_paths" do
        admin_dir = root.join("app/admin")
        paths = ::ActiveAdmin.application.load_paths
        paths << admin_dir unless paths.include?(admin_dir)
      end

      initializer "kubik_wysiwyg.autoloading", before: :set_autoload_paths do
        lib_kubik = root.join("lib/kubik")
        ::Rails.autoloaders.main.push_dir(lib_kubik, namespace: Kubik)
        ::Rails.autoloaders.main.collapse(root.join("lib/kubik/components"))
        ::Rails.autoloaders.main.collapse(root.join("lib/kubik/components/wysiwyg/image_component"))
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

        map.pin "kubik_wysiwyg/admin_editor_patches", to: "kubik_wysiwyg/admin_editor_patches.js", preload: true

        editor_js = root.join("app/assets/javascripts/kubik_wysiwyg/wysiwyg_editor_controller.js")
        if editor_js.exist?
          map.pin "kubik_wysiwyg/wysiwyg_editor_controller", to: "kubik_wysiwyg/wysiwyg_editor_controller.js"
        end
      end
    end
  end
end
