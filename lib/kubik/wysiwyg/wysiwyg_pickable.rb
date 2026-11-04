# frozen_string_literal: true

module Kubik
  module WysiwygPickable
    extend ActiveSupport::Concern

    class_methods do
      def wysiwyg_scopes
        {}
      end

      def wysiwyg_list_item(record, view_context:)
        {
          title: record.try(:title) || record.try(:name) || "##{record.id}",
          subtitle: nil,
          description: nil,
          link: nil,
          link_text: nil,
          image: nil
        }
      end

      def wysiwyg_autocomplete_filter(relation, query)
        if relation.respond_to?(:ransack)
          relation.ransack(title_cont: query).result
        elsif column_names.include?("name")
          relation.where("name ILIKE ?", "%#{ActiveRecord::Base.sanitize_sql_like(query)}%")
        elsif column_names.include?("title")
          relation.where("title ILIKE ?", "%#{ActiveRecord::Base.sanitize_sql_like(query)}%")
        else
          relation
        end
      end
    end

    def wysiwyg_return_object
      return_object
    end

    def return_object
      {
        display_name: wysiwyg_display_name,
        id: id,
        thumb: wysiwyg_thumb_url,
        additional_info: wysiwyg_additional_info,
        status_info: wysiwyg_status_info
      }.compact
    end

    def wysiwyg_display_name
      try(:title) || try(:name) || "Record ##{id}"
    end

    def wysiwyg_thumb_url
      nil
    end

    def wysiwyg_additional_info
      nil
    end

    def wysiwyg_status_info
      {}
    end
  end
end
