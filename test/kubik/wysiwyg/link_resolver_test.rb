# frozen_string_literal: true

require "test_helper"
require "kubik/wysiwyg/link_resolver"

class KubikWysiwygLinkResolverTest < ActiveSupport::TestCase
  test "normalizes legacy url rows" do
    row = Kubik::Wysiwyg::LinkResolver.normalize_row(
      { "text" => "Read more", "url" => "/articles", "target" => "_blank", "style" => "blue" },
      href_resolver: nil,
    )

    assert_equal "Read more", row[:text]
    assert_equal "/articles", row[:url]
    assert_equal "_blank", row[:target]
    assert_equal "blue", row[:style]
  end

  test "resolves navigable url kind" do
    row = Kubik::Wysiwyg::LinkResolver.normalize_row(
      {
        "text" => "External",
        "nav_link" => { "kind" => "url", "href" => "https://example.com" },
      },
      href_resolver: nil,
    )

    assert_equal "https://example.com", row[:url]
  end

  test "normalize_content_link prefers nav_link with legacy fallbacks" do
    link = Kubik::Wysiwyg::LinkResolver.normalize_content_link(
      {
        "link_text" => "Go",
        "link" => "/legacy",
        "nav_link" => { "kind" => "url", "href" => "https://example.com", "text" => "Go" },
      },
      href_resolver: nil,
    )

    assert_equal "Go", link[:text]
    assert_equal "https://example.com", link[:url]
  end

  test "uses resolved_href when live resolve fails" do
    row = Kubik::Wysiwyg::LinkResolver.normalize_row(
      {
        "text" => "Go",
        "nav_link" => {
          "kind" => "item",
          "navigation_item_id" => 1,
          "resolved_href" => "/saved-path",
        },
      },
      href_resolver: ->(_ref) { nil },
    )

    assert_equal "/saved-path", row[:url]
    assert row[:stale]
  end

  test "includes rel from nav_link" do
    row = Kubik::Wysiwyg::LinkResolver.normalize_row(
      {
        "nav_link" => {
          "kind" => "url",
          "href" => "https://example.com",
          "text" => "Go",
          "rel" => "noopener noreferrer",
        },
      },
      href_resolver: nil,
    )

    assert_equal "noopener noreferrer", row[:rel]
  end
end
