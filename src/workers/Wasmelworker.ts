import BaseWorker from "./BaseWorker"

import assembly from '../wasm/assembly.wasm?init'
import wasmAbort from "../utils/wasmAbort";

class Wasmelworker extends BaseWorker<WebAssembly.Memory> {
  instance: WebAssembly.Instance;
  data: Uint8ClampedArray;

  get runMandelbrotRow(): Function {
    return this.instance.exports.runMandelbrotRow as Function
  }

  async beforePerform(width: number, height: number, buffer: WebAssembly.Memory): Promise<void> {
    await super.beforePerform(width, height, buffer)
    this.instance = await assembly({
      env: { memory: this.buffer, abort: wasmAbort }
    })
  }

  async perform(iterations: number, zoom: number, y: number): Promise<void> {
    this.runMandelbrotRow(this.width, this.height, iterations, zoom, y)
  }
}

(new Wasmelworker()).start()
