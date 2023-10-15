import Vanillalbrot from "./Vanillalbrot";

import assembly from '../wasm/assembly.wasm?init'
import wasmSupported from "../utils/wasmSupported"
import roundUpToPages from "../utils/roundUpToPages";
import wasmAbort from "../utils/wasmAbort";
import { Point } from "./Mandelbrot";

export default class Wasmelbrot extends Vanillalbrot {
  instance: WebAssembly.Instance;
  memory: WebAssembly.Memory;
  data: Uint8ClampedArray;

  get runMandelbrot(): Function {
    return this.instance.exports.default as Function
  }

  async isSupported(): Promise<boolean> {
    return wasmSupported()
  }

  async initialize(): Promise<void> {
    await super.initialize()
    this.memory = new WebAssembly.Memory({
      initial: roundUpToPages(this.imageByteSize),
      maximum: 1024,
      shared: true
    })
    this.instance = await assembly({
      env: { memory: this.memory, abort: wasmAbort }
    })
  }

  async beforePerform(_iterations: number): Promise<void> {
    const arraySize = this.imageByteSize
    this.updateMemory(arraySize)
    this.data = new Uint8ClampedArray(this.memory.buffer, 0, arraySize)
  }

  async perform(iterations: number, center: Point, rectangle: Point): Promise<void> {
    this.runMandelbrot(this.width, this.height, center.x, center.y, rectangle.x, rectangle.y, iterations)
  }

  async afterPerform(_iterations: number): Promise<void> {
    this.context.putImageData(new ImageData(this.data.slice(), this.width, this.height), 0, 0)
  }

  private updateMemory(arraySize: number) {
    if (arraySize <= this.memory.buffer.byteLength) return

    const needBytes = arraySize - this.memory.buffer.byteLength
    this.memory.grow(roundUpToPages(needBytes))
  }
}
