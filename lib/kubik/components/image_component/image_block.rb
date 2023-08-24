module Kubik
  module Wysiwyg
    class ImageComponent::ImageBlock < RenderEditorjs::Blocks::Base
        SCHEMA = YAML.safe_load(<<~YAML)
          type: object
          additionalProperties: false
          properties:
            media:
              type: object
            content:
              type: object
            settings:
              type: object
        YAML

        def render(data)
          return unless valid?(data)
          ActionController::Base.render(Kubik::Wysiwyg::ImageComponent.new(data))
        end
    end
  end
end
