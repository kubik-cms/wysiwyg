# frozen_string_literal: true

require "rails/generators"
require "rails/generators/named_base"
require_relative "../wysiwyg_generator_helpers"

module Kubik
  module Generators
    class WysiwygRecordListGenerator < Rails::Generators::NamedBase
      include WysiwygGeneratorHelpers

      source_root File.expand_path("templates", __dir__)

      class_option :model, type: :string, desc: "ActiveRecord model (e.g. ReadingSchools::Resource)"
      class_option :widget_name, type: :string, desc: "Editor.js tool key (default: <name>_listing)"
      class_option :toolbox_title, type: :string, desc: "Block picker label"
      class_option :admin_search_path, type: :string, desc: "Active Admin collection path segment (e.g. reading_schools_resources)"
      class_option :queries, type: :string, default: "recent_published:Recently published",
                            desc: "Comma-separated query_key:Label pairs for live query mode"
      class_option :layouts, type: :string, default: "small:Small,large:Large",
                             desc: "Comma-separated layout value:Label pairs"
      class_option :default_layout, type: :string, default: "large", desc: "Default layout value in Ruby registration"
      class_option :partial_namespace, type: :string,
                                       desc: "Partial path prefix (default: layouts/partials/listing/<file_name>)"

      def assign_template_variables
        @model_class = options[:model].presence || class_name
        @widget_name = options[:widget_name].presence || "#{file_name}_listing"
        @toolbox_title = options[:toolbox_title].presence || "#{class_name} listing"
        @admin_search_path = options[:admin_search_path].presence || file_name.pluralize
        @queries = parse_option_pairs(options[:queries])
        @layouts = parse_option_pairs(options[:layouts])
        @default_layout = options[:default_layout]
        @partial_namespace = options[:partial_namespace].presence ||
                             "layouts/partials/listing/#{file_name}"
        @widget_folder = "#{@widget_name}_widget"
        @model_underscore = @model_class.underscore.tr("/", "_")
        @snippet_dir = File.join("docs/wysiwyg_snippets", @widget_name)
        @listing_widget_export = "#{class_name.gsub('::', '')}ListingWidget"
      end

      def create_javascript_widget
        template "widget_index.js.tt",
                 File.join("app/javascript/admin/wysiwyg_widgets", @widget_folder, "index.js")
      end

      def append_bundle_export
        append_wysiwyg_bundle_export(
          export_name: @listing_widget_export,
          import_path: "admin/wysiwyg_widgets/#{@widget_folder}"
        )
      end

      def create_listing_partials
        template "partial_small.html.erb.tt", "app/views/#{@partial_namespace}_small_partial.html.erb"
        template "partial_large.html.erb.tt", "app/views/#{@partial_namespace}_large_partial.html.erb"
      end

      def create_initializer_snippet
        template "record_list_initializer.rb.tt",
                 File.join("config/initializers", "kubik_wysiwyg_record_lists_#{file_name}.rb")
      end

      def create_merge_snippets
        template "wysiwyg_tools_snippet.js.tt", File.join(@snippet_dir, "wysiwyg_tools.js")
        template "model_wysiwyg.rb.tt", File.join(@snippet_dir, "model_wysiwyg.rb")
      end

      def create_agent_notes
        template "AGENTS.md.tt", File.join("docs", "wysiwyg_record_list_#{file_name}.md")
      end

      def show_next_steps
        say "\nRecord list widget scaffold created (#{@widget_name}).", :green
        say "  1. Apply docs/wysiwyg_snippets/#{@widget_name}/model_wysiwyg.rb to #{@model_class}"
        say "  2. Active Admin: Kubik::WysiwygAutocomplete.register_collection_search!(self)"
        say "  3. Merge config/initializers/kubik_wysiwyg_record_lists_#{file_name}.rb into kubik_wysiwyg_record_lists.rb"
        say "  4. Merge docs/wysiwyg_snippets/#{@widget_name}/wysiwyg_tools.js into wysiwyg_tools.js"
        say "  5. Customise partials: app/views/#{@partial_namespace}_*_partial.html.erb"
        say "  6. Read docs/wysiwyg_record_list_#{file_name}.md"
        say_wysiwyg_footer
      end
    end
  end
end
