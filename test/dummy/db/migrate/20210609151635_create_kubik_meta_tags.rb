# frozen_string_literal: true

# Main migration for metataggable functionality
class CreateKubikMetaTags < ActiveRecord::Migration[5.1]
  # rubocop:disable Metrics/MethodLength
  def change
    create_table :kubik_meta_tags do |t|
      t.string    :title_tag
      t.text      :meta_description
      t.text      :og_title
      t.text      :og_description
      t.text      :og_image
      t.text      :twitter_title
      t.text      :twitter_description
      t.text      :twitter_media
      t.text      :twitter_card_type
      t.integer   :metatagable_id
      t.string    :metatagable_type

      t.timestamps
    end
  end
  # rubocop:enable Metrics/MethodLength
end
