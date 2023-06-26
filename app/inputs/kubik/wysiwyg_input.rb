module Kubik
  class WysiwygInput
    include Formtastic::Inputs::Base

    def to_html
      @url = options[:url]
      @widgets = options[:widgets].to_json
      input_wrapping do
        div_wrapper(
          label_html << builder.hidden_field(method, input_html_options.merge('data-editor-target': 'input')),
        )
      end
    end

    private

    def div_wrapper(input)
      "
        <div data-controller='editor' data-editor-widgets-url-value='#{@url}' data-editor-widgets-value='#{@widgets}'>
          #{input} <div data-editor-target='editor'></div>
        </div>
      ".html_safe
    end

  end
end
