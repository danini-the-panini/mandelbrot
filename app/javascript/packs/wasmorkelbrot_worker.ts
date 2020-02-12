import setRGB from "utils/setrgb"

onmessage = async function (event: MessageEvent) {
  let wasmelbrot = await import('wasm/wasmelbrot')

  console.log('work received', event.data)

  let [width, height, numWorkers, workerIndex] = event.data as Array<number>

  let rowsPerWorker = Math.ceil(height / numWorkers)
  let offset = workerIndex * rowsPerWorker

  let image = new ImageData(width, rowsPerWorker)

  for (let r = 0; r < rowsPerWorker; r++) {
    for (let x = 0; x < width; x++) {
      let y = r + offset
      let rgb = wasmelbrot.mandelbrot(x, y, width, height)
      setRGB(image, x, r, rgb)
    }
  }

  console.log('work done')

  self.postMessage([image, workerIndex])
}
