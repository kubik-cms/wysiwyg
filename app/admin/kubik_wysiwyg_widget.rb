# frozen_string_literal: true

# WYSIWYG widget partial endpoint — no sidebar entry.
ActiveAdmin.register_page "Kubik Wysiwyg Widget" do
  menu false

  page_action :show, method: :post do
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.update(
          permitted_params[:widget_id],
          method: "morph",
          partial: "admin/kubik/wysiwyg_widget",
          locals: {
            setup: permitted_params[:setup].to_h,
            data: permitted_params[:data].to_h
          }
        )
      end

      format.json do
        render json: {
          html_data: render_to_string(
            Kubik::WysiwygEditor::WysiwygWidgetComponent.new(
              permitted_params[:setup].to_h,
              permitted_params[:data].to_h
            )
          )
        }
      end
    end
  end

  page_action :new, method: :get do
  end

  controller do
    def permitted_params
      params.permit!
    end
  end
end
