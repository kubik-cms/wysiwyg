# frozen_string_literal: true

require "test_helper"

class KubikMediaUploadTest < ActiveSupport::TestCase
  # Test for model attachments
  class MixinsDefitions < ActiveSupport::TestCase
    setup do
      @default_example = Example.new
    end

    test "instance defines the single upload method" do
      assert @default_example.respond_to? :example_upload
    end

    test "instance returns nil when single upload empty" do
      assert @default_example.example_upload.nil?
    end

    test "instance defines the multiple upload method" do
      assert @default_example.respond_to? :example_gallery
    end

    test "instance defines the multiple upload method as association" do
      assert @default_example.example_gallery.is_a?(ActiveRecord::Associations::CollectionProxy)
    end

    test "instance returns nil when multiple upload empty" do
      assert @default_example.example_gallery.empty?
    end
  end

  class UploadClasses < ActiveSupport::TestCase
    setup do
      @image_example = Kubik::MediaUpload.create(image: File.open("test/fixtures/files/test_cover.jpg", "rb"))
      @document_example = Kubik::MediaUpload.create(file: File.open("test/fixtures/files/test_document.pdf", "rb"))
    end

    test "correctly extracts mime_type from image" do
      assert_equal "image/jpeg", @image_example.image.mime_type
    end

    test "correctly extracts mime_type from document" do
      assert_equal "application/pdf", @document_example.file.mime_type
    end

    test "leaves document data empty" do
      assert @image_example.file.nil?
    end

    test "Correctly extracts other metadata" do
      assert_instance_of Integer, @image_example.image.size
      assert_instance_of Integer, @image_example.image.width
      assert_instance_of Integer, @image_example.image.height
    end
  end
end
