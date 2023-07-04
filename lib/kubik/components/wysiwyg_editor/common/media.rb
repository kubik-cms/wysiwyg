module Kubik
  module WysiwygEditor
    class Common::Media < ViewComponent::Base
      def initialize(field_value, field, data, widget_id, tab, index=nil)
        @field_value = field_value
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @tab = tab
        @index  = index
        @field_name = @index.present? ? "#{@tab[:name]}[repeated_items][#{@index}].#{@field[:name]}.id" : "#{@tab[:name]}.#{@field[:name]}.id"
        klass = @field[:model].classify.constantize
        @media = klass.exists?(@field_value) ?
          klass.find(@field_value) :
          nil
      end
    end
  end
end
