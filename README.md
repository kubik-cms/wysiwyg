# KubikMediaLibrary

Add the ability to preview individual model pages.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'kubik_previewable', github: 'primate_inc/kubik_previewable'
```

And then execute:

    $ bundle install
    $ gem install kubik_media_library

## Usage

You can quickly add the ability to preview individual model pages.

```ruby
class Blog < ApplicationRecord
  include include Kubik::Previewable
  kubik_previewable
  ...
end
```

By default preview will use `application` layout and default show template for the model. Both could be overriden and you can also pass in some additional local variables.

```ruby
  kubik_previewable(
    template: lambda { |blog| "kubik_page_templates/#{blog.template}"},
    layout: false,
    locals: lambda { |blog| {
      content: draftjs_to_html(blog, :content)
    } }
  )
```

You can also temporarily remove the preview by setting:

```ruby
  kubik_previewable(
    preview_enabled: false
  )
```

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake test` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and the created tag, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/[USERNAME]/kubik_previewable. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [code of conduct](https://github.com/primate-inc/kubik_previewable/blob/master/CODE_OF_CONDUCT.md).

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

## Code of Conduct

Everyone interacting in the KubikPreviewable project's codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/primate-inc/kubik_previewable/blob/master/CODE_OF_CONDUCT.md).
