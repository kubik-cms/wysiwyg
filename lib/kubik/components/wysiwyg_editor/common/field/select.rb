module Kubik
  module WysiwygEditor
    class Common::Field::Select < ViewComponent::Base
      include FieldBinding

      def initialize(field, data, widget_id, tab, index=nil)
        @field = field
        @data = data.deep_symbolize_keys
        @widget_id = widget_id
        @index = index
        @tab = tab
        @field_label = @field[:label] || @field[:name].humanize
        @field_name = field_store_path(@field, tab, index)
        @field_value = if @field[:store_path].present?
                         value_at_path(@data, @field[:store_path]) || ''
                       elsif @tab[:repeated] || @index.present?
                         @data.dig(@tab[:name].to_sym, :repeated_items, (@index || 0), @field[:name].to_sym) || ''
                       else
                         @data.fetch(@tab[:name].to_sym, {}).fetch(@field[:name].try(:to_sym), '')
                       end

        options = (@field[:options] || []).map { |option| option.respond_to?(:symbolize_keys) ? option.symbolize_keys : option }

        if @field[:store_path].to_s == "settings.source"
          @options = options
          @field_value = @field_value.presence || options.first&.dig(:value) || "manual"
        elsif skip_select_blank?(options)
          @options = options
          resolved = resolved_select_default(options)
          @field_value = resolved if @field_value.blank? && !resolved.nil?
        else
          if @field_value.blank? && @field[:default].present?
            @field_value = @field[:default]
          end

          @options = if @field[:include_blank] == false
                       options
                     else
                       [{ label: "Select an option", value: nil }].concat(options)
                     end
        end
      end

      def field_css_class
        [@field[:css_class]].compact.join(" ").presence
      end

      def hide_label?
        @field[:hide_label] == true
      end

      private

      def skip_select_blank?(options)
        return true if field_value_for(:include_blank) == false
        return true if options.any? { |option| option[:value].to_s == "default" }

        false
      end

      def resolved_select_default(options)
        return field_value_for(:default) if field_key?(:default)

        options.find { |option| option[:value].to_s == "default" }&.dig(:value)
      end

      def field_value_for(key)
        @field[key] || @field[key.to_s]
      end

      def field_key?(key)
        @field.key?(key) || @field.key?(key.to_s)
      end
    end
  end
end

