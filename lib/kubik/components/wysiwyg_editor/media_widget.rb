module Kubik
  module WysiwygEditor
    class MediaWidgetComponent < ViewComponent::Base
      def initialize(setup, data)
        @setup = setup
        @data = widget_default_data.merge(data).symbolize_keys
        @widget_id = setup[:widget_id]
        @widget_content = @data[:content]
        @widget_settings = @data[:settings]
        items = data[:items] || []
        items_data = @setup[:widget_model].constantize.find(items).as_json(only:[], methods: [:return_object]).map {|i| i['return_object'] }
        @items = items.map {|i| items_data.find {|d| d['id'] == i } }
      end

      private

      def widget_default_data
        {
          items: [],
          content: {
            title: '',
            intro: ''
          },
          settings: {
            additional_classes: '',
            element_id: ''
          }
        }
      end
    end
  end
end

