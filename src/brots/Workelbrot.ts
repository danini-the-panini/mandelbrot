import WorkerHelper from "../utils/WorkerHelper";
import Vanillalbrot from "./Vanillalbrot";
import workerOffset from "../utils/workerOffset";

import Mandelworker from '../workers/Mandelworker?worker&inline'
import { ZOOM } from "../utils/constants";
import { RunMode } from "./Mandelbrot";
import Deferred from "../utils/deferred";

export default class Workelbrot extends Vanillalbrot {
  workers: Array<WorkerHelper> = []

  mode = RunMode.autorun

  async initialize(): Promise<void> {
    await super.initialize()

    let cpus = navigator.hardwareConcurrency || 8
    this.workers = new Array(Math.floor(cpus * 2))

    for (let i = 0; i < this.workers.length; i++) {
      this.workers[i] = new WorkerHelper(this.createWorker())
    }
  }

  async isSupported(): Promise<boolean> {
    return 'Worker' in window
  }

  async beforePerform(_iterations: number): Promise<void> {
    await Promise.all(this.workers.map(async w => {
      await w.beforePerform(this.width, this.height)
    }))
  }

  async perform(iterations: number): Promise<void> {
    let y = 0
    let done = 0
    const deferred = new Deferred<void>()
    const runOnWorker = (w: WorkerHelper) => {
      if (done >= this.height-1) deferred.resolve()
      if (y < this.height) {
        const thisY = y
        y++
        w.perform(iterations, ZOOM, thisY).then(image => {
          this.context.drawImage(image, 0, thisY)
          done++
          if (done >= this.height-1) {
            deferred.resolve()
          } else {
            runOnWorker(w)
          }
        })
      }
    }
    this.workers.forEach(runOnWorker)
    return deferred.promise
  }

  async afterPerform(_iterations: number): Promise<void> {
    await Promise.all(this.workers.map(async w => {
      await w.afterPerform()
    }))
  }

  createWorker(): Worker {
    return new Mandelworker()
  }
}
