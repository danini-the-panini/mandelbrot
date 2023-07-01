import Deferred from "./deferred"

export default class WorkerHelper {
  worker: Worker
  index: number
  numWorkers: number
  calls: Record<string, Deferred<any>>

  constructor(worker: Worker, numWorkers: number, index: number) {
    this.worker = worker
    this.index = index
    this.numWorkers = numWorkers
    this.worker.onmessage = this.onMessage.bind(this)
    this.calls = {}
  }

  async initialize(): Promise<void> {
    return this.postMessage('initialize', this.numWorkers, this.index)
  }

  async perform(width: number, height: number, iterations: number, zoom: number): Promise<ImageData> {
    return this.postMessage('perform', width, height, iterations, zoom)
  }

  terminate() { this.worker.terminate() }

  private async postMessage<T>(name: string, ...args: any[]): Promise<T> {
    if (this.calls[name]) return

    const deferred = new Deferred<T>()
    this.calls[name] = deferred

    this.worker.postMessage([name, ...args])

    return deferred.promise
  }

  private onMessage(event: MessageEvent) {
    const [name, result] = event.data

    this.calls[name].resolve(result)
    delete this.calls[name]
  }
}
