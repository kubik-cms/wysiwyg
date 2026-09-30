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
