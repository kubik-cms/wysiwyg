##  custom blank slate
class MediaGalleryBlankSlate < ActiveAdmin::Component
  builder_method :blank_slate

  def default_class_name
    'blank_slate_container'
  end

  def build(content)
    super(span("HoHoHo.", class: "blank_slate"))
  end
end
