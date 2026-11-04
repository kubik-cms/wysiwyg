# frozen_string_literal: true

module Kubik
  module WysiwygAutocomplete
    class << self
      def register_collection_search!(active_admin_dsl)
        active_admin_dsl.collection_action :wysiwyg_search, method: :get do
          Kubik::WysiwygAutocomplete.render_json(
            controller: self,
            resource_class: active_admin_config.resource_class,
            query: params[:q]
          )
        end
      end

      def render_json(controller:, resource_class:, query:)
        relation = resource_class.all
        relation = apply_filter(resource_class, relation, query)
        records = relation.limit(25)

        payload = records.map do |record|
          object = if record.respond_to?(:wysiwyg_return_object)
                     record.wysiwyg_return_object
                   elsif record.respond_to?(:return_object)
                     record.return_object
                   else
                     { display_name: record.to_s, id: record.id }
                   end
          { id: record.id, return_object: object }
        end

        controller.render json: payload
      end

      def apply_filter(resource_class, relation, query)
        return relation.reorder(id: :desc) if query.blank?

        if resource_class.respond_to?(:wysiwyg_autocomplete_filter)
          resource_class.wysiwyg_autocomplete_filter(relation, query)
        else
          relation
        end
      end

      def search_path_for(admin_resource_path)
        "#{admin_resource_path}/wysiwyg_search"
      end
    end
  end
end
