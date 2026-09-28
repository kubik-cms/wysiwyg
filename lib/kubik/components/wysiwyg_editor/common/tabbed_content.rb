module Kubik
  module WysiwygEditor
    class Common::TabbedContent < ViewComponent::Base
      def initialize(tabs, config, data)
        @tabs = tabs.present? ? tabs : []
        @config = config
        @widget_id = config[:widget_id]
        @data = data
      end

      def ui_expanded
        @data.dig(:_ui, :expanded) == true || @data[:expanded] == true
      end

      def tab_checked?(tab, index)
        active = @data.dig(:_ui, :active_tab)
        active.present? ? active.to_s == tab[:name].to_s : index.zero?
      end
    end
  end
end
