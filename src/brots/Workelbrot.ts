import WorkerHelper from "../utils/WorkerHelper";
import Vanillalbrot from "./Vanillalbrot";

import Mandelworker from '../workers/Mandelworker?worker&inline'
import { ZOOM } from "../utils/constants";
import { Point, RunMode } from "./Mandelbrot";
import Deferred from "../utils/deferred";

export default class Workelbrot extends Vanillalbrot {
  workers: Array<WorkerHelper> = []
  buffer: SharedArrayBuffer;

  mode = RunMode.autorun

  async initialize(): Promise<void> {
    await super.initialize()

    let cpus = navigator.hardwareConcurrency || 8
    this.workers = new Array(Math.floor(cpus))

    for (let i = 0; i < this.workers.length; i++) {
      this.workers[i] = new WorkerHelper(this.createWorker())
    }
  }

  async isSupported(): Promise<boolean> {
    return 'Worker' in window
  }

  async beforePerform(_iterations: number, _center: Point, _rectangle: Point): Promise<void> {
    this.buffer = new SharedArrayBuffer(this.imageByteSize)

    await Promise.all(this.workers.map(async w => {
      await w.beforePerform(this.width, this.height, this.buffer)
    }))
  }

  async perform(iterations: number, center: Point, rectangle: Point): Promise<void> {
    let y = 0
    let done = 0
    const deferred = new Deferred<void>()
    const runOnWorker = (w: WorkerHelper, i: number) => {
      if (y < this.height) {
        const thisY = y
        y++
        w.perform(thisY, center, rectangle, iterations).then(() => {
          done++
          if (done < this.height) {
            runOnWorker(w, i)
          } else {
            deferred.resolve()
          }
        })
      }
    }
    this.workers.forEach(runOnWorker)
    await deferred.promise
  }

  async afterPerform(_iterations: number, _center: Point, _rectangle: Point): Promise<void> {
    await Promise.all(this.workers.map(async w => {
      await w.afterPerform()
    }))

    this.context.putImageData(
      new ImageData(
        new Uint8ClampedArray(this.buffer, 0, this.imageByteSize).slice(),
        this.width,
        this.height
      ),
      0,
      0
    )
  }

  createWorker(): Worker {
    return new Mandelworker()
  }
}
