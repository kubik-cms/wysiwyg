# frozen_string_literal: true

module Kubik
  module Admin
    # Read-only view of a versionable record using a content version JSON payload.
    class ContentVersionSnapshot < SimpleDelegator
      def initialize(record, snapshot_data)
        super(record)
        @record = record
        @snapshot = snapshot_data || {}
        @attributes = @snapshot["attributes"] || @snapshot
      end

      def [](key)
        key_str = key.to_s
        if @attributes.key?(key_str)
          @attributes[key_str]
        else
          @record.public_send(key)
        end
      end

      def method_missing(method_name, ...)
        key = method_name.to_s
        key = key.chomp("=") if key.end_with?("=")
        if @attributes.key?(key) && !key.end_with?("=")
          @attributes[key]
        else
          super
        end
      end

      def respond_to_missing?(method_name, include_private = false)
        key = method_name.to_s
        @attributes.key?(key) || @record.respond_to?(method_name, include_private)
      end

      def meta_tag
        base = @record.meta_tag
        meta_attrs = @snapshot["meta_tag"]
        return base if meta_attrs.blank?

        base.tap { |tag| tag.assign_attributes(meta_attrs) }
      end

      def __getobj__
        @record
      end
    end
  end
end
