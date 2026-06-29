module Kubik
  module WysiwygHelper
    def render_kubik_editor(json)
      renderer = RenderEditorjs::DefaultRenderer.new(
        "image" => kubik_editor_image_block.new
      )
      document = RenderEditorjs::Document.new(json, renderer)
      document.valid? #=> true | false
      document.errors #=> Array with the schema errors
      document.render
    end

    def render_wysiwyg_media_item(item)
      item = item.deep_symbolize_keys
      upload_id = wysiwyg_media_upload_id(item)
      return "" if upload_id.blank?

      layout = wysiwyg_media_layout(item)
      alt = item[:alt_text].presence
      upload = Kubik::MediaUpload.find_by(id: upload_id)
      alt = upload.additional_info["alt_text"] if alt.blank? && upload&.additional_info&.dig("alt_text").present?

      figure_classes = ["wysiwyg-media__figure", "wysiwyg-media__figure--#{layout}"]
      image_options = { addtional_classes: "wysiwyg-media__image", alt: alt }
      image_options[:layout] = "full-width" if layout == "full-width"

      content_tag(:figure, class: figure_classes.join(" ")) do
        image_html = render(
          Kubik::ImageComponent.new(upload_id, image_options)
        )
        caption_parts = [item[:caption].presence, item[:credit].presence].compact
        caption_html = if caption_parts.any?
                         content_tag(:figcaption, safe_join(caption_parts, tag.br), class: "wysiwyg-media__caption")
                       else
                         "".html_safe
                       end
        safe_join([image_html, caption_html].reject(&:blank?), "\n")
      end
    end

    def wysiwyg_media_upload_id(item)
      media = item[:media]
      return media[:id] if media.is_a?(Hash) && media[:id].present?
      return media["id"] if media.is_a?(Hash) && media["id"].present?

      media
    end

    private

    def kubik_editor_image_block
      if Kubik.const_defined?(:EditorjsBlocks, false) &&
         Kubik::EditorjsBlocks.const_defined?(:Image, false)
        Kubik::EditorjsBlocks::Image
      else
        Kubik::Wysiwyg::ImageComponent::ImageBlock
      end
    end
  end
end
