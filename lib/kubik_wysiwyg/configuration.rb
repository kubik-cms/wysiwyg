# frozen_string_literal: true

module KubikWysiwyg
  class Configuration
    attr_writer :admin_path

    def initialize
      @record_list_models = {}
    end

    def admin_path
      (@admin_path || detect_admin_path).to_s.delete_prefix("/").delete_suffix("/")
    end

    def record_list_models
      @record_list_models
    end

    def register_record_list_model(model_class_name, **options)
      widget_name = options.fetch(:widget_name).to_s
      @record_list_models[widget_name] = RecordListModelConfig.new(
        model_class_name: model_class_name,
        widget_name: widget_name,
        admin_search_path: options.fetch(:admin_search_path),
        queries: options[:queries] || {},
        default_source: options[:default_source] || :manual,
        layouts: options[:layouts] || [],
        render_partial: options[:render_partial],
        layout_partials: options[:layout_partials] || {},
        list_item_mapper: options[:list_item_mapper]
      )
      Kubik::EditorRenderer.reset_blocks_cache! if defined?(Kubik::EditorRenderer)
    end

    private

    def detect_admin_path
      if defined?(ActiveAdmin) && ActiveAdmin.application&.namespaces&.[](:admin)
        ActiveAdmin.application.namespaces[:admin].route_options[:path] || "admin"
      else
        "admin"
      end
    end
  end

  class << self
    attr_accessor :configuration

    def configuration
      @configuration ||= Configuration.new
    end

    def configure
      yield(configuration)
    end

    def config
      configuration
    end
  end
end
