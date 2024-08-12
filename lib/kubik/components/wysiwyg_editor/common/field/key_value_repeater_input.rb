module Kubik
  module WysiwygEditor
    class Common::Field::KeyValueRepeaterInput < ViewComponent::Base
      def initialize(field, data, widget_id, tab, index=nil, header_field=false)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @index = index
        @tab = tab
        @prefix = @field[:prefix]
        @field_label = @field[:label] || @field[:name].humanize
        @header_field = header_field
        @fields = @field[:fields] || []
        @field_name = @index.present? ? "#{@tab[:name]}[repeated_items][#{@index}].#{@field[:name]}" : "#{@tab[:name]}.#{@field[:name]}"
        @field_value = @tab[:repeated] || @index.present? ?
          @data.fetch(@tab[:name].to_sym, {}).fetch(:repeated_items, []).fetch(@index, {}).fetch(@field[:name].to_sym, []) :
          @data.fetch(@tab[:name].to_sym, {}).fetch(@field[:name].try(:to_sym), [])
      end
    end
  end
end
