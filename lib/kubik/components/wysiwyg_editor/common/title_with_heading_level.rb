# frozen_string_literal: true

module Kubik
  module WysiwygEditor
    class Common::TitleWithHeadingLevel < ViewComponent::Base
      def initialize(level_field:, title_field:, data:, widget_id:, tab:, index: nil)
        @level_field = level_field
        @title_field = title_field
        @data = data
        @widget_id = widget_id
        @tab = tab
        @index = index
        @title_label = @title_field[:label] || @title_field[:name].to_s.humanize
      end

      def title_input_id
        "#{@title_field[:name]}-#{@widget_id}"
      end

      def level_select
        Kubik::WysiwygEditor::Common::Field::Select.new(
          @level_field, @data, @widget_id, @tab, @index
        )
      end

      def title_input
        Kubik::WysiwygEditor::Common::Field::TextInput.new(
          @title_field, @data, @widget_id, @tab, @index, hide_label: true
        )
      end
    end
  end
end
