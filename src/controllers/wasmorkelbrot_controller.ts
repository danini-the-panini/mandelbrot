import Wasmorkelbrot from '../workers/wasmorkelbrot?worker'
import wasmSupported from "../utils/wasmSupported"
import WorkelbrotController from "./workelbrot_controller"

export default class extends WorkelbrotController {
  connect(): void {
    if (!wasmSupported()) this.prelog('*** error: no wasm ***')
    super.connect()
  }

  createWorker(): Worker {
    return new Wasmorkelbrot()
  }
}
