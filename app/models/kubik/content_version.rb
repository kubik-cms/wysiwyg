# frozen_string_literal: true

module Kubik
  class ContentVersion < ApplicationRecord
    self.table_name = "kubik_content_versions"

    include Kubik::Publishable
    kubik_publishable column: :published_at

    belongs_to :versionable, polymorphic: true
    belongs_to :admin_user, optional: true

    validates :data, presence: true

    scope :ordered, -> { order(updated_at: :desc) }

    def publish_live!
      transaction do
        versionable.content_versions.where(live: true).where.not(id: id).update_all(live: false)
        update!(live: true, published_at: Time.current)
        versionable.update!(
          published_version_id: id,
          published_at: Time.current
        )
        versionable.apply_version_data!(data)
      end
    end

    def duplicate!(label: nil, admin_user: nil)
      versionable.content_versions.create!(
        label: label.presence || "Copy of #{label_for_admin}",
        data: data.deep_dup,
        admin_user_id: admin_user&.id
      )
    end

    def label_for_admin
      label.presence || "Version #{id}"
    end
  end
end
