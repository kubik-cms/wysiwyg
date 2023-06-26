# Pin npm packages by running ./bin/importmap

pin "application", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@kubik-cms/interface_elements", to: "https://ga.jspm.io/npm:@kubik-cms/interface_elements@0.1.11/dist/interface_elements.es.js"
pin "@kubik-cms/media_library", to: "https://ga.jspm.io/npm:@kubik-cms/media_library@0.1.9/dist/media_library.es.js"
pin "wysiwyg", to: "@kubik-cms/wysiwyg/wysiwyg.es.js", preload: true
