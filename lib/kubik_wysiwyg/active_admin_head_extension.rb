# frozen_string_literal: true

module KubikWysiwyg
  module ActiveAdminHeadExtension
    def build_active_admin_head
      within super do
        text_node tag.meta(name: "active-admin-path", content: helpers.kubik_admin_path)
        text_node tag.meta(name: "kubik-wysiwyg-widget-src", content: helpers.kubik_wysiwyg_widget_show_src)
        text_node tag.meta(name: "kubik-media-uploads-src", content: helpers.kubik_media_uploads_modal_src)
        if helpers.respond_to?(:link_targets_admin_kubik_navigation_items_path)
          text_node tag.meta(name: "kubik-navigable-wysiwyg", content: "true")
          if helpers.respond_to?(:search_navigable_admin_kubik_navigation_items_path)
            text_node tag.meta(
              name: "kubik-navigable-search-url",
              content: helpers.search_navigable_admin_kubik_navigation_items_path(format: :json),
            )
          end
          if helpers.respond_to?(:kubik_navigable_filter_options_json)
            text_node tag.meta(
              name: "kubik-navigable-filter-options",
              content: helpers.kubik_navigable_filter_options_json,
            )
          end
          text_node tag.meta(
            name: "kubik-navigable-items-url",
            content: helpers.link_targets_admin_kubik_navigation_items_path(format: :json),
          )
          text_node tag.meta(
            name: "kubik-navigable-resources-url",
            content: helpers.get_resources_admin_kubik_navigation_items_path(format: :json),
          )
          text_node tag.meta(
            name: "kubik-navigable-locations-url",
            content: helpers.navigation_items_for_resource_admin_kubik_navigation_items_path(format: :json),
          )
          if defined?(Kubik::NavigableResources)
            types = Kubik::NavigableResources.instance.select_collection.map do |m|
              { label: m.resource_title, value: m.class_name }
            end
            text_node tag.meta(name: "kubik-navigable-resource-types", content: types.to_json)
          end
        end
      end
    end
  end
end
