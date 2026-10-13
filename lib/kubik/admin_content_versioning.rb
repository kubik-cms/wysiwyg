# frozen_string_literal: true

module Kubik
  module AdminContentVersioning
    extend ActiveSupport::Concern

    WORKING_VERSION_KEY = "working"

    def admin_content_snapshot_for(version_key)
      key = version_key.presence || default_admin_content_version_key
      return self if key == WORKING_VERSION_KEY

      version = content_versions.find_by(id: key)
      return self unless version

      Kubik::Admin::ContentVersionSnapshot.new(self, version.data)
    end

    def default_admin_content_version_key
      working_copy_differs_from_published? ? WORKING_VERSION_KEY : (published_version&.id&.to_s || WORKING_VERSION_KEY)
    end

    def working_copy_differs_from_published?
      return true if published_version.nil?

      snapshot_data_from_record != published_version.data
    end

    def assign_version_data_for_form(data_hash)
      attrs = (data_hash["attributes"] || data_hash).except("meta_tag")
      assign_attributes(attrs)

      meta = data_hash["meta_tag"]
      return if meta.blank? || !kubik_versionable_meta_tag?

      meta_tag&.assign_attributes(meta)
    end

    def admin_content_version_options
      options = [[admin_working_version_label, WORKING_VERSION_KEY]]
      content_versions.ordered.each do |version|
        options << [admin_content_version_option_label(version), version.id.to_s]
      end
      options
    end

    def admin_working_version_label
      if working_copy_differs_from_published?
        "Current draft (unsaved changes)"
      else
        "Working copy"
      end
    end

    def admin_content_version_option_label(version)
      parts = [version.label_for_admin]
      parts.unshift("Live") if version.live?
      parts.join(" — ")
    end
  end
end
