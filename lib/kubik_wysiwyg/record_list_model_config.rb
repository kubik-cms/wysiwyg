# frozen_string_literal: true

module KubikWysiwyg
  class RecordListModelConfig
    attr_reader :model_class_name, :widget_name, :admin_search_path, :queries, :default_source,
                :layouts, :render_partial, :layout_partials, :list_item_mapper

    def initialize(
      model_class_name:,
      widget_name:,
      admin_search_path:,
      queries: {},
      default_source: :manual,
      layouts: [],
      render_partial: nil,
      layout_partials: {},
      list_item_mapper: nil
    )
      @model_class_name = model_class_name
      @widget_name = widget_name.to_s
      @admin_search_path = admin_search_path
      @queries = queries.with_indifferent_access
      @default_source = default_source.to_sym
      @layouts = layouts
      @render_partial = render_partial
      @layout_partials = layout_partials.with_indifferent_access
      @list_item_mapper = list_item_mapper
    end

    def model_class
      model_class_name.constantize
    end

    def resolve_admin_search_path(view_context = nil)
      path = admin_search_path
      path = path.call(view_context) if path.respond_to?(:call)
      path.to_s
    end

    def map_record(record, view_context:)
      if list_item_mapper.respond_to?(:call)
        list_item_mapper.call(record, view_context: view_context)
      elsif model_class.respond_to?(:wysiwyg_list_item)
        model_class.wysiwyg_list_item(record, view_context: view_context)
      else
        {
          title: record.try(:title) || record.try(:name) || record.to_s,
          link: nil
        }
      end
    end
  end
end
