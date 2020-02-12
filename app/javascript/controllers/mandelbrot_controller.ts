import { Controller } from "stimulus"
import mandelbrot from "utils/mandelbrot"
import { prelog, clearlog } from "utils/prelog"

export default class extends Controller {
  static targets = ['canvas', 'output']

  canvasTarget: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  image: ImageData
  outputTarget: Element

  get height(): number {
    return this.canvasTarget.height
  }

  get width(): number {
    return this.canvasTarget.width
  }

  connect() {
    this.ctx = this.canvasTarget.getContext('2d')
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.image = this.ctx.createImageData(this.width, this.height)

    this.initWork()
  }

  disconnect() {
    this.ctx = null
    this.image = null
    clearlog(this.outputTarget)
  }

  initWork() {
    clearlog(this.outputTarget)
    prelog(this.outputTarget, "Beginning work...")

    setTimeout(() => {
      this.draw()

      prelog(this.outputTarget, "Work done")
    }, 1)
  }

  draw() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let rgb = mandelbrot(x, y)
        this.setRGB(x, y, rgb)
      }
    }

    this.ctx.putImageData(this.image, 0, 0)
  }

  setRGB(x: number, y: number, rgb: number) {
    let idx = (x + y * this.width) * 4
    this.image.data[idx + 0] = (rgb >> 16) & 0xFF // red
    this.image.data[idx + 1] = (rgb >> 8) & 0xFF  // green
    this.image.data[idx + 2] = rgb & 0xFF         // blue
    this.image.data[idx + 3] = 255                // alpha
  }
}
