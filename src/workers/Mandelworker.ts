import BaseWorker from "./BaseWorker"
import mandelbrot from "../utils/mandelbrot"
import setRGB from "../utils/setrgb"

class Mandelworker extends BaseWorker {
  image: ImageData

  async beforePerform(width: number, height: number): Promise<void> {
    await super.beforePerform(width, height)
    this.image = new ImageData(this.width, 1)
  }

  async perform(iterations: number, zoom: number, y: number): Promise<ImageBitmap> {
    for (let x = 0; x < this.width; x++) {
      let rgb = mandelbrot(x, y, this.width, this.height, iterations, zoom)
      setRGB(this.image, x, 0, rgb)
    }
    const canvas = new OffscreenCanvas(this.width, 1)
    const ctx = canvas.getContext('2d')
    ctx.putImageData(this.image, 0, 0)

    return canvas.transferToImageBitmap()
  }
}

(new Mandelworker()).start()
