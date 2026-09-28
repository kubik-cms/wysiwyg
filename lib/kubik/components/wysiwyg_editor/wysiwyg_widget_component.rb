module Kubik
  module WysiwygEditor
    class WysiwygWidgetComponent < ViewComponent::Base
      def initialize(config, data)
        @config = config.deep_symbolize_keys
        @widget_id = config[:widget_id]
        @tabs = @config[:config][:tabs]
        incoming = data.present? ? data.deep_symbolize_keys : {}
        @data = deep_merge_defaults(widget_default_data, incoming)
        @icon = @config.dig(:config, :icon)
      end

      private

      def deep_merge_defaults(defaults, incoming)
        defaults.deep_merge(incoming) do |_key, _old, new|
          new
        end
      end

      def widget_default_data
        {}.tap do |data|
          @tabs.each do |tab|
            data[tab[:name].to_sym] = {}.tap do |tab_data|
              if tab[:repeated]
                tab_data[:repeated_items] = []
              else
                tab[:fields].each do |field|
                  case field[:type]
                  when 'text', 'textarea'
                    tab_data[field[:name].to_sym] = ''
                  when 'select', 'radio'
                    tab_data[field[:name].to_sym] = field[:options].try(:first)
                  when 'boolean'
                    tab_data[field[:name].to_sym] = 0
                  when 'media', 'resource'
                    tab_data[field[:name].to_sym] = nil
                  when 'key_value_repeater'
                    tab_data[field[:name].to_sym] = [key_value_row(field)]
                  end
                end
              end
            end
          end
        end
      end

      def key_value_row(field)
        (field[:fields] || %w[key value]).each_with_object({}) do |name, row|
          row[name.to_sym] = ''
        end
      end
    end
  end
end
