# frozen_string_literal: true
require "activeadmin"
require "view_component"

module KubikWysiwyg
  module Rails
    class Engine < ::Rails::Engine
      isolate_namespace KubikWysiwyg

      config.assets.precompile += %w( kubik_wysiwyg.js )
      initializer :kubik_wysiwyg do
        ActiveAdmin.application.load_paths += Dir[File.dirname(__FILE__) + '/kubik/components/**/']
        ActiveAdmin.application.load_paths += Dir[File.dirname(__FILE__) + '/kubik/helpers/**/']
        ActiveAdmin.application.load_paths += Dir[File.dirname(__FILE__) + '/kubik/editorjs_blocks/**/']
        ActiveAdmin.application.load_paths += Dir[File.dirname(__FILE__) + '/active_admin']
        #ActiveAdmin.application.load_paths += Dir[File.dirname(__FILE__) + '/active_admin/views']
      end
      initializer 'kubik_wysiwyg.helper' do |app|
        ActiveSupport.on_load(:action_controller) do
          helper Kubik::WysiwygHelper
        end
      end
    end
  end
end
