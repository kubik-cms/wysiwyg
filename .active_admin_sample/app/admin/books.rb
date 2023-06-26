ActiveAdmin.register Book do
  menu parent: 'Books', priority: 1

  config.per_page = 5

  permit_params :title, :genre, :book_author_id, :genres, :description,
                cover_attributes: [:kubik_media_upload_id, :_destroy, :id],
                book_gallery_attributes: [:kubik_media_upload_id, :id, :_destroy],
                book_editions_attributes: [:edition_name, :_destroy, :id, :'published_date(1i)', :'published_date(2i)', :'published_date(3i)']


  index as: :grid, columns: 4 do |book|
    link_to(book.try(:cover).try(:present?) ? image_tag(book.cover.try(:image_url, :thumb_200x200)) : 'No cover', admin_book_path(book))
  end

  form do |f|
    f.inputs 'Main' do
      f.input :title,  hint: 'Title of the book'
      f.input :book_author, hint: 'Main author of the book'
      if defined?(KubikMediaLibrary)
        f.input :cover, as: :'kubik/single_media', hint: 'Cover image'
        f.input :book_gallery, as: :'kubik/multiple_media', hint: 'Gallery images'
      end
      f.input :genres, as: :check_boxes, collection: Book::GENRES
      f.input :description,
        as: :'kubik/wysiwyg',
        hint: 'Book description',
        url: admin_kubik_wysiwyg_path,
        widgets: {
          authors: { name: 'Author', url: BookAuthor.list_url }
        }
    end
    f.has_many :book_editions, remove_record: 'Remove Edition',
                               add_record: 'Add Book Edition',
                               heading: 'Manage editions',
                               allow_destroy: true do |e|
      e.input :edition_name
      e.input :published_date
    end
    f.actions
  end

  show do
    panel 'Book Editions' do
      table_for book.book_editions do
        column :id
        column :edition_name
        column :published_date
      end
    end
    panel 'Author details' do
      attributes_table_for book.book_author do
        row :name
        row :bio
      end
    end

  end

  sidebar 'Book details', except: :index do
    attributes_table_for book do
      row :title
      row :book_author
      row :genres
      row :book_cover do
        image_tag book.cover.image_url(:thumb_200x200) if book.try(:cover).try(:present?)
      end
      row :created_at
      row :updated_at
    end
  end
end
