# frozen_string_literal: true

module Kubik
  module ContentVersionAdminSupport
    extend ActiveSupport::Concern

    included do
      controller do
        before_action :prepare_content_version_edit_form, only: :edit

        def prepare_content_version_edit_form
          return if params[:content_version_id].blank?

          resource.reload
          version = resource.content_versions.find(params[:content_version_id])
          resource.assign_version_data_for_form(version.data)
          @editing_content_version = version
        end

        def update
          if params[:content_version_id].present?
            update_editing_content_version
          else
            super
          end
        end

        def update_editing_content_version
          version = resource.content_versions.find(params[:content_version_id])
          resource.reload
          resource.assign_version_data_for_form(version.data)
          resource.assign_attributes(permitted_params[resource.model_name.param_key.to_sym])

          if resource.valid?
            version.update!(data: resource.snapshot_data_from_record)
            redirect_to resource_path(resource), notice: "Updated version \"#{version.label_for_admin}\"."
          else
            @editing_content_version = version
            render :edit
          end
        end

        def admin_preview_snapshot
          key = params[:content_version_id].presence || resource.default_admin_content_version_key
          resource.admin_content_snapshot_for(key)
        end
      end
    end
  end
end
