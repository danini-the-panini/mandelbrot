import BaseWorker from "./BaseWorker"
import mandelbrot from "../utils/mandelbrot"
import setRGB from "../utils/setrgb"
import { Point } from "../brots/Mandelbrot"

class Mandelworker extends BaseWorker<SharedArrayBuffer> {
  image: ImageData

  async perform(y: number, center: Point, rectangle: Point, iterations: number): Promise<void> {
    const data = new Uint8ClampedArray(this.buffer, y*this.width*4, this.width*4)
    let fY = (y / this.height) * 2 - 1

    for (let x = 0; x < this.width; x++) {
      let fX = (x / this.width) * 2 - 1

      let rgb = mandelbrot(fX, fY, center, rectangle, iterations)
      setRGB({ data, width: this.width }, x, 0, rgb)
    }
  }
}

(new Mandelworker()).start()
