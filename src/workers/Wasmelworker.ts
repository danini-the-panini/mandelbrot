import BaseWorker from "./BaseWorker"
import setRGB from "../utils/setrgb"
import workerOffset from "../utils/workerOffset"

import assembly from '../wasm/assembly.wasm?init'
import roundUpToPages from "../utils/roundUpToPages"

class Wasmelworker extends BaseWorker {
  instance: WebAssembly.Instance;
  memory: WebAssembly.Memory;
  data: Uint8ClampedArray;

  get imageByteSize() {
    let [, rows] = this.workerOffset()
    return this.width*rows*4
  }

  get runMandelbrot(): Function {
    return this.instance.exports.runSomeMandelbrot as Function
  }

  async initialize(numWorkers: number, workerIndex: number, width: number, height: number): Promise<void> {
    await super.initialize(numWorkers, workerIndex, width, height)
    this.memory = new WebAssembly.Memory({
      initial: roundUpToPages(this.imageByteSize),
      maximum: 1024
    })
    this.instance = await assembly({
      env: { memory: this.memory }
    })
  }

  async beforePerform(width: number, height: number): Promise<void> {
    await super.beforePerform(width, height)
    const arraySize = this.imageByteSize
    this.updateMemory(arraySize)
    this.data = new Uint8ClampedArray(this.memory.buffer, 0, arraySize)
  }

  async perform(iterations: number, zoom: number): Promise<ImageData> {
    let [offset, rows] = this.workerOffset()

    this.runMandelbrot(this.width, this.height, iterations, zoom, offset, rows)

    return new ImageData(this.data, this.width, rows)
  }

  private updateMemory(arraySize: number) {
    if (arraySize <= this.memory.buffer.byteLength) return

    const needBytes = arraySize - this.memory.buffer.byteLength
    this.memory.grow(roundUpToPages(needBytes))
  }
}

(new Wasmelworker()).start()
