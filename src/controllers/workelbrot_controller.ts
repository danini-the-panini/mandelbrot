import CanvasController from "./canvas_controller"
import { ZOOM } from "../utils/constants"

import Workelbrot from '../workers/workelbrot?worker'
import WorkerHelper from "../utils/WorkerHelper"
import workerOffset from "../utils/workerOffset"

export default class extends CanvasController {
  workers: Array<WorkerHelper> = []

  connect() {
    if (!('Worker' in window)) this.prelog('*** error: no web workers ***')

    let cpus = navigator.hardwareConcurrency || 8
    this.workers = new Array(Math.floor(cpus * 2))

    for (let i = 0; i < this.workers.length; i++) {
      this.workers[i] = new WorkerHelper(this.createWorker(), this.workers.length, i)
    }

    super.connect()
    this.run()
  }

  disconnect() {
    this.workers.forEach(w => w.terminate())
    this.workers = []
  }

  async beforePerform() {
    await Promise.all(this.workers.map(async w => w.initialize()))
  }

  async perform() {
    await Promise.all(this.workers.map(async w => {
      const image = await w.perform(this.width, this.height, this.iterations, ZOOM)
      this.prelog(`Worker done ${w.index}`)
      let [, offset] = workerOffset(this.height, w.index, this.workers.length)
      this.ctx?.putImageData(image, 0, offset)
    }))
  }

  autoRun() {
    this.run()
  }

  createWorker(): Worker {
    return new Workelbrot()
  }
}
