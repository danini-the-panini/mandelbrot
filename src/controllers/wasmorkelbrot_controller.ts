import CanvasController from "./canvas_controller"
import Deferred from "../utils/deferred"
import { ITERATIONS, ZOOM } from "../utils/constants"

import Wasmorkelbrot from '../workers/wasmorkelbrot?worker'
import wasmSupported from "../utils/wasmSupported"

export default class extends CanvasController {
  workers: Array<Worker | null> = []
  deferred!: Deferred<void>

  connect() {
    if (!('Worker' in window)) this.prelog('*** error: no web workers ***')
    if (!wasmSupported()) this.prelog('*** error: no wasm ***')
    super.connect()
  }

  perform() {
    this.deferred = new Deferred()

    this.initWorkers()

    return this.deferred.promise;
  }

  initWorkers() {
    let cpus = navigator.hardwareConcurrency || 8
    this.workers = new Array(Math.floor(cpus * 2))

    for (let i = 0; i < this.workers.length; i++) {
      let worker = new Wasmorkelbrot()
      worker.onmessage = this.onWorkerMessage.bind(this)
      worker.postMessage([this.width, this.height, ITERATIONS, ZOOM, this.workers.length, i])
      this.workers[i] = worker
    }
  }

  onWorkerMessage(event: MessageEvent) {
    let image: ImageData = event.data[0]
    let workerIndex: number = event.data[1]

    this.prelog(`Worker done ${workerIndex}`)

    let rowsPerWorker = (this.height / this.workers.length)
    let offset = workerIndex * rowsPerWorker

    this.workers[workerIndex]!.terminate()
    this.workers[workerIndex] = null

    this.ctx?.putImageData(image, 0, offset)

    for (let worker of this.workers) {
      if (worker) return;
    }

    this.deferred.resolve()
  }
}