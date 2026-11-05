# frozen_string_literal: true

module Kubik
  module Wysiwyg
    module SnapshotsNavLinks
      extend ActiveSupport::Concern

      included do
        before_save :kubik_snapshot_nav_links_in_wysiwyg_fields
      end

      class_methods do
        def snapshots_nav_links_in(*attribute_names)
          @kubik_nav_link_snapshot_attributes = attribute_names.map(&:to_sym)
        end

        def kubik_nav_link_snapshot_attributes
          @kubik_nav_link_snapshot_attributes || [:content]
        end
      end

      private

      def kubik_snapshot_nav_links_in_wysiwyg_fields
        self.class.kubik_nav_link_snapshot_attributes.each do |attr|
          next unless respond_to?(attr)

          raw = public_send(attr)
          next if raw.blank?

          updated = Kubik::Wysiwyg::NavLinkSnapshot.apply!(raw)
          next if updated == raw

          public_send(:"#{attr}=", updated)
        end
      end
    end
  end
end
