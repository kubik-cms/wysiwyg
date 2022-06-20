# frozen_string_literal: true

# Migration for dummy model
class CreateExamples < ActiveRecord::Migration[6.0]
  def change
    create_table :examples do |t|
      t.string    :dummy_title
      t.string    :dummy_description
    end
  end
end
