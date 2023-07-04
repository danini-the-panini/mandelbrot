import BaseWorker from "./BaseWorker"
import mandelbrot from "../utils/mandelbrot"
import setRGB from "../utils/setrgb"
import workerOffset from "../utils/workerOffset"

class Mandelworker extends BaseWorker {
  async perform(iterations: number, zoom: number): Promise<ImageData> {
    let [offset, rows] = this.workerOffset()

    let image = new ImageData(this.width, rows)

    for (let r = 0; r < rows; r++) {
      for (let x = 0; x < this.width; x++) {
        let y = r + offset
        let rgb = mandelbrot(x, y, this.width, this.height, iterations, zoom)
        setRGB(image, x, r, rgb)
      }
    }

    return image
  }
}

(new Mandelworker()).start()
