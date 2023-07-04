import workerOffset from "../utils/workerOffset"

export default abstract class BaseWorker {
  numWorkers: number
  index: number
  width: number
  height: number

  start() {
    onmessage = this.onMessage.bind(this)
  }

  async initialize(numWorkers: number, index: number, width: number, height: number) : Promise<void> {
    this.numWorkers = numWorkers
    this.index = index
    this.width = width
    this.height = height
  }

  async beforePerform(width: number, height: number): Promise<void> {
    this.width = width
    this.height = height
  }
  abstract perform(iterations: number, zoom: number) : Promise<ImageData>
  async afterPerform(): Promise<void> {}

  protected workerOffset() {
    return workerOffset(this.height, this.index, this.numWorkers)
  }

  private async onMessage(event: MessageEvent) {
    const [name, ...args] = event.data
    const result = await this[name](...args)
    self.postMessage([name, result])
  }
}
