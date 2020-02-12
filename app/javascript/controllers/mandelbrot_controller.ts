import { Controller } from "stimulus"

const MAX_ITER = 570
const ZOOM = 150.0

function clamp(x : number) : number {
  if (x < 0) return 0
  if (x > 1) return 1
  return x
}

export default class extends Controller {
  canvasTarget : HTMLCanvasElement
  ctx : CanvasRenderingContext2D
  image : ImageData

  static targets = ['canvas']

  get height() : number {
    return this.canvasTarget.height
  }

  get width(): number {
    return this.canvasTarget.width
  }

  connect() {
    this.ctx = this.canvasTarget.getContext('2d')
    this.image = this.ctx.createImageData(this.width, this.height)

    this.draw()
  }

  draw() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let rgb = this.computeColor(x, y)
        this.setRGB(x, y, rgb)
      }
    }

    this.ctx.putImageData(this.image, 0, 0)
  }

  setRGB(x : number, y : number, rgb : number) {
    let idx = (x + y * this.width) * 4
    this.image.data[idx + 0] = (rgb >> 16) & 0xFF // red
    this.image.data[idx + 1] = (rgb >> 8) & 0xFF  // green
    this.image.data[idx + 2] = rgb & 0xFF         // blue
    this.image.data[idx + 3] = 255                // alpha
  }

  computeColor(x: number, y : number) : number {
    let zx = 0
    let zy = 0
    let cX = (x - 400) / ZOOM
    let cY = (y - 300) / ZOOM

    let iter = MAX_ITER

    while (zx * zx + zy * zy < 4 && iter > 0) {
      let tmp = zx * zx - zy * zy + cX
      zy = 2.0 * zx * zy + cY
      zx = tmp
      iter--
    }

    return iter | (iter << 8)
  }
}
