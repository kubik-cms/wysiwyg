# frozen_string_literal: true

module Kubik
  module WysiwygEditor
    class Common::Field::NavigableLink < ViewComponent::Base
      include FieldBinding
      include Kubik::NavigableLinkEditorHelper

      def initialize(field, data, widget_id, tab, index = nil)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @tab = tab
        @index = index
        @field_label = @field[:label] || @field[:name].humanize
        @field_name = field_store_path(field, tab, index)
        raw = if field[:store_path].present?
                value_at_path(@data, field[:store_path])
              elsif tab[:repeated] || index.present?
                @data.dig(tab[:name].to_sym, :repeated_items, (index || 0), field[:name].to_sym)
              else
                @data.fetch(tab[:name].to_sym, {}).fetch(field[:name].to_sym, nil)
              end
        @current = parse_current(raw)
        @include_text_target = field[:include_text_target] != false
        @link_status = link_status
        @navigable_available = navigable_routes_available?
      end

      def render?
        @navigable_available
      end

      def target_options
        return default_target_options unless defined?(Kubik::Navigable::LinkAttributeOptions)

        Kubik::Navigable::LinkAttributeOptions::TARGET_OPTIONS
      end

      def rel_options
        return default_rel_options unless defined?(Kubik::Navigable::LinkAttributeOptions)

        Kubik::Navigable::LinkAttributeOptions::REL_OPTIONS
      end

      def link_status
        return nil unless defined?(Kubik::Navigable::LinkReference)

        resolved = Kubik::Navigable::LinkReference.resolve_href(@current)
        return :broken if resolved[:broken]
        return :stale if resolved[:stale]

        nil
      end

      private

      def default_target_options
        [["Same tab", ""], ["New tab", "_blank"], ["Parent frame", "_parent"], ["Top frame", "_top"]]
      end

      def default_rel_options
        [
          ["None", ""],
          ["noopener noreferrer", "noopener noreferrer"],
          ["noopener", "noopener"],
          ["noreferrer", "noreferrer"],
          ["nofollow", "nofollow"],
        ]
      end

      def parse_current(raw)
        hash =
          case raw
          when Hash then raw
          when String
            JSON.parse(raw)
          else
            {}
          end
        hash.with_indifferent_access
      rescue JSON::ParserError
        {}.with_indifferent_access
      end

      def navigable_routes_available?
        respond_to?(:search_navigable_admin_kubik_navigation_items_path) &&
          defined?(Kubik::NavigableResources)
      end

      public

      def style_option_pairs
        if @field[:style_options].present?
          KubikWysiwyg::LinkStyle.pairs_from_widget_options(@field[:style_options])
        else
          KubikWysiwyg::LinkStyle.default_pairs
        end
      end

      def nested_in_links_repeater?
        @field[:store_path].present?
      end

      def tab_name
        @tab[:name].to_s
      end

      def navigable_link_expanded?
        ui = (@data.dig(@tab[:name].to_sym, :_ui, @field[:name].to_sym) || {}).with_indifferent_access
        return true if ui[:expanded] == true
        return false if ui[:expanded] == false

        @field[:force_editor] == true
      end

      def add_link_label
        KubikWysiwyg::LinkStyle.add_link_label
      end

      def navigable_link_header_summary
        text = @current[:text].to_s.strip.presence || "Link 1"
        style_value = @current[:style].to_s
        pair = style_option_pairs.find { |_label, option_value| option_value.to_s == style_value }
        style_label = pair ? pair.first : (style_value.present? ? style_value : "Default")

        KubikWysiwyg::LinkStyle.link_row_summary_text(text, style_label)
      end

      def navigable_link_editor_locals(hide_summary: false)
        {
          field_name: @field_name,
          current: @current,
          summary_text: kubik_navigable_link_summary(@current),
          ui_mode: kubik_navigable_ui_mode(@current),
          force_editor: @field[:force_editor] == true,
          include_text_target: @include_text_target,
          style_option_pairs: style_option_pairs,
          target_options: target_options,
          rel_options: rel_options,
          filter_options_json: kubik_navigable_filter_options_json,
          search_url: kubik_navigable_search_url,
          destination_label: KubikWysiwyg::LinkStyle.destination_label(@current),
          destination_filter: KubikWysiwyg::LinkStyle.destination_filter(@current),
          link_status: @link_status,
          field_hint: nested_in_links_repeater? ? @field[:hint] : nil,
          widget_sync: true,
          hide_summary: hide_summary,
        }
      end
    end
  end
end
