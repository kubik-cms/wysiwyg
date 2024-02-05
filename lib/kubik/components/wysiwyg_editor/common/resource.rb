module Kubik
  module WysiwygEditor
    class Common::Resource < ViewComponent::Base
      def initialize(field, data, tab, index=nil)
        @field = field
        @data = data.deep_symbolize_keys
        @tab = tab
        @index  = index
        @field_value = @tab[:repeated] || @index.present? ?
          @data.dig(@tab[:name].to_sym, :repeated_items, (@index || 0), @field[:name].to_sym, :id) :
          @data.fetch(@tab[:name].to_sym, {}).fetch(@field[:name].to_sym, {}).fetch(:id, nil)
        @item = @field[:model].classify.constantize.find(@field_value).return_object
      end
    end
  end
end
