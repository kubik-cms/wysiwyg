# frozen_string_literal: true

module Kubik
  module WysiwygEditor
    module FieldBinding
      def field_store_path(field, tab, index = nil)
        return field[:store_path].to_s if field[:store_path].present?

        if index.present?
          "#{tab[:name]}[repeated_items][#{index}].#{field[:name]}"
        else
          "#{tab[:name]}.#{field[:name]}"
        end
      end

      def field_value_from_store(data, field, tab, index = nil)
        data = data.deep_symbolize_keys
        path = field_store_path(field, tab, index)

        if field[:type].to_s == 'resource'
          if index.present? || tab[:repeated]
            return data.dig(*path_segments_for_repeater_resource(path))
          end

          return data.dig(tab[:name].to_sym, field[:name].to_sym, :id) unless field[:store_path].present?
        end

        value_at_path(data, path)
      end

      def value_at_path(data, path)
        keys = path.to_s.split(".").map do |segment|
          segment.match?(/\A\d+\z/) ? segment.to_i : segment.to_sym
        end
        data.dig(*keys)
      end

      private

      def path_segments_for_repeater_resource(path)
        # items[repeated_items][0].record -> [:items, :repeated_items, 0, :record, :id]
        match = path.match(/\A(\w+)\[repeated_items\]\[(\d+)\]\.(\w+)\z/)
        return [] unless match

        [match[1].to_sym, :repeated_items, match[2].to_i, match[3].to_sym, :id]
      end
    end
  end
end
