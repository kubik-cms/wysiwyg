# frozen_string_literal: true

# Configure Rails Environment
ENV["RAILS_ENV"] ||= "test"
require "warning"
require "devise"
require "pry"

require_relative "../test/dummy/config/environment"
ActiveRecord::Migrator.migrations_paths = [File.expand_path("../test/dummy/db/migrate", __dir__)]
ActiveRecord::Migrator.migrations_paths << File.expand_path("../db/migrate", __dir__)
require "rails/test_help"
require "capybara/rails"
require "capybara/minitest"
require "capybara/minitest/spec"
require "active_support/testing/setup_and_teardown"

# Load fixtures from the engine
if ActiveSupport::TestCase.respond_to?(:fixture_path=)
  ActiveSupport::TestCase.fixture_path = File.expand_path("fixtures", __dir__)
  ActionDispatch::IntegrationTest.fixture_path = ActiveSupport::TestCase.fixture_path
  ActiveSupport::TestCase.file_fixture_path = "#{ActiveSupport::TestCase.fixture_path}/files"
  ActiveSupport::TestCase.fixtures :all
end
Gem.path.each do |path|
  Warning.ignore(//, path)
end
unless ENV['SELENIUM_HOST'].nil?
  selenium_host = "http://#{ ENV["SELENIUM_HOST"] }:4444/wd/hub"
end

Capybara.register_driver :selenium_chrome do |app|
  options = Selenium::WebDriver::Chrome::Options.new(args: %w[
    headless no-sandbox disable-gpu window-size=1920x1080
  ])
  Capybara::Selenium::Driver.new(
    app,
    browser: :remote,
    desired_capabilities: :chrome,
    options: options,
    url: selenium_host
  )
end

Capybara.server = :puma, { Silent: true }
Capybara.javascript_driver = :selenium_chrome
Capybara.save_path = "#{ Rails.root }/tmp/screenshots/"

Capybara.raise_server_errors = false
Capybara.default_max_wait_time = 10
Capybara.asset_host = 'http://localhost:3000'
Capybara.configure do |config|
  config.match = :prefer_exact
  config.ignore_hidden_elements = false
  config.visible_text_only = true
  # accept clicking of associated label for checkboxes/radio buttons (css psuedo elements)
  config.automatic_label_click = true
end
Capybara.always_include_port = true

module ActionDispatch
  class IntegrationTest
    # Make the Capybara DSL available in all integration tests
    include Capybara::DSL
    # Make `assert_*` methods behave like Minitest assertions
    include Capybara::Minitest::Assertions

    # Reset sessions and driver between tests
    teardown do
      Capybara.reset_sessions!
      Capybara.use_default_driver
    end
  end
end

module ActiveSupport
  class TestCase
    fixtures :all
    include Devise::Test::IntegrationHelpers
    include Warden::Test::Helpers

    def log_in(user)
      if integration_test?
        login_as(user, scope: :user)
      else
        sign_in(user)
      end
    end
  end
end
