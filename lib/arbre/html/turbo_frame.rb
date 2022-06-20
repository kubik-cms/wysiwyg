# frozen_string_literal: true

module Arbre
  module HTML
    # Turbo frame tag for Active Admin
    class TurboFrame < Tag
      builder_method :turbo_frame
      def tag_name
        'turbo-frame'
      end
    end
  end
end
