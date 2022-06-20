# frozen_string_literal: true

require "test_helper"

class BlogTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  setup do
    visit "/admin/login"
    sign_in admin_users(:admin)
    assert_equal(page.status_code, 200)
  end

  test "edit example has appropraite inputs" do
    visit admin_examples_path

    within(".index_as_table") do
      click_on "Edit"
    end
    page.assert_all_of_selectors(:css, "#example_example_upload_input", visible: true, wait: 2)
    page.has_selector?('#example_example_upload_input[data-controller="image_selector"]')
    page.has_selector?('#example_example_upload_input[data-image_selector-related-media-value="{\"id\":null,\"thumb\":null,\"kubik_media_upload_id\":null}"]')
  end
end
