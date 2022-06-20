class CreateBookAuthors < ActiveRecord::Migration[6.1]
  def change
    create_table :book_authors do |t|
      t.string :name
      t.text :bio

      t.timestamps
    end
  end
end
