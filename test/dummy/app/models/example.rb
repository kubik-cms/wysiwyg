# frozen_string_literal: true

# Dummy Class for testing

class Example < ApplicationRecord
  include Kubik::Uploadable
  has_one_kubik_upload(self, :upload)
  has_many_kubik_uploads(self, :gallery)
end
