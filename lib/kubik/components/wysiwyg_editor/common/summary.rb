module Kubik
  module WysiwygEditor
    class Common::Summary < ViewComponent::Base
      def initialize(**options)
        @fields = options[:fields] || []
        @tab = options[:tab]
        @data = options[:data]
        summary_field_name = @tab[:repeater_settings][:summary]
        @field = @fields.find { |field| field[:name] == summary_field_name }
      end

      def render?
        @field.present?
      end
    end
  end
end
