# frozen_string_literal: true

# WYSIWYG editor endpoint — no sidebar entry (used from other admin forms).
ActiveAdmin.register_page "Kubik Wysiwyg" do
  menu false

  page_action :new, method: :get do
  end
end
