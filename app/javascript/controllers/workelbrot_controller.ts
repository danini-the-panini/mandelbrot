import { Controller, Context } from "stimulus"
import { prelog, clearlog } from "utils/prelog"

export default class extends Controller {
  static targets = ['canvas', 'output']

  canvasTarget: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  workers: Worker[]
  outputTarget: Element

  get height(): number {
    return this.canvasTarget.height
  }

  get width(): number {
    return this.canvasTarget.width
  }

  constructor(context : Context) {
    super(context)
    this.onWorkerMessage = this.onWorkerMessage.bind(this)
  }

  connect() {
    this.ctx = this.canvasTarget.getContext('2d')

    if ('Worker' in window) {
      this.initWorkers()
    }
  }

  disconnect() {
    this.ctx = null
    clearlog(this.outputTarget)
  }

  initWorkers() {
    clearlog(this.outputTarget)
    prelog(this.outputTarget, "Beginning work...")

    this.workers = new Array(navigator.hardwareConcurrency)

    for (let i = 0; i < this.workers.length; i++) {
      let worker = new Worker('/workelbrot_worker.js')
      worker.onmessage = this.onWorkerMessage
      worker.postMessage([this.width, this.height, this.workers.length, i])
      this.workers[i] = worker
    }
  }

  onWorkerMessage(event: MessageEvent) {
    let image: ImageData = event.data[0]
    let workerIndex: number = event.data[1]

    prelog(this.outputTarget, `Worker done ${workerIndex}`)

    let rowsPerWorker = (this.height / this.workers.length)
    let offset = workerIndex * rowsPerWorker

    this.workers[workerIndex].terminate()
    this.workers[workerIndex] = null

    this.ctx.putImageData(image, 0, offset)

    for (let worker of this.workers) {
      if (worker) return;
    }

    prelog(this.outputTarget, "Work done")
  }
}
