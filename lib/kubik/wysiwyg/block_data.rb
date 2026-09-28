# frozen_string_literal: true

module Kubik
  module Wysiwyg
    # Strip admin-only keys from block JSON before public rendering.
    module BlockData
      UI_KEY = "_ui"

      module_function

      def strip_ui(data)
        case data
        when Hash
          data.each_with_object({}) do |(key, value), result|
            next if key.to_s == UI_KEY

            result[key] = strip_ui(value)
          end
        when Array
          data.map { |entry| strip_ui(entry) }
        else
          data
        end
      end
    end
  end
end
