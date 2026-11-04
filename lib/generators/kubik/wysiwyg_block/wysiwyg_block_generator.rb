# frozen_string_literal: true

require "rails/generators"
require "rails/generators/named_base"
require_relative "../wysiwyg_generator_helpers"

module Kubik
  module Generators
    class WysiwygBlockGenerator < Rails::Generators::NamedBase
      include WysiwygGeneratorHelpers

      source_root File.expand_path("templates", __dir__)

      class_option :editorjs_type, type: :string, desc: "Editor.js tool key (defaults to underscored name)"
      class_option :toolbox_title, type: :string, desc: "Block picker label (defaults to class name)"

      def assign_template_variables
        @block_type = options[:editorjs_type].presence || file_name
        @toolbox_title = options[:toolbox_title].presence || class_name
        @widget_folder = "#{file_name}_widget"
        @snippet_dir = File.join("docs/wysiwyg_snippets", @block_type)
      end

      def create_javascript_block
        template "block_index.js.tt", File.join("app/javascript/admin/wysiwyg_widgets", @widget_folder, "index.js")
      end

      def append_bundle_export
        append_wysiwyg_bundle_export(
          export_name: "#{class_name}Widget",
          import_path: "admin/wysiwyg_widgets/#{@widget_folder}"
        )
      end

      def create_renderer
        template "renderer.rb.tt", File.join("app/components/wysiwyg_renderer", "#{file_name}.rb")
      end

      def create_agent_notes
        template "AGENTS.md.tt", File.join("docs", "wysiwyg_block_#{file_name}.md")
      end

      def create_merge_snippets
        template "wysiwyg_tools_snippet.js.tt", File.join(@snippet_dir, "wysiwyg_tools.js")
        template "editor_renderer_snippet.rb.tt", File.join(@snippet_dir, "editor_renderer.rb")
      end

      def show_next_steps
        say "\nWYSIWYG block scaffold created (#{@block_type}).", :green
        say "  1. Merge docs/wysiwyg_snippets/#{@block_type}/wysiwyg_tools.js into wysiwyg_tools.js"
        say "  2. Merge docs/wysiwyg_snippets/#{@block_type}/editor_renderer.rb into config/initializers/kubik_editor_renderer.rb"
        say "  3. Implement rendering in app/components/wysiwyg_renderer/#{file_name}.rb"
        say "  4. Customise tabs/fields in app/javascript/admin/wysiwyg_widgets/#{@widget_folder}/index.js"
        say "  5. Read docs/wysiwyg_block_#{file_name}.md"
        say_wysiwyg_footer
      end
    end
  end
end
