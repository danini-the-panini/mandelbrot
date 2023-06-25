import mandelbrot from "../utils/mandelbrot"
import CanvasController from "./canvas_controller"
import delay from "../utils/delay"
import setRGB from "../utils/setrgb"

export default class extends CanvasController {
  image!: ImageData | null

  connect() {
    super.connect()
    this.image = this.ctx?.createImageData(this.width, this.height)!
  }

  disconnect() {
    super.disconnect()
    this.image = null
  }

  async perform() {
    await delay(1)
    this.draw()
  }

  draw() {
    if (!this.image || !this.ctx) return

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let rgb = mandelbrot(x, y, this.width, this.height)
        setRGB(this.image, x, y, rgb)
      }
    }

    this.ctx.putImageData(this.image, 0, 0)
  }
}
