module KubikMediaGalleryPageLayoutOverride
  def build_active_admin_head
    within super do
      render "admin/additional_headers"
    end
  end

  def build(*args)
    ## Disable turbo drive globally
    set_attribute :'data-turbo', "false"
    set_attribute :'data-controller', "kubik-modal"
    super
  end
end

ActiveAdmin::Views::Pages::Base.prepend KubikMediaGalleryPageLayoutOverride
