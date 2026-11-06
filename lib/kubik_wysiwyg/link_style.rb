# frozen_string_literal: true

module KubikWysiwyg
  # Host apps assign {adapter=} to supply brand-specific link style labels.
  module LinkStyle
    class << self
      attr_accessor :adapter

      def default_pairs
        call(:default_pairs) || []
      end

      def pairs_from_widget_options(options)
        call(:pairs_from_widget_options, options) || []
      end

      def add_link_label
        call(:add_link_label) || "Add Link"
      end

      def add_another_link_label
        call(:add_another_link_label) || "Add another link"
      end

      def link_row_summary_text(text, style_label)
        call(:link_row_summary_text, text, style_label) || "#{text} (#{style_label})"
      end

      def destination_label(current)
        call(:destination_label, current).to_s
      end

      def destination_filter(current)
        call(:destination_filter, current)
      end

      private

      def call(method, *args)
        return unless adapter&.respond_to?(method)

        adapter.public_send(method, *args)
      end
    end
  end
end
