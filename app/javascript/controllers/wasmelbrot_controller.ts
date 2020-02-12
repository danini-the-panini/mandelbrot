import ApplicationController from "./application"
import setRGB from "utils/setrgb"
import delay from "utils/delay"

export default class extends ApplicationController {
  image: ImageData
  wasmelbrot: typeof import('../wasm/wasmelbrot')

  connect() {
    super.connect()
    this.image = this.ctx.createImageData(this.width, this.height)
  }

  disconnect() {
    super.disconnect()
    this.image = null
  }

  async initialize() {
    this.wasmelbrot = await import('wasm/wasmelbrot')
  }

  async perform() {
    await delay(1)
    this.draw()
  }

  draw() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let rgb = this.wasmelbrot.mandelbrot(x, y, this.width, this.height)
        setRGB(this.image, x, y, rgb)
      }
    }

    this.ctx.putImageData(this.image, 0, 0)
  }
}
