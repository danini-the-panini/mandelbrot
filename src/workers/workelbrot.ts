import BaseWorker from "../utils/BaseWorker"
import mandelbrot from "../utils/mandelbrot"
import setRGB from "../utils/setrgb"
import workerOffset from "../utils/workerOffset"

class Workelbrot extends BaseWorker {
  async perform(width: number, height: number, iterations: number, zoom: number): Promise<ImageData> {
    let [rows, offset] = workerOffset(height, this.index, this.numWorkers)

    let image = new ImageData(width, rows)

    for (let r = 0; r < rows; r++) {
      for (let x = 0; x < width; x++) {
        let y = r + offset
        let rgb = mandelbrot(x, y, width, height, iterations, zoom)
        setRGB(image, x, r, rgb)
      }
    }

    return image
  }
}

(new Workelbrot()).start()
