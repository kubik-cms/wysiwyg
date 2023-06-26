module Kubik
  class Common::DeleteAction < ViewComponent::Base
    def initialize(index, tab_name)
      @index = index
      @tab_name = tab_name
    end
  end
end
