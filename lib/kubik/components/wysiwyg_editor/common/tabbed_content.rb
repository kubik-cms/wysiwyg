module Kubik
  module WysiwygEditor
    class Common::TabbedContent < ViewComponent::Base
      def initialize(tabs, config, data)
        @tabs = tabs.present? ? tabs : []
        @config = config
        @widget_id = config[:widget_id]
        @data = data
      end

      def ui_expanded
        @data.dig(:_ui, :expanded) == true || @data[:expanded] == true
      end

      def tab_checked?(tab, index)
        active = @data.dig(:_ui, :active_tab)
        return active.to_s == tab[:name].to_s if active.present?

        default_tab = @config.dig(:config, :default_active_tab)
        return tab[:name].to_s == default_tab.to_s if default_tab.present?

        index.zero?
      end

      def repeater_visible?(tab)
        Visibility.match?(@data, tab[:repeater_visible_when])
      end

      def group_wysiwyg_tab_fields(fields)
        list = Array(fields)
        groups = []
        i = 0
        while i < list.length
          field = list[i]
          next_field = list[i + 1]
          if field[:field_group].present? &&
             next_field &&
             next_field[:field_group].to_s == field[:field_group].to_s
            groups << { type: :group, field_group: field[:field_group], fields: [field, next_field] }
            i += 2
          else
            groups << { type: :single, field: field }
            i += 1
          end
        end
        groups
      end

      def render_wysiwyg_field_list(fields, tab)
        safe_join(
          group_wysiwyg_tab_fields(fields).map { |entry| render_wysiwyg_field_entry(entry, tab) }
        )
      end

      def render_wysiwyg_field_entry(entry, tab)
        if entry[:type] == :group && entry[:field_group].to_s == 'title_with_heading_level'
          level_field, title_field = entry[:fields]
          return render(
            Kubik::WysiwygEditor::Common::TitleWithHeadingLevel.new(
              level_field: level_field,
              title_field: title_field,
              data: @data,
              widget_id: @widget_id,
              tab: tab
            )
          )
        end

        if entry[:type] == :group
          content_tag(
            :div,
            safe_join(
              entry[:fields].map do |field|
                render(Kubik::WysiwygEditor::Common::Field.new(field, @data, @widget_id, tab))
              end
            ),
            class: "kubik-wysiwyg-field-group kubik-wysiwyg-field-group--#{entry[:field_group]}"
          )
        else
          render(Kubik::WysiwygEditor::Common::Field.new(entry[:field], @data, @widget_id, tab))
        end
      end
    end
  end
end
