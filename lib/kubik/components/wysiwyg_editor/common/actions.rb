module Kubik
  module WysiwygEditor
    class Common::Actions < ViewComponent::Base
      def initialize(index, items_length, tab_name)
        @index = index
        @items_length = items_length
        @tab_name = tab_name
      end

      def last_item?
        @index < (@items_length - 1)
      end
    end
  end
end
