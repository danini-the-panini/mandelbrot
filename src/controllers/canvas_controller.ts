import { Controller } from "@hotwired/stimulus";
import { clearlog, prelog } from "../utils/prelog";
import delay from "../utils/delay";

export default abstract class CanvasController extends Controller {
  static targets = [
    'canvas',
    'output',
    'iterations',
    'iterationsDisplay'
  ]

  static classes = ['running']
  
  declare readonly runningClass: string;
  declare readonly canvasTarget: HTMLCanvasElement;
  declare readonly outputTarget: Element;
  declare readonly iterationsTarget: HTMLInputElement;
  declare readonly iterationsDisplayTarget: Element;

  ctx: CanvasRenderingContext2D | null;

  get height(): number {
    return this.canvasTarget.height
  }

  get width(): number {
    return this.canvasTarget.width
  }

  get iterations(): number {
    const n = parseInt(this.iterationsTarget.value, 10)

    return Math.round(Math.pow(2, n / 10))
  }

  prelog(message: string) {
    prelog(this.outputTarget, message)
  }

  clearlog() {
    clearlog(this.outputTarget)
  }

  connect() {
    this.ctx = this.canvasTarget.getContext('2d')
    this.updateCanvasSize()
    this.clearCanvas();
  }

  iterationsTargetConnected() {
    this.updateIterations()
  }

  updateCanvasSize() {
    const devicePixelRatio = window.devicePixelRatio || 1
    this.canvasTarget.width = this.canvasTarget.clientWidth * devicePixelRatio
    this.canvasTarget.height = this.canvasTarget.clientHeight * devicePixelRatio
  }

  clearCanvas() {
    this.ctx?.clearRect(0, 0, this.width, this.height);
  }

  disconnect() {
    this.ctx = null
    clearlog(this.outputTarget)
  }

  updateIterations() {
    this.iterationsDisplayTarget.textContent = this.iterations.toString()
  }

  async beforePerform() : Promise<void> {}
  abstract perform() : Promise<void>;

  async run() {
    this.beforeRun()

    this.clearlog()
    this.prelog("Initializing...")
    this.clearCanvas()
    await this.beforePerform()
    this.prelog("Beginning work...")

    await delay(1)
    let elapsed = await this.withTiming(() => this.perform())

    this.prelog("Work done")
    if (elapsed !== null) {
      this.prelog(`Took ${elapsed} seconds`)
    }
    this.afterRun()
  }

  autoRun() {}

  beforeRun() {
    this.iterationsTarget.disabled = true
    this.element.classList.add(this.runningClass)
  }

  afterRun() {
    this.element.classList.remove(this.runningClass)
    this.iterationsTarget.disabled = false
  }

  async withTiming(fn: () => Promise<void>): Promise<number | null> {
    let t1 = performance.now()
    await fn()
    let t2 = performance.now()
    return (t2 - t1) / 1000
  }
}
