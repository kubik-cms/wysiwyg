# frozen_string_literal: true

module Kubik
  module Generators
    module WysiwygGeneratorHelpers
      def parse_option_pairs(raw)
        raw.to_s.split(",").filter_map do |chunk|
          key, label = chunk.split(":", 2).map(&:strip)
          next if key.blank?

          { value: key, label: label.presence || key.humanize }
        end
      end

      def append_wysiwyg_bundle_export(export_name:, import_path:)
        bundle_path = "app/javascript/admin/wysiwyg_widgets_bundle.js"
        return unless File.exist?(bundle_path)

        export_line = "export { default as #{export_name} } from \"#{import_path}\""
        contents = File.read(bundle_path)
        append_file bundle_path, "\n#{export_line}" unless contents.include?(export_line)
      end

      def say_wysiwyg_footer
        say "  Host customisation stays in the app; shared behaviour lives in kubik_wysiwyg.", :cyan
        say "  See kubik_wysiwyg gem docs/GENERATORS.md and docs/AGENTS.md.\n"
      end
    end
  end
end
