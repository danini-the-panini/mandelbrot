import Workelbrot from "./Workelbrot";

import Wasmelworker from '../workers/Wasmelworker?worker&inline'
import wasmSupported from "../utils/wasmSupported";

export default class Wasmorkelbrot extends Workelbrot {
  async isSupported(): Promise<boolean> {
    return (await super.isSupported()) && wasmSupported()
  }

  createWorker(): Worker {
    return new Wasmelworker()
  }
}
