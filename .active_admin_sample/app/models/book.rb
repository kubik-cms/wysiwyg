class Book < ApplicationRecord
  include Kubik::Uploadable

  GENRES = %i[thriller crime horror fantasy]

  has_one_kubik_upload self, :cover, { validate_presence: true }
  has_many_kubik_uploads(:book_gallery)

  belongs_to :book_author
  has_many :book_editions
  accepts_nested_attributes_for :book_editions, allow_destroy: true

  validates_presence_of :title
  delegate :name, to: :book_author, prefix: true
end
