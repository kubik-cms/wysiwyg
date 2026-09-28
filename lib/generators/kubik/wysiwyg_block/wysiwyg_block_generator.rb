# frozen_string_literal: true

require "rails/generators"
require "rails/generators/named_base"

module Kubik
  module Generators
    class WysiwygBlockGenerator < Rails::Generators::NamedBase
      source_root File.expand_path("wysiwyg_block/templates", __dir__)

      class_option :editorjs_type, type: :string, desc: "Editor.js block type key (defaults to underscored name)"

      def create_javascript_block
        @block_type = options[:editorjs_type].presence || file_name
        @widget_folder = "#{file_name}_widget"
        template "block_index.js.tt", File.join("app/javascript/admin/wysiwyg_widgets", @widget_folder, "index.js")
      end

      def append_bundle_export
        bundle_path = "app/javascript/admin/wysiwyg_widgets_bundle.js"
        return unless File.exist?(bundle_path)

        export_line = "export { default as #{class_name}Widget } from \"admin/wysiwyg_widgets/#{@widget_folder}\""
        append_file bundle_path, "\n#{export_line}" unless File.read(bundle_path).include?(export_line)
      end

      def create_renderer
        template "renderer.rb.tt", File.join("app/components/wysiwyg_renderer", "#{file_name}.rb")
      end

      def show_next_steps
        say "\nNext steps:", :green
        say "  1. Register the tool in app/javascript/admin/controllers/wysiwyg_tools.js"
        say "  2. Add \"#{@block_type}\" => WysiwygRenderer::#{class_name}.new to app/lib/kubik/editor_renderer.rb"
        say "  3. Implement public rendering in app/components/wysiwyg_renderer/#{file_name}.rb"
        say "  See docs/WYSIWYG.md in the kubik_wysiwyg gem.\n"
      end
    end
  end
end
