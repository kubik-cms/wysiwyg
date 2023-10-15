module Kubik
  module WysiwygEditor
    class Common::Summary < ViewComponent::Base
      def initialize(**options)
        @fields = options[:fields] || []
        @tab = options[:tab]
        @data = options[:data].with_indifferent_access
        @index = options[:index]
        summary_field_name = @tab.dig(:repeater_settings, :summary)

        @field = @fields.find { |field| field[:name] == summary_field_name }
        field_value = @tab[:repeated] || @index.present? ?
          @data.dig(@tab[:name].to_sym, :repeated_items, (@index || 0), @field[:name].to_sym) :
          @data.fetch(@tab[:name].to_sym, {}).fetch(@field[:name].to_sym)

        @header_placeholder = @tab.dig(:repeater_settings, :header_label) || 'Item'
        @field_value =  case field_value.class
                        when Hash
                          field_value.with_indifferent_access[:id]
                        else
                          field_value
                        end
      end

      def render?
        @field.present?
      end

      def classes
        { class: 'kubik-wysiwyg-repeated-item-header--summary' }
      end

      def data_attributes
        {
          data: {
            "kubik-repeater-target": "header",
            "header-placeholder": "#{@header_placeholder} #{@index + 1}"
          }
        }
      end

      def container_attributes
        data_attributes.merge(classes)
      end
    end
  end
end
