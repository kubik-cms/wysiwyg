# frozen_string_literal: true

module Kubik
  module WysiwygEditor
    class Common::Field::NavigableLink < ViewComponent::Base
      include FieldBinding

      def initialize(field, data, widget_id, tab, index = nil)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @tab = tab
        @index = index
        @field_label = @field[:label] || @field[:name].humanize
        @field_name = field_store_path(field, tab, index)
        raw = if tab[:repeated] || index.present?
                @data.dig(tab[:name].to_sym, :repeated_items, (index || 0), field[:name].to_sym)
              else
                @data.fetch(tab[:name].to_sym, {}).fetch(field[:name].to_sym, nil)
              end
        @current = parse_current(raw)
        @navigable_available = navigable_routes_available?
      end

      def render?
        @navigable_available
      end

      def stimulus_data
        {
          controller: 'kubik-navigable-picker',
          kubik_navigable_picker_resources_url_value: helpers.get_resources_admin_kubik_navigation_items_path(format: :json),
          kubik_navigable_picker_items_url_value: helpers.link_targets_admin_kubik_navigation_items_path(format: :json),
          kubik_navigable_picker_locations_url_value: helpers.navigation_items_for_resource_admin_kubik_navigation_items_path(format: :json)
        }
      end

      def resource_types
        Kubik::NavigableResources.instance.select_collection.map { |m| [m.resource_title, m.class_name] }
      end

      private

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
        helpers.respond_to?(:link_targets_admin_kubik_navigation_items_path) &&
          defined?(Kubik::NavigableResources)
      end
    end
  end
end
