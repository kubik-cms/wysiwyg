# frozen_string_literal: true

module Kubik
  module Wysiwyg
    # Converts CMS WYSIWYG payloads (Editor.js JSON or HTML) into plain text for AI prompts.
    class PlainText
      SKIP_DATA_KEYS = /\A_ui\z/.freeze

      class << self
        def from(content)
          new(content).to_s
        end
      end

      def initialize(content)
        @content = content
      end

      def to_s
        return "" if @content.blank?

        raw = @content.to_s.strip
        if editorjs_document?(raw)
          extract_from_editorjs(raw)
        elsif raw.include?("<")
          ActionController::Base.helpers.strip_tags(raw).squish
        else
          raw.squish
        end
      end

      private

      def extract_from_editorjs(json)
        document = parse_json_hash(json)
        blocks = Array(document["blocks"])
        parts = blocks.flat_map { |block| strings_from_block(block) }.compact
        parts.join("\n\n").squish
      end

      def strings_from_block(block)
        return [] unless block.is_a?(Hash)

        data = block["data"]
        return [] unless data.is_a?(Hash)

        deep_text_strings(data)
      end

      def deep_text_strings(value)
        case value
        when String
          strip_inline_html(value).presence
        when Hash
          value.flat_map do |key, nested|
            next [] if key.to_s.match?(SKIP_DATA_KEYS)

            deep_text_strings(nested)
          end
        when Array
          value.flat_map { |item| deep_text_strings(item) }
        else
          []
        end
      end

      def strip_inline_html(text)
        ActionController::Base.helpers.strip_tags(text.to_s).squish.presence
      end

      def editorjs_document?(content)
        parsed = parse_json_hash(content)
        return false unless parsed.is_a?(Hash)

        return true if parsed["time"].present? || parsed["version"].present?

        Array(parsed["blocks"]).any? do |block|
          next false unless block.is_a?(Hash)
          next false if block.key?("inlineStyleRanges") || block.key?(:inlineStyleRanges)

          type = (block["type"] || block[:type]).to_s
          data = block["data"] || block[:data]
          type.present? && data.is_a?(Hash)
        end
      rescue JSON::ParserError
        false
      end

      def parse_json_hash(content)
        case content
        when Hash
          content.deep_stringify_keys
        when String
          return nil if content.blank?

          JSON.parse(content).then { |parsed| parsed.is_a?(Hash) ? parsed.deep_stringify_keys : nil }
        end
      end
    end
  end
end
