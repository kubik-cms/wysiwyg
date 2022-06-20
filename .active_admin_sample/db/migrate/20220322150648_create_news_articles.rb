class CreateNewsArticles < ActiveRecord::Migration[6.1]
  def change
    create_table :news_articles do |t|
      t.string :title
      t.string :header
      t.string :category
      t.text :content
      t.datetime :published_at
      t.boolean :featured

      t.timestamps
    end
  end
end
