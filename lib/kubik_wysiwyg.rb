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
        ActiveAdmin.application.load_paths += Dir[File.dirname(__FILE__) + '/active_admin']
        #ActiveAdmin.application.load_paths += Dir[File.dirname(__FILE__) + '/active_admin/views']
      end
    end
  end
end
