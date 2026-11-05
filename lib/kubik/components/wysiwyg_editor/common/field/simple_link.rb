# frozen_string_literal: true

module Kubik
  module WysiwygEditor
    class Common::Field::SimpleLink < ViewComponent::Base
      include FieldBinding

      def initialize(field, data, widget_id, tab, index = nil)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @tab = tab
        @index = index
        @tab_data = @data.fetch(tab[:name].to_sym, {})
        @link = @tab_data[:link].to_s
        @link_text = @tab_data[:link_text].to_s
        @target = @tab_data[:target].to_s
        @rel = @tab_data[:rel].to_s
        @prefix = tab[:name]
      end

      def field_name(attribute)
        "#{@prefix}.#{attribute}"
      end

      def target_options
        link_options(Kubik::Navigable::LinkAttributeOptions::TARGET_OPTIONS, @target)
      rescue NameError
        link_options(default_target_options, @target)
      end

      def rel_options
        link_options(Kubik::Navigable::LinkAttributeOptions::REL_OPTIONS, @rel)
      rescue NameError
        link_options(default_rel_options, @rel)
      end

      private

  def link_options(pairs, selected)
    pairs.map { |label, value| [label, value] }
  end

      def default_target_options
        [["Same tab", ""], ["New tab", "_blank"], ["Parent frame", "_parent"], ["Top frame", "_top"]]
      end

      def default_rel_options
        [
          ["None", ""],
          ["noopener noreferrer", "noopener noreferrer"],
          ["noopener", "noopener"],
          ["noreferrer", "noreferrer"],
          ["nofollow", "nofollow"],
        ]
      end
    end
  end
end
