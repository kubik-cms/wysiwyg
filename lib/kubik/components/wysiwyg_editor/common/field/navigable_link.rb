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
    end
  end
end
