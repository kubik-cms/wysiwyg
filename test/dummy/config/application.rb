# frozen_string_literal: true

require_relative "boot"

require "rails/all"
# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)
require "devise"
require "active_record"

module Dummy
  class Application < Rails::Application
    config.load_defaults Rails::VERSION::STRING.to_f
    config.autoload_paths += Dir[Rails.root.join('../../app/models/**/').to_s]
    config.autoload_paths += Dir[Rails.root.join('../../app/controllers/kubik/**/').to_s]
    config.paths["app/views"].unshift(Rails.root.join('../../app/views/').to_s)

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")
  end
end
