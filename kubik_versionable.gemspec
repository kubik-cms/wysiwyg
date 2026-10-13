# frozen_string_literal: true

require_relative "lib/kubik_versionable/version"

Gem::Specification.new do |spec|
  spec.name = "kubik_versionable"
  spec.version = KubikVersionable::VERSION
  spec.summary = "Content versioning for Kubik CMS"
  spec.description = "Editorial versions with a single live published snapshot"
  spec.authors = ["Kubik CMS"]
  spec.email = ["dev@kubik.cms"]
  spec.homepage = "https://github.com/kubik-cms/kubik_versionable"
  spec.license = "MIT"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = spec.homepage

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    files = `git ls-files -z 2>/dev/null`.split("\x0")
    if files.empty?
      Dir.glob("{app,lib}/**/*", File::FNM_DOTMATCH).select { |f| File.file?(f) } + ["README.md"]
    else
      files.reject { |f| f.match(%r{\A(?:test|spec)/}) }
    end
  end

  spec.required_ruby_version = ">= 3.1.0"
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "activeadmin", ">= 3.0"
  spec.add_runtime_dependency "activerecord", ">= 7.0"
  spec.add_runtime_dependency "kubik_publishable", ">= 0.2.0"
  spec.add_runtime_dependency "rails", ">= 7.0"
end
