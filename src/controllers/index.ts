import { Application } from "@hotwired/stimulus"

const application = Application.start()

import MandelbrotController from './mandelbrot_controller'
application.register('mandelbrot', MandelbrotController)
