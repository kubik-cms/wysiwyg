module Kubik
  module WysiwygEditor
    class Common::Field::Select < ViewComponent::Base
      include FieldBinding

      def initialize(field, data, widget_id, tab, index=nil)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @index = index
        @tab = tab
        @field_label = @field[:label] || @field[:name].humanize
        @field_name = field_store_path(@field, tab, index)
        @field_value = if @field[:store_path].present?
                         value_at_path(@data, @field[:store_path]) || ''
                       elsif @tab[:repeated] || @index.present?
                         @data.dig(@tab[:name].to_sym, :repeated_items, (@index || 0), @field[:name].to_sym) || ''
                       else
                         @data.fetch(@tab[:name].to_sym, {}).fetch(@field[:name].try(:to_sym), '')
                       end

        if @field_value.blank? && @field[:default].present?
          @field_value = @field[:default]
        end

        @options = if @field[:include_blank] == false
                     @field[:options] || []
                   else
                     [{ label: 'Select an option', value: nil }].concat(@field[:options] || [])
                   end

      end

      def field_css_class
        [@field[:css_class]].compact.join(' ').presence
      end

      def hide_label?
        @field[:hide_label] == true
      end
    end
  end
end

