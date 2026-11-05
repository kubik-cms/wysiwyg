# frozen_string_literal: true

module Kubik
  module WysiwygEditor
    module Visibility
      module_function

      def match?(data, rule)
        return true if rule.blank?

        rule = rule.with_indifferent_access
        tab_name = rule[:tab].presence || rule[:data_tab]
        field_name = rule[:field].to_s
        repeater_index = rule[:repeater_index]
        actual = read_field(data, tab_name, field_name, repeater_index: repeater_index)
        actual = '' if actual.nil?
        actual = actual[:value] if actual.is_a?(Hash) && actual.key?(:value)
        actual = actual.to_s

        if rule.key?(:eq)
          return actual == rule[:eq].to_s
        end

        if rule.key?(:not_eq)
          return actual != rule[:not_eq].to_s
        end

        if rule[:one_of].present?
          return rule[:one_of].map(&:to_s).include?(actual)
        end

        true
      end

      def read_field(data, tab_name, field_name, repeater_index: nil)
        data = data.deep_symbolize_keys
        tab_key = tab_name.present? ? tab_name.to_sym : nil

        if tab_key && repeater_index.present?
          data.dig(tab_key, :repeated_items, repeater_index.to_i, field_name.to_sym)
        elsif tab_key
          data.dig(tab_key, field_name.to_sym)
        else
          data.dig(field_name.to_sym)
        end
      end
    end
  end
end
