module Kubik
  module WysiwygEditor
    class Common::Field < ViewComponent::Base
      def initialize(field, data, widget_id, tab, index=nil)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @tab = tab
        @index  = index
        @field_value = @tab[:repeated] || @index.present? ?
          if @field[:type] == 'resource'
            @data.dig(@tab[:name].to_sym, :repeated_items, (@index || 0), @field[:name].to_sym, :id)
          else
            @data.dig(@tab[:name].to_sym, :repeated_items, (@index || 0), @field[:name].to_sym)
          end :
          if @field[:type] == 'resource'
            @data.fetch(@tab[:name].to_sym, {}).fetch(@field[:name].to_sym, {}).fetch(:id, nil)
          else
            @data.fetch(@tab[:name].to_sym, {}).fetch(@field[:name].to_sym, {})
          end


      end
    end
  end
end
