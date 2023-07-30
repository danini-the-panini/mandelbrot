import BaseWorker from "./BaseWorker"
import mandelbrot from "../utils/mandelbrot"
import setRGB from "../utils/setrgb"

class Mandelworker extends BaseWorker {
  image: ImageData

  async perform(iterations: number, zoom: number, y: number): Promise<void> {
    const data = new Uint8ClampedArray(this.buffer, y*this.width*4, this.width*4)
    for (let x = 0; x < this.width; x++) {
      let rgb = mandelbrot(x, y, this.width, this.height, iterations, zoom)
      setRGB({ data, width: this.width }, x, 0, rgb)
    }
  }
}

(new Mandelworker()).start()
