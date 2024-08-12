module Kubik
  module WysiwygEditor
    class WysiwygWidgetComponent < ViewComponent::Base
      def initialize(config, data)
        @config = config.deep_symbolize_keys
        @widget_id = config[:widget_id]
        @tabs = @config[:config][:tabs]
        @data = widget_default_data.merge(data).symbolize_keys
        @icon = @config.dig(:config, :icon)
      end

      private

      def widget_default_data
        {}.tap do |data|
          @tabs.each do |tab|
            data[tab[:name].to_sym] = {}.tap do |tab_data|
              if tab[:repeated]
                tab_data[:repeated_items] = []
              else
                tab[:fields].each do |field|
                  case field[:type]
                  when 'text'
                    tab_data[field[:name].to_sym] = ''
                  when 'textarea'
                    tab_data[field[:name].to_sym] = ''
                  when 'select'
                    tab_data[field[:name].to_sym] = field[:options].try(:first)
                  when 'media'
                    tab_data[field[:name].to_sym] = nil
                  when 'resource'
                    tab_data[field[:name].to_sym] = nil
                  when 'key_value_repeater'
                    tab_data[field[:name].to_sym] = field[:fields].map{|f| {f.to_sym => ''}}
                  end
                end
              end
            end
          end
        end
      end
    end
  end
end
