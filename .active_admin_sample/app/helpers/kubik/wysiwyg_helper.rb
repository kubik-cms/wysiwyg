module Kubik
  module WysiwygHelper
    def render_kubik_editor(json)
      renderer = RenderEditorjs::DefaultRenderer.new(
        "image" => Kubik::Wysiwyg::ImageComponent::ImageBlock.new
      )
      document = RenderEditorjs::Document.new(json, renderer)
      document.valid? #=> true | false
      document.errors #=> Array with the schema errors
      document.render
    end
  end
end
