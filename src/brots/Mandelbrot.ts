import delay from "../utils/delay";

export enum RunMode {
  off,
  autorun,
  render
}

export declare type MandelbrotConstructor = new (element: Element) => Mandelbrot

export declare type Point = { x: number, y: number }

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
    this.canvas.dataset.action = [
      'wheel->mandelbrot#wheelZoom:!passive:prevent',
      'mousemove->mandelbrot#mousePan',
      'mouseup->mandelbrot#stopPanning',
      // TODO: add touch support
    ].join(' ')
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

  async beforePerform(_iterations: number, _center: Point, _rectangle: Point) : Promise<void> {}
  abstract perform(iterations: number, center: Point, rectangle: Point) : Promise<void>
  async afterPerform(_iterations: number, _center: Point, _rectangle: Point) : Promise<void> {}

  async run(iterations: number, center: Point, rectangle: Point) {
    this.clearCanvas()
    await this.beforePerform(iterations, center, rectangle)

    await delay(1)
    const elapsed = await this.withTiming(() => this.perform(iterations, center, rectangle))
    await this.afterPerform(iterations, center, rectangle)

    return elapsed
  }

  async withTiming(fn: () => Promise<void>): Promise<number | null> {
    let t1 = performance.now()
    await fn()
    let t2 = performance.now()
    return (t2 - t1) / 1000
  }
}
