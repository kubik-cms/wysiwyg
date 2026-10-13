# frozen_string_literal: true

module Kubik
  module Versionable
    extend ActiveSupport::Concern

    class_methods do
      attr_reader :kubik_versionable_opts

      private

      def kubik_versionable(fields:, meta_tag: false)
        @kubik_versionable_opts = { fields: fields.map(&:to_sym), meta_tag: meta_tag }.freeze
      end
    end

    included do
      include Kubik::AdminContentVersioning

      has_many :content_versions,
               class_name: "Kubik::ContentVersion",
               as: :versionable,
               dependent: :destroy

      belongs_to :published_version,
                 class_name: "Kubik::ContentVersion",
                 optional: true
    end

    def create_version_from_current!(label: nil, admin_user: nil)
      content_versions.create!(
        label: label,
        data: snapshot_data_from_record,
        admin_user_id: admin_user&.id
      )
    end

    def apply_version_data!(data_hash)
      attrs = (data_hash["attributes"] || data_hash).except("meta_tag")
      assign_attributes(attrs)
      save!

      meta = data_hash["meta_tag"]
      return if meta.blank? || !kubik_versionable_meta_tag?

      meta_tag.assign_attributes(meta)
      meta_tag.save!
    end

    def published_snapshot
      Kubik::Versionable::PublicView.new(self)
    end

    def snapshot_data_from_record
      data = kubik_versionable_field_names.index_with { |field| public_send(field) }
      payload = { "attributes" => data.stringify_keys }
      if kubik_versionable_meta_tag? && meta_tag
        payload["meta_tag"] = meta_tag.attributes.except("id", "metatagable_id", "metatagable_type", "created_at", "updated_at")
      end
      payload
    end

    def kubik_versionable_field_names
      self.class.kubik_versionable_opts[:fields]
    end

    def kubik_versionable_meta_tag?
      self.class.kubik_versionable_opts[:meta_tag]
    end
  end
end
