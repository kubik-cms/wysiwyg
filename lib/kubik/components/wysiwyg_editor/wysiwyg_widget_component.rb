module Kubik
  module WysiwygEditor
    class WysiwygWidgetComponent < ViewComponent::Base
      def initialize(setup, data)
        @setup = setup.deep_symbolize_keys
        @widget_id = setup[:widget_id]
        @tabs = @setup[:config][:tabs]
        @data = widget_default_data.merge(data).symbolize_keys
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
                    break;
                  when 'textarea'
                    tab_data[field[:name].to_sym] = ''
                    break
                  when 'media'
                    tab_data[field[:name].to_sym] = nil
                    break
                  when 'resource'
                    tab_data[field[:name].to_sym] = nil
                    break
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
