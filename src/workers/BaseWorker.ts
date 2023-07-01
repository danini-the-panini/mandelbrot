export default abstract class BaseWorker {
  numWorkers: number
  index: number

  start() {
    onmessage = this.onMessage.bind(this)
  }

  async initialize(numWorkers: number, index: number) : Promise<void> {
    this.numWorkers = numWorkers
    this.index = index
  }

  abstract perform(width: number, height: number, iterations: number, zoom: number) : Promise<ImageData>

  private async onMessage(event: MessageEvent) {
    const [name, ...args] = event.data
    const result = await this[name](...args)
    self.postMessage([name, result])
  }
}
