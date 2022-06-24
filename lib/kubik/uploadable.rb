# frozen_string_literal: true

module Kubik
  # Uploadable module
  module Uploadable
    include ActiveSupport::Concern

    def self.included(klass)
      klass.extend(ClassMethods)
    end

    module ClassMethods
      def has_one_kubik_upload(model, method_symbol, options={})
        has_one method_symbol,
          -> { where(uploadable_type: "#{model.name.parameterize}_#{method_symbol.to_s}") },
                foreign_key: 'uploadable_id',
                class_name: 'Kubik::Upload',
                dependent: :destroy
        accepts_nested_attributes_for method_symbol, allow_destroy: true
        if options[:validate_presence].present? && options[:validate_presence] == true
          validates_with KubikImagePresentValidator, method_symbol: method_symbol, required: true
        end
      end

      def has_many_kubik_uploads(method_symbol, required=false, options={})
        has_many method_symbol,
                 -> { where(uploadable_type: method_symbol.to_s) },
                 foreign_key: 'uploadable_id',
                 class_name: 'Kubik::Upload',
                 dependent: :destroy
        accepts_nested_attributes_for method_symbol, allow_destroy: true
        validate do |object|
          object.present_if_required(method_symbol) if required == true
        end
      end
    end

    def present_if_required(method_symbol)
      unless send(method_symbol).nil?
        return unless send(method_symbol).kubik_media_upload_id.nil? ||
                      send(method_symbol).kubik_media_upload_id.zero? ||
                      send(method_symbol).kubik_media_upload_id.blank?
      end
      errors.add(method_symbol, "can't be blank")
    end
  end
end
