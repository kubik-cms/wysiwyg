ActiveAdmin.register BookEdition do
  menu parent: 'Books', label: 'Editions', priority: 3

  permit_params :book_id, :edition_name, :published_date

  # See permitted parameters documentation:
  # https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
  #
  # Uncomment all parameters which should be permitted for assignment
  #
  # permit_params :edition_name, :published_date, :book_id
  #
  # or
  #
  # permit_params do
  #   permitted = [:edition_name, :published_date, :book_id]
  #   permitted << :other if params[:action] == 'create' && current_user.admin?
  #   permitted
  # end

end
