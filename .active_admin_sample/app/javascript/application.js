// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails

import { Application } from "@hotwired/stimulus"
import { Turbo } from "@hotwired/turbo-rails"

import { ImageSelectorController,
         MultipleImageSelectorController,
         ImageDropzoneController } from "@kubik-cms/media_library"
import { ModalController, modalInit } from "@kubik-cms/interface_elements"
import Wysiwyg from "wysiwyg";
import EditorController from "./controllers/wysiwyg"

const KubikInterfaceStimulus = Application.start()

if(typeof KubikInterfaceStimulus != 'undefined') {
  KubikInterfaceStimulus.register("editor", EditorController)
  KubikInterfaceStimulus.register("kubik-widget", Wysiwyg.KubikWidgetController)
  KubikInterfaceStimulus.register("kubik-autocomplete", Wysiwyg.KubikAutocompleteController)
  KubikInterfaceStimulus.register("image_selector", ImageSelectorController)
  KubikInterfaceStimulus.register("multiple_image_selector", MultipleImageSelectorController)
  KubikInterfaceStimulus.register("image_dropzone", ImageDropzoneController)
  KubikInterfaceStimulus.register("kubik-modal", ModalController)
}
modalInit()
