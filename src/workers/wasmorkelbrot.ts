import setRGB from "../utils/setrgb"

import assembly from '../wasm/assembly.wasm?init'

type MandelbrotFn = (x: number, y: number, widtH: number, height: number) => number

onmessage = async function (event) {
  console.log('work received', event.data)

  let instance = await assembly({})
  let mandelbrot = instance.exports.mandelbrot as MandelbrotFn

  let [width, height, numWorkers, workerIndex] = event.data

  let rowsPerWorker = Math.ceil(height / numWorkers)
  let offset = workerIndex * rowsPerWorker

  let image = new ImageData(width, rowsPerWorker)

  for (let r = 0; r < rowsPerWorker; r++) {
    for (let x = 0; x < width; x++) {
      let y = r + offset
      let rgb = mandelbrot(x, y, width, height)
      setRGB(image, x, r, rgb)
    }
  }

  console.log('work done')

  self.postMessage([image, workerIndex])
}
