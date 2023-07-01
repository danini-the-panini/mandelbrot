import BaseWorker from "./BaseWorker"
import setRGB from "../utils/setrgb"
import workerOffset from "../utils/workerOffset"

import assembly from '../wasm/assembly.wasm?init'

type MandelbrotFn = (x: number, y: number, widtH: number, height: number, iterations: number, zoom: number) => number

class Wasmelworker extends BaseWorker {
  mandelbrot: MandelbrotFn

  async initialize(numWorkers: number, workerIndex: number): Promise<void> {
    super.initialize(numWorkers, workerIndex)

    let instance = await assembly({})
    this.mandelbrot = instance.exports.mandelbrot as MandelbrotFn
  }

  async perform(width: number, height: number, iterations: number, zoom: number): Promise<ImageData> {
    let [rows, offset] = workerOffset(height, this.index, this.numWorkers)

    let image = new ImageData(width, rows)

    for (let r = 0; r < rows; r++) {
      for (let x = 0; x < width; x++) {
        let y = r + offset
        let rgb = this.mandelbrot(x, y, width, height, iterations, zoom)
        setRGB(image, x, r, rgb)
      }
    }

    return image
  }
}

(new Wasmelworker()).start()
