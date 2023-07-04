import Vanillalbrot from "./Vanillalbrot";

import assembly from '../wasm/assembly.wasm?init'
import wasmSupported from "../utils/wasmSupported"
import { ZOOM } from "../utils/constants";
import roundUpToPages from "../utils/roundUpToPages";

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
      maximum: 1024
    })
    this.instance = await assembly({
      env: { memory: this.memory }
    })
  }

  async beforePerform(_iterations: number): Promise<void> {
    const arraySize = this.imageByteSize
    this.updateMemory(arraySize)
    this.data = new Uint8ClampedArray(this.memory.buffer, 0, arraySize)
  }

  async perform(iterations: number): Promise<void> {
    this.runMandelbrot(this.width, this.height, iterations, ZOOM)
  }

  async afterPerform(_iterations: number): Promise<void> {
    this.context.putImageData(new ImageData(this.data, this.width, this.height), 0, 0)
  }

  private updateMemory(arraySize: number) {
    if (arraySize <= this.memory.buffer.byteLength) return

    const needBytes = arraySize - this.memory.buffer.byteLength
    this.memory.grow(roundUpToPages(needBytes))
  }
}
