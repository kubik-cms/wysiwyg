# frozen_string_literal: true

ActiveAdmin.register Example do
  permit_params do
    params = %i[
      dummy_title dummy_description
    ]
    ::Kubik::PermitAdditionalAdminParams.push_to_params(Example, params)
    params
  end
  form do |f|
    tabs do
      tab "Content" do
        inputs do
          input :dummy_title
          input :dummy_description
          input :example_upload, as: 'kubik/single_media'
        end
      end
    end
    f.actions
  end

  show do |example|
    tabs do
      tab "Content" do
        attributes_table do
          row :dummy_title
          row :dummy_description
        end
      end
      tab "SEO" do
        render "admin/show/meta_tag_seo_helper", object: example
      end
      tab "Social Media" do
        render "admin/show/meta_tag_social_helper", object: example
      end
    end
  end
end
