# frozen_string_literal: true

module Kubik
  module WysiwygEditor
    class Common::Field::LinksRepeaterInput < ViewComponent::Base
      include FieldBinding

      def initialize(field, data, widget_id, tab, index = nil, header_field: false)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @tab = tab
        @index = index
        @field_label = @field[:label] || @field[:name].humanize
        @header_field = header_field
        @links_field_name = @field[:name].to_sym
        @field_config = (@field[:field_config] || {}).with_indifferent_access
        @navigable_available = navigable_routes_available?
        raw = @data.dig(@tab[:name].to_sym, @links_field_name) || []
        @rows = compact_link_rows(raw)
      end

      def tab_name
        @tab[:name]
      end

      def links_store_key
        "#{tab_name}.#{@field[:name]}"
      end

      def row_field_name(row_index, attribute)
        "#{links_store_key}.#{row_index}.#{attribute}"
      end

      def style_options
        @field_config.dig(:style, :options) || []
      end

      def style_select?
        style_options.any?
      end

      def navigable_row_field(row_index)
        {
          name: "nav_link",
          label: "Destination",
          type: "navigable_link",
          store_path: row_field_name(row_index, "nav_link"),
          include_text_target: false,
        }
      end

      def target_select_options
        attribute_option_pairs(Kubik::Navigable::LinkAttributeOptions::TARGET_OPTIONS)
      rescue NameError
        attribute_option_pairs([["Same tab", ""], ["New tab", "_blank"], ["Parent frame", "_parent"], ["Top frame", "_top"]])
      end

      def rel_select_options
        attribute_option_pairs(Kubik::Navigable::LinkAttributeOptions::REL_OPTIONS)
      rescue NameError
        attribute_option_pairs([["None", ""], ["noopener noreferrer", "noopener noreferrer"]])
      end

      def attribute_option_pairs(pairs)
        pairs
      end

      private

      def compact_link_rows(rows)
        Array.wrap(rows).reject do |row|
          row = row.to_h.with_indifferent_access
          nav = Kubik::Wysiwyg::LinkResolver.parse_nav_ref(row[:nav_link])
          row[:text].to_s.strip.blank? &&
            row[:url].to_s.strip.blank? &&
            row[:rel].to_s.strip.blank? &&
            nav.blank?
        end
      end

      def navigable_routes_available?
        respond_to?(:link_targets_admin_kubik_navigation_items_path) &&
          defined?(Kubik::NavigableResources)
      end
    end
  end
end
