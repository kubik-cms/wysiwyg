module Kubik
  module Wysiwyg
    class ImageComponent < ViewComponent::Base
      def initialize(data)
        @media = data[:media]
        @content = data[:content]
        @settings = data[:settings] || {}
      end

      def element_classes
        ['kubik-image-widget', @settings[:additional_classes]].reject(&:blank?).join(' ')
      end

      def element_id
        @settings[:element_id]
      end
    end
  end
end
