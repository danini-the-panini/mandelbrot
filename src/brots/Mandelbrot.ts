import delay from "../utils/delay";

export enum RunMode {
  off,
  autorun,
  render
}

export declare type MandelbrotConstructor = new (element: Element) => Mandelbrot

export default abstract class Mandelbrot {
  canvas: HTMLCanvasElement

  mode = RunMode.off
  devicePixelRatio: number;

  get imageByteSize() { return (this.width * this.height * 4)|0 }

  get height(): number {
    return this.canvas.height|0
  }

  get width(): number {
    return this.canvas.width|0
  }

  constructor(element: Element) {
    this.canvas = document.createElement('canvas')
    element.append(this.canvas)
    this.layout()
  }

  layout() {
    this.devicePixelRatio = window.devicePixelRatio || 1
    this.canvas.width = this.canvas.clientWidth * devicePixelRatio
    this.canvas.height = this.canvas.clientHeight * devicePixelRatio
  }

  async isSupported(): Promise<boolean> { return true }
  async initialize(): Promise<void> {}
  async destroy(): Promise<void> {
    this.canvas.remove()
  }

  clearCanvas() {}

  async beforePerform(_iterations: number) : Promise<void> {}
  abstract perform(iterations: number) : Promise<void>
  async afterPerform(_iterations: number) : Promise<void> {}

  async run(iterations: number) {
    this.clearCanvas()
    await this.beforePerform(iterations)

    await delay(1)
    const elapsed = await this.withTiming(() => this.perform(iterations))
    await this.afterPerform(iterations)

    return elapsed
  }

  async withTiming(fn: () => Promise<void>): Promise<number | null> {
    let t1 = performance.now()
    await fn()
    let t2 = performance.now()
    return (t2 - t1) / 1000
  }
}
