ActiveAdmin.register_page 'Kubik Wysiwyg Widget' do
  page_action :show, method: :post do
    respond_to do |format|
      format.json {
        render json: {
          html_data: render_to_string(
            Kubik::WysiwygWidgetComponent.new(
              permitted_params[:setup].to_h,
              permitted_params[:data].to_h
            )
          )
        }
      }
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

