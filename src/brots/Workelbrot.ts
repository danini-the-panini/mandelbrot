import WorkerHelper from "../utils/WorkerHelper";
import Vanillalbrot from "./Vanillalbrot";
import workerOffset from "../utils/workerOffset";

import Mandelworker from '../workers/Mandelworker?worker&inline'
import { ZOOM } from "../utils/constants";
import { RunMode } from "./Mandelbrot";

export default class Workelbrot extends Vanillalbrot {
  workers: Array<WorkerHelper> = []

  mode = RunMode.autorun

  async initialize(): Promise<void> {
    await super.initialize()

    let cpus = navigator.hardwareConcurrency || 8
    this.workers = new Array(Math.floor(cpus * 2))

    for (let i = 0; i < this.workers.length; i++) {
      this.workers[i] = new WorkerHelper(this.createWorker(), this.workers.length, i)
    }

    await Promise.all(this.workers.map(async w => {
      await w.initialize(this.width, this.height)
    }))
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
    await Promise.all(this.workers.map(async w => {
      const image = await w.perform(iterations, ZOOM)
      let [offset,] = workerOffset(this.height, w.index, this.workers.length)
      this.context.putImageData(image, 0, offset)
    }))
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
