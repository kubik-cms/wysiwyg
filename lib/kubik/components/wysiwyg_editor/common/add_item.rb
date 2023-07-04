module Kubik
  module WysiwygEditor
    class Common::AddItem < ViewComponent::Base
      def initialize(tab, widget_id)
        @tab = tab
        @widget_id = widget_id
        @repeater_settings = tab[:repeater_settings].symbolize_keys
      end
    end
  end
end
