# frozen_string_literal: true

# Dummy Class for testing

class Example < ApplicationRecord
  include Kubik::Uploadable
  has_one_kubik_upload(:example_upload, :upload)
  has_many_kubik_uploads(:example_gallery, :gallery)
end
