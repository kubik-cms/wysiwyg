module Kubik
  class Common::Repeater < ViewComponent::Base
    def initialize(**options)
      @fields = options[:tab][:fields] || []
      @widget_id = options[:widget_id]
      @data = options[:data]
      @repeated_items = @data.deep_symbolize_keys.fetch(options[:tab][:name].to_sym, nil).fetch(:repeated_items || [])
      @tab = options[:tab]
    end
  end
end
