# frozen_string_literal: true

module KubikWysiwyg
  class Configuration
    attr_writer :admin_path

    def admin_path
      (@admin_path || detect_admin_path).to_s.delete_prefix("/").delete_suffix("/")
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
