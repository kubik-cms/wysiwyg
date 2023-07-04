module Kubik
  module WysiwygEditor
    class Common::Field::Resource < ViewComponent::Base
      def initialize(field, data, widget_id, tab, index=nil)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @index = index
        @tab = tab
        @field_label = @field[:label] || @field[:name].humanize
        @field_name = @index.present? ? "#{@tab[:name]}[repeated_items][#{@index}].#{@field[:name]}.id" : "#{@tab[:name]}.#{@field[:name]}.id}"
      end
    end
  end
end

