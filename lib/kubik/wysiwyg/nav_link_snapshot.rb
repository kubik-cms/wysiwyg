# frozen_string_literal: true

module Kubik
  module Wysiwyg
    module NavLinkSnapshot
      module_function

      def apply!(document, resolver: default_resolver)
        return document if document.blank?

        if document.is_a?(String)
          parsed = JSON.parse(document)
          deep_snapshot!(parsed, resolver: resolver)
          return JSON.generate(parsed)
        end

        deep_snapshot!(document, resolver: resolver)
      end

      def deep_snapshot!(object, resolver: default_resolver)
        return object unless defined?(Kubik::Navigable::LinkReference)

        Kubik::Navigable::LinkReference.deep_snapshot_nav_links!(object, resolver: resolver)
      end

      def default_resolver
        Kubik::Navigable::LinkReference.default_resolver if defined?(Kubik::Navigable::LinkReference)
      end
    end
  end
end
