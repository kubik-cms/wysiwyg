module Kubik
  module WysiwygEditor
    class Common::Field < ViewComponent::Base
      include FieldBinding

      def initialize(field, data, widget_id, tab, index=nil)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @tab = tab
        @index  = index
        @header_field = @tab.dig(:repeater_settings, :summary) == @field[:name]
        @field_value = @tab[:repeated] || @index.present? ?
          if @field[:type] == 'resource'
            @data.dig(@tab[:name].to_sym, :repeated_items, (@index || 0), @field[:name].to_sym, :id)
          else
            @data.dig(@tab[:name].to_sym, :repeated_items, (@index || 0), @field[:name].to_sym)
          end :
          if @field[:type] == 'resource'

            @data.dig(@tab[:name].to_sym, @field[:name].to_sym, :id)
          else
            @data.fetch(@tab[:name].to_sym, {}).fetch(@field[:name].to_sym, {})
          end


      end

      def render?
        field_visible?
      end

      def field_visible?
        rule = @field[:visible_when] || @field['visible_when']
        return true if rule.blank?

        rule = rule.with_indifferent_access
        rule = rule.merge(tab: @tab[:name]) if rule[:tab].blank?
        rule = rule.merge(repeater_index: @index) if @index.present?
        Visibility.match?(@data, rule)
      end
    end
  end
end
