module Kubik
  class Common::TabbedContent < ViewComponent::Base
    def initialize(tabs, config, data)
      @tabs = tabs.present? ? tabs : []
      @config = config
      @widget_id = config[:widget_id]
      @data = data
    end
  end
end
