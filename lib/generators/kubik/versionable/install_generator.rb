# frozen_string_literal: true

require "rails/generators/active_record"

module Kubik
  module Generators
    module Versionable
      class InstallGenerator < ActiveRecord::Generators::Base
        source_root File.expand_path("templates", __dir__)

        desc "Install kubik_content_versions table for kubik_versionable"

        def db_migration
          migration_template(
            "create_kubik_content_versions.rb.erb",
            "db/migrate/create_kubik_content_versions.rb",
            migration_version: migration_version
          )
        end

        def install_notice
          say "Add published_version belongs_to on each versionable model in a host migration.", :yellow
          say "Then: bin/rails db:migrate", :green
        end

        private

        def migration_version
          "[#{Rails::VERSION::MAJOR}.#{Rails::VERSION::MINOR}]"
        end
      end
    end
  end
end
