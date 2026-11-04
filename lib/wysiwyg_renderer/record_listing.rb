# frozen_string_literal: true

module WysiwygRenderer
  class RecordListing < RenderEditorjs::Blocks::Base
    SCHEMA = YAML.safe_load(<<~YAML)
      type: object
      additionalProperties: true
    YAML

    def initialize(widget_name:)
      @widget_name = widget_name.to_s
    end

    def render(data)
      view_context = Kubik::WysiwygContext.view_context || ApplicationController.new.view_context
      items = Kubik::Wysiwyg::RecordListResolver.call(
        data,
        widget_name: @widget_name,
        view_context: view_context
      )
      return "" if items.blank?

      symbolized = data.deep_symbolize_keys
      config = KubikWysiwyg.config.record_list_models[@widget_name]
      layout = symbolized.dig(:settings, :layout)
      partial = config&.layout_partials&.[](layout) ||
                config&.render_partial ||
                "kubik/wysiwyg/record_listing/default"

      locals = {
        items: items,
        repeated_items: items,
        title: symbolized.dig(:content, :title),
        content: symbolized.dig(:content, :intro),
        layout: layout,
        link_text: symbolized.dig(:content, :link_text),
        link_url: symbolized.dig(:content, :link),
        divider: true,
        settings: symbolized[:settings]
      }
      locals[:image_src_key] = :square_400 if partial.include?("history_carousel")

      view_context.render(partial: partial, locals: locals)
    end
  end
end
