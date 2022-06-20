# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_05_22_231902) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_admin_comments", force: :cascade do |t|
    t.string "namespace"
    t.text "body"
    t.string "resource_type"
    t.bigint "resource_id"
    t.string "author_type"
    t.bigint "author_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["author_type", "author_id"], name: "index_active_admin_comments_on_author"
    t.index ["namespace"], name: "index_active_admin_comments_on_namespace"
    t.index ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource"
  end

  create_table "admin_users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "book_authors", force: :cascade do |t|
    t.string "name"
    t.text "bio"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "book_editions", force: :cascade do |t|
    t.string "edition_name"
    t.date "published_date"
    t.bigint "book_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["book_id"], name: "index_book_editions_on_book_id"
  end

  create_table "books", force: :cascade do |t|
    t.string "title"
    t.string "genres"
    t.bigint "book_author_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["book_author_id"], name: "index_books_on_book_author_id"
  end

  create_table "kubik_media_uploads", force: :cascade do |t|
    t.jsonb "image_data", default: {}, null: false
    t.jsonb "file_data", default: {}, null: false
    t.jsonb "additional_info", default: {"alt_text"=>""}, null: false
    t.string "aasm_state"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["additional_info"], name: "index_kubik_media_uploads_on_additional_info", using: :gin
    t.index ["file_data"], name: "index_kubik_media_uploads_on_file_data", using: :gin
    t.index ["image_data"], name: "index_kubik_media_uploads_on_image_data", using: :gin
  end

  create_table "kubik_uploads", force: :cascade do |t|
    t.string "uploadable_type"
    t.bigint "uploadable_id"
    t.bigint "kubik_media_upload_id"
    t.jsonb "additional_info", default: {}, null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["additional_info"], name: "index_kubik_uploads_on_additional_info", using: :gin
    t.index ["kubik_media_upload_id"], name: "index_kubik_uploads_on_kubik_media_upload_id"
    t.index ["uploadable_type", "uploadable_id"], name: "index_kubik_uploads_on_uploadable"
  end

  create_table "news_articles", force: :cascade do |t|
    t.string "title"
    t.string "header"
    t.string "category"
    t.text "content"
    t.datetime "published_at"
    t.boolean "featured"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  add_foreign_key "book_editions", "books"
  add_foreign_key "books", "book_authors"
end
