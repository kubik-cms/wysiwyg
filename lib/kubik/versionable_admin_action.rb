# frozen_string_literal: true

module Kubik
  module VersionableAdminAction
    extend ActiveSupport::Concern

    def self.included(base)
      base.send(:member_action, :create_content_version, method: :post) do
        version = resource.create_version_from_current!(
          label: params[:version_label],
          admin_user: current_admin_user
        )
        redirect_to resource_path(resource), notice: "Created version \"#{version.label_for_admin}\"."
      end

      base.send(:member_action, :publish_content_version, method: :post) do
        version = resource.content_versions.find(params[:version_id])
        version.publish_live!
        redirect_to resource_path(resource), notice: "Version \"#{version.label_for_admin}\" is now live."
      end

      base.send(:member_action, :duplicate_content_version, method: :post) do
        version = resource.content_versions.find(params[:version_id])
        copy = version.duplicate!(admin_user: current_admin_user)
        redirect_to resource_path(resource), notice: "Duplicated as \"#{copy.label_for_admin}\"."
      end
    end
  end
end
