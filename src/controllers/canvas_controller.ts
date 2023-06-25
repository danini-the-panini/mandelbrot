import { Controller } from "@hotwired/stimulus";
import { clearlog, prelog } from "../utils/prelog";

export default abstract class CanvasController extends Controller {
  static targets = ['canvas', 'output']
  
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

  abstract perform() : Promise<void>;

  async initialize() {}

  async run() {
    this.clearlog()
    this.prelog("Initializing...")
    await this.initialize()
    this.clearCanvas()
    this.prelog("Beginning work...")

    let t1 = new Date()
    await this.perform()
    let t2 = new Date()

    let elapesed = (t2.getTime() - t1.getTime()) / 1000

    this.prelog("Work done")
    this.prelog(`Took ${elapesed} seconds`)
  }
}
