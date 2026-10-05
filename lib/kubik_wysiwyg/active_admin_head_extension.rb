# frozen_string_literal: true

module KubikWysiwyg
  module ActiveAdminHeadExtension
    def build_active_admin_head
      within super do
        text_node tag.meta(name: "active-admin-path", content: helpers.kubik_admin_path)
        text_node tag.meta(name: "kubik-wysiwyg-widget-src", content: helpers.kubik_wysiwyg_widget_show_src)
        text_node tag.meta(name: "kubik-media-uploads-src", content: helpers.kubik_media_uploads_modal_src)
      end
    end
  end
end
