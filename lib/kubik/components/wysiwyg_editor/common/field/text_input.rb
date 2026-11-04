module Kubik
  module WysiwygEditor
    class Common::Field::TextInput < ViewComponent::Base
      include FieldBinding

      def initialize(field, data, widget_id, tab, index=nil, header_field=false)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @index = index
        @tab = tab
        @field_label = @field[:label] || @field[:name].humanize
        @header_field = header_field
        @field_name = field_store_path(field, tab, index)
        @field_value = if field[:store_path].present?
                         value_at_path(@data, field[:store_path]) || ''
                       elsif @tab[:repeated] || @index.present?
                         @data.dig(@tab[:name].to_sym, :repeated_items, (@index || 0), @field[:name].to_sym) || ''
                       else
                         @data.fetch(@tab[:name].to_sym, {}).fetch(@field[:name].try(:to_sym), '')
                       end
      end
    end
  end
end

