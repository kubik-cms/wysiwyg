# frozen_string_literal: true

module Kubik
  module Wysiwyg
    class RecordListResolver
      def self.call(data, widget_name:, view_context:)
        new(data, widget_name: widget_name, view_context: view_context).resolve
      end

      def initialize(data, widget_name:, view_context:)
        @data = data.deep_symbolize_keys
        @config = KubikWysiwyg.config.record_list_models[widget_name.to_s]
        @view_context = view_context
      end

      def resolve
        return [] unless @config

        case source
        when :live_query
          resolve_live_query
        when :snapshot
          resolve_snapshot
        else
          resolve_manual
        end
      end

      def source
        (@data.dig(:settings, :source).presence || @config.default_source).to_sym
      end

      private

      def model_class
        @config.model_class
      end

      def resolve_manual
        rows = Array(@data.dig(:items, :repeated_items))
        rows.filter_map do |row|
          row = row.deep_symbolize_keys
          record_id = row.dig(:record, :id) || row[:record_id]
          next if record_id.blank?

          record = model_class.find_by(id: record_id)
          next unless record

          @config.map_record(record, view_context: @view_context).merge(
            row.except(:record, :record_id, :_ui)
          )
        end
      end

      def resolve_snapshot
        ids = Array(@data.dig(:items, :snapshot_ids)).map(&:to_i).reject(&:zero?)
        ids.filter_map do |record_id|
          record = model_class.find_by(id: record_id)
          next unless record

          @config.map_record(record, view_context: @view_context)
        end
      end

      def resolve_live_query
        query_key = @data.dig(:settings, :query_key).to_s
        limit = (@data.dig(:settings, :query_limit).presence || 5).to_i
        params = query_params_hash

        scope = nil
        if model_class.respond_to?(:wysiwyg_scopes)
          scopes = model_class.wysiwyg_scopes
          scope = scopes[query_key.to_sym] || scopes[query_key]
        end
        return [] unless scope.respond_to?(:call)

        records = scope.call(limit: limit, **params)
        records = records.to_a if records.respond_to?(:to_a)

        records.filter_map do |record|
          @config.map_record(record, view_context: @view_context)
        end
      end

      def query_params_hash
        raw = @data.dig(:settings, :query_params)
        case raw
        when Hash
          raw.symbolize_keys
        when String
          return {} if raw.blank?

          JSON.parse(raw).symbolize_keys
        else
          {}
        end
      rescue JSON::ParserError
        {}
      end
    end
  end
end
