import Vanillalbrot from "./Vanillalbrot";

import assembly from '../wasm/assembly.wasm?init'
import wasmSupported from "../utils/wasmSupported"
import { MandelbrotFn } from "../utils/mandelbrot";

export default class Wasmelbrot extends Vanillalbrot {

  async initialize(): Promise<void> {
    await super.initialize()

    let instance = await assembly({})
    this.mandelbrot = instance.exports.mandelbrot as MandelbrotFn
  }

  async isSupported(): Promise<boolean> {
    return wasmSupported()
  }

}
