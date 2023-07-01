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

    await Promise.all(this.workers.map(async w => w.initialize()))
  }

  async isSupported(): Promise<boolean> {
    return 'Worker' in window
  }

  async perform(iterations: number): Promise<void> {
    await Promise.all(this.workers.map(async w => {
      const image = await w.perform(this.width, this.height, iterations, ZOOM)
      let [, offset] = workerOffset(this.height, w.index, this.workers.length)
      this.context.putImageData(image, 0, offset)
    }))
  }

  createWorker(): Worker {
    return new Mandelworker()
  }
}
