import BaseWorker from "./BaseWorker"

import assembly from '../wasm/assembly.wasm?init'

class Wasmelworker extends BaseWorker<WebAssembly.Memory> {
  instance: WebAssembly.Instance;
  data: Uint8ClampedArray;

  get mandelbrotRow(): Function {
    return this.instance.exports.mandelbrotRow as Function
  }

  async beforePerform(width: number, height: number, buffer: WebAssembly.Memory): Promise<void> {
    await super.beforePerform(width, height, buffer)
    this.instance = await assembly({
      env: { memory: this.buffer }
    })
  }

  async perform(iterations: number, zoom: number, y: number): Promise<void> {
    this.mandelbrotRow(this.width, this.height, iterations, zoom, y)
  }
}

(new Wasmelworker()).start()
