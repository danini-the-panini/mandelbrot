import { Controller } from "@hotwired/stimulus";
import { clearlog, prelog } from "../utils/prelog";
import delay from "../utils/delay";

export default abstract class CanvasController extends Controller {
  static targets = ['canvas', 'output']

  static classes = ['running']
  
  declare readonly runningClass: string;
  declare readonly canvasTarget: HTMLCanvasElement;
  declare readonly outputTarget: Element;
  
  ctx: CanvasRenderingContext2D | null;

  get height(): number {
    return this.canvasTarget.height
  }

  get width(): number {
    return this.canvasTarget.width
  }

  prelog(message: string) {
    prelog(this.outputTarget, message)
  }

  clearlog() {
    clearlog(this.outputTarget)
  }

  connect() {
    this.ctx = this.canvasTarget.getContext('2d')
    this.clearCanvas();
  }

  clearCanvas() {
    this.ctx?.clearRect(0, 0, this.width, this.height);
  }

  disconnect() {
    this.ctx = null
    clearlog(this.outputTarget)
  }

  async beforePerform() : Promise<void> {}
  abstract perform() : Promise<void>;

  async run() {
    this.element.classList.add(this.runningClass)
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
    this.element.classList.remove(this.runningClass)
  }

  async withTiming(fn: () => Promise<void>): Promise<number | null> {
    let t1 = performance.now()
    await fn()
    let t2 = performance.now()
    return (t2 - t1) / 1000
  }
}
