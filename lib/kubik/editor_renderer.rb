# frozen_string_literal: true

module Kubik
  class EditorRenderer
    class << self
      def blocks
        @blocks ||= {
          "listing" => ::WysiwygRenderer::Listing.new,
          "accordion" => ::WysiwygRenderer::Accordion.new,
          "hero" => ::WysiwygRenderer::Hero.new,
          "media" => ::WysiwygRenderer::Media.new,
          "content_with_media" => ::WysiwygRenderer::ContentWithMedia.new,
          "faqs" => ::WysiwygRenderer::Faqs.new,
          "nested_list" => ::WysiwygRenderer::NestedList.new,
          "header" => ::WysiwygRenderer::Header.new,
          "paragraph" => ::WysiwygRenderer::Text.new,
          "divider" => ::WysiwygRenderer::Divider.new
        }.freeze
      end

      def default_renderer
        @default_renderer ||= RenderEditorjs::DefaultRenderer.new(blocks)
      end

      def parse_json(json)
        case json
        when Hash
          json
        when String
          return {} if json.blank?

          JSON.parse(json)
        else
          json.present? ? JSON.parse(json.to_s) : {}
        end
      end

      def render_document(json)
        return "" if json.nil?

        document = RenderEditorjs::Document.new(parse_json(json), default_renderer)
        document.render
      end
    end

    def initialize(view_context)
      @view_context = view_context
    end

    def render(json)
      return "" if json.nil?

      Kubik::WysiwygContext.set(view_context: @view_context) do
        self.class.render_document(json)
      end
    end
  end
end
