ActiveAdmin.register BookAuthor do
  menu parent: 'Books', label: 'Authors', priority: 2
  index as: :blog do |author|
    title :name
    body :bio
  end

  controller do
    def index
      if request.format.json? && params[:kubik_search].present?
        index! {
          collection = scoped_collection.kubik_search(params[:q])
          respond_to do |format|
            format.json { render json: collection.as_json(only: [:id], methods: [:return_object]) }
          end and return
        }
      else
        super
      end
    end

    def show
      if request.format.json? && params[:kubik_search].present?
        index! {
          respond_to do |format|
            format.json { render json: resource.as_json(only: [:id], methods: [:return_object]) }
          end and return
        }
      else
        super
      end
    end
  end

end
