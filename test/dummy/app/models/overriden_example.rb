# frozen_string_literal: true

# Dummy Class for testing

class OverridenExample < Example
  include Kubik::KubikMetatagable
  kubik_metatagable(
    defaults: true,
    title: ->(e) { e.dummy_title },
    description: ->(e) { e.dummy_description }
  )
end
