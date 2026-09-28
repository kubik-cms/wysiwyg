module Kubik
  module WysiwygEditor
    class Common::Repeater < ViewComponent::Base
      def initialize(**options)
        @fields = options[:tab][:fields] || []
        @widget_id = options[:widget_id]
        @data = options[:data]
        @config = options[:config]
        tab_data = @data.deep_symbolize_keys.fetch(options[:tab][:name].to_sym, {})
        @repeated_items = tab_data.fetch(:repeated_items, [])
        @tab = options[:tab]
      end

      def item_expanded?(item)
        item = item.deep_symbolize_keys
        item.dig(:_ui, :expanded) == true
      end
    end
  end
end
