class CreateBookEditions < ActiveRecord::Migration[6.1]
  def change
    create_table :book_editions do |t|
      t.string :edition_name
      t.date :published_date
      t.references :book, null: false, foreign_key: true

      t.timestamps
    end
  end
end
