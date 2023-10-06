module Kubik
  module WysiwygEditor
    class Common::Summary < ViewComponent::Base
      def initialize(**options)
        @fields = options[:fields] || []
        @tab = options[:tab]
        @data = options[:data]
        @index = options[:index]
        summary_field_name = @tab[:repeater_settings][:summary]
        @field = @fields.find { |field| field[:name] == summary_field_name }
        @field_value = @tab[:repeated] || @index.present? ?
          @data.dig(@tab[:name].to_sym, :repeated_items, (@index || 0), @field[:name].to_sym, :id) :
          @data.fetch(@tab[:name].to_sym, {}).fetch(@field[:name].to_sym, {}).fetch(:id, nil)
      end

      def render?
        @field.present?
      end
    end
  end
end
