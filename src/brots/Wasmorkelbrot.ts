import Workelbrot from "./Workelbrot";

import Wasmelworker from '../workers/Wasmelworker?worker&inline'
import wasmSupported from "../utils/wasmSupported";
import roundUpToPages from "../utils/roundUpToPages";

export default class Wasmorkelbrot extends Workelbrot {
  memory: WebAssembly.Memory;

  async isSupported(): Promise<boolean> {
    return (await super.isSupported()) && wasmSupported()
  }

  async beforePerform(_iterations: number): Promise<void> {
    this.memory = new WebAssembly.Memory({
      initial: roundUpToPages(this.imageByteSize),
      maximum: 1024,
      shared: true
    })

    await Promise.all(this.workers.map(async w => {
      await w.beforePerform(this.width, this.height, this.memory)
    }))
  }

  async afterPerform(_iterations: number): Promise<void> {
    await Promise.all(this.workers.map(async w => {
      await w.afterPerform()
    }))

    this.context.putImageData(
      new ImageData(
        new Uint8ClampedArray(this.memory.buffer, 0, this.imageByteSize).slice(),
        this.width,
        this.height
      ),
      0,
      0
    )
  }

  createWorker(): Worker {
    return new Wasmelworker()
  }
}
