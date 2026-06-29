# frozen_string_literal: true
require "activeadmin"
require "view_component"

module KubikWysiwyg
  module Rails
    class Engine < ::Rails::Engine
      config.assets.precompile += %w(kubik_wysiwyg.js)
      config.autoload_paths << root.join("app/inputs")

      initializer "kubik_wysiwyg.autoloading", before: :set_autoload_paths do
        lib_kubik = root.join("lib/kubik")
        ::Rails.autoloaders.main.push_dir(lib_kubik, namespace: Kubik)
        ::Rails.autoloaders.main.collapse(root.join("lib/kubik/components"))
      end

      initializer "kubik_wysiwyg.helper" do
        ActiveSupport.on_load(:action_controller) do
          helper Kubik::WysiwygHelper
        end
      end
    end
  end
end
