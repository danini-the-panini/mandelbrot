import { Controller } from "stimulus";
import { clearlog, prelog } from "utils/prelog";

export default abstract class ApplicationController extends Controller {
  static targets = ['canvas', 'output']

  canvasTarget: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  outputTarget: Element

  get height(): number {
    return this.canvasTarget.height
  }

  get width(): number {
    return this.canvasTarget.width
  }

  prelog(message: string) {
    prelog(this.outputTarget, message)
  }

  connect() {
    this.ctx = this.canvasTarget.getContext('2d')
    this.clearCanvas();
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  disconnect() {
    this.ctx = null
    clearlog(this.outputTarget)
  }

  abstract async perform();

  async run() {
    clearlog(this.outputTarget)
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
