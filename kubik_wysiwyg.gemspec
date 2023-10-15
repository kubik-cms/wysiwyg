Gem::Specification.new do |spec|
  spec.name          = "kubik_wysiwyg"
  spec.version       = "0.1.8"
  spec.authors       = ["Bart Oleszczyk"]
  spec.email         = ["bart@primate.co.uk"]

  spec.summary       = "Wysiwyg for Kubik CMS"
  spec.description   = "Active admin media library extension"
  spec.homepage      = "https://github.com/primate-inc/kubik_wysiwyg"
  spec.license       = "MIT"

  spec.metadata["allowed_push_host"] = "TODO: Set to 'http://mygemserver.com'"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = spec.homepage
  spec.metadata["changelog_uri"] = "#{spec.homepage}/CHANGELOG.md"

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{\A(?:test|spec|features)/}) }
  end
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  # Uncomment to register a new dependency of your gem
  # spec.add_dependency "example-gem", "~> 1.0"
  spec.add_dependency "activeadmin", ">= 1.2.1"
  spec.add_development_dependency "pg"
  spec.add_dependency "rails", "> 6.0"
  spec.add_dependency "view_component", "~> 3.0"
  spec.add_development_dependency "warning"

  # For more information and examples about making a new gem, checkout our
  # guide at: https://bundler.io/guides/creating_gem.html
end
