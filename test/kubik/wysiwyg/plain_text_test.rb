# frozen_string_literal: true

require "test_helper"

class KubikWysiwygPlainTextTest < Minitest::Test
  def test_strips_html_fragments
    html = "<p>Hello <strong>world</strong></p>"
    assert_equal "Hello world", Kubik::Wysiwyg::PlainText.from(html)
  end

  def test_extracts_text_from_editorjs_paragraph_blocks
    document = {
      blocks: [
        { type: "paragraph", data: { text: "First paragraph." } },
        { type: "header", data: { text: "Section title", level: 2 } }
      ]
    }

    text = Kubik::Wysiwyg::PlainText.from(document.to_json)
    assert_includes text, "First paragraph."
    assert_includes text, "Section title"
  end

  def test_returns_squished_plain_string_for_non_json_input
    assert_equal "Plain copy", Kubik::Wysiwyg::PlainText.from("  Plain copy  ")
  end

  def test_deprecated_constant_alias
    assert_equal Kubik::Wysiwyg::PlainText, Kubik::WysiwygPlainText
  end
end
