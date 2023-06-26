class BookAuthor < ApplicationRecord

  # Needs to go into a gem

  scope :kubik_search, ->(query) { where('lower(name) LIKE ?', "%" + BookAuthor.sanitize_sql_like(query) + "%") }

  def display_name
    name
  end

  def self.list_url
    Rails.application.routes.url_helpers.admin_book_authors_path(kubik_search: true, format: :json)
  end

  def return_object
    {
      display_name: display_name,
      id: id,
      thumb: 'https://via.placeholder.com/150',
      additional_info: 'English',
      status_info: { active: 'Published', inactive: (display_name.length > 14).to_s },
      url: Rails.application.routes.url_helpers.admin_book_author_path(self, kubik_search: true, format: :json)
    }
  end
end
