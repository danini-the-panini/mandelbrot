import CanvasController from "./canvas_controller"
import setRGB from "../utils/setrgb"
import delay from "../utils/delay"

import assembly from '../wasm/assembly.wasm?init'
import wasmSupported from "../utils/wasmSupported"

type MandelbrotFn = (x: number, y: number, widtH: number, height: number) => number

export default class extends CanvasController {
  image!: ImageData | null
  mandelbrot: MandelbrotFn

  async connect() {
    if (!wasmSupported()) this.prelog('*** error: no wasm ***')
    super.connect()
    this.image = this.ctx?.createImageData(this.width, this.height)!
    let instance = await assembly({})
    this.mandelbrot = instance.exports.mandelbrot as MandelbrotFn
  }

  disconnect() {
    super.disconnect()
    this.image = null
  }

  async perform() {
    this.draw()
  }

  draw() {
    if (!this.image || !this.ctx) return

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let rgb = this.mandelbrot(x, y, this.width, this.height)
        setRGB(this.image, x, y, rgb)
      }
    }

    this.ctx.putImageData(this.image, 0, 0)
  }
}
