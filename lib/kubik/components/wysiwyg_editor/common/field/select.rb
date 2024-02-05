module Kubik
  module WysiwygEditor
    class Common::Field::Select < ViewComponent::Base
      def initialize(field, data, widget_id, tab, index=nil)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @index = index
        @tab = tab
        @field_label = @field[:label] || @field[:name].humanize
        @field_name = @index.present? ? "#{@tab[:name]}[repeated_items][#{@index}].#{@field[:name]}" : "#{@tab[:name]}.#{@field[:name]}"
        @field_value = @tab[:repeated] || @index.present? ?
          @data.dig(@tab[:name].to_sym, :repeated_items, (@index || 0), @field[:name].to_sym) :
          @data.fetch(@tab[:name].to_sym, {}).fetch(@field[:name].try(:to_sym), '')

        @options = [{ label: 'Select an option', value: nil }].concat(@field[:options] || [])

      end
    end
  end
end

