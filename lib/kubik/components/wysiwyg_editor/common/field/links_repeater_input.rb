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

      def add_link_label
        KubikWysiwyg::LinkStyle.add_link_label
      end

      def add_another_link_label
        KubikWysiwyg::LinkStyle.add_another_link_label
      end

      def metadata_style_option_pairs
        return style_options.map { |o| [o[:label], o[:value].to_s] } if style_select?

        KubikWysiwyg::LinkStyle.default_pairs
      end

      def show_metadata_style?
        metadata_style_option_pairs.any?
      end

      def max_items
        raw = @field[:max_items] || @field[:maxItems]
        return nil if raw.blank?

        limit = raw.to_i
        limit.positive? ? limit : nil
      end

      def can_add_links?
        limit = max_items
        return true unless limit

        @rows.size < limit
      end

      def row_expanded?(row)
        row.to_h.with_indifferent_access.dig(:_ui, :expanded) == true
      end

      def row_summary(row, row_index)
        row = row.to_h.with_indifferent_access
        text = row[:text].to_s.strip.presence || "Link #{row_index + 1}"
        style_label = style_label_for(row[:style])

        KubikWysiwyg::LinkStyle.link_row_summary_text(text, style_label)
      end

      def style_label_for(style_value)
        value = style_value.to_s
        pair = metadata_style_option_pairs.find { |_label, option_value| option_value.to_s == value }
        return pair.first if pair

        value.present? ? value : "Default"
      end

      private

      def compact_link_rows(rows)
        rows = Array.wrap(rows).reject do |row|
          row = row.to_h.with_indifferent_access
          next false if row.dig(:_ui, :expanded) == true

          nav = Kubik::Wysiwyg::LinkResolver.parse_nav_ref(row[:nav_link])
          row[:text].to_s.strip.blank? &&
            row[:url].to_s.strip.blank? &&
            row[:rel].to_s.strip.blank? &&
            nav.blank?
        end
        rows = legacy_nav_link_rows_if_empty(rows)
        limit = max_items
        return rows unless limit && rows.size > limit

        rows.first(limit)
      end

      def legacy_nav_link_rows_if_empty(rows)
        return rows if rows.present?

        tab_data = (@data.dig(@tab[:name].to_sym) || {}).with_indifferent_access
        nav_raw = tab_data[:nav_link]
        return rows if nav_raw.blank?

        nav = Kubik::Wysiwyg::LinkResolver.parse_nav_ref(nav_raw) || {}
        return rows if nav[:text].to_s.strip.blank? &&
                       nav[:href].to_s.strip.blank? &&
                       nav[:kind].to_s.strip.blank? &&
                       nav[:url].to_s.strip.blank?

        row = {
          nav_link: nav_raw,
          text: nav[:text],
          style: nav[:style],
          target: nav[:target],
          rel: nav[:rel],
        }.compact

        [row.with_indifferent_access]
      end

      def navigable_routes_available?
        respond_to?(:link_targets_admin_kubik_navigation_items_path) &&
          defined?(Kubik::NavigableResources)
      end
    end
  end
end
