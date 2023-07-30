import Deferred from "./deferred"

export default class WorkerHelper {
  worker: Worker
  calls: Record<string, Deferred<any>>

  constructor(worker: Worker) {
    this.worker = worker
    this.worker.onmessage = this.onMessage.bind(this)
    this.calls = {}
  }

  async beforePerform(width: number, height: number, buffer: SharedArrayBuffer | WebAssembly.Memory): Promise<void> {
    return this.postMessage('beforePerform', width, height, buffer)
  }

  async perform(iterations: number, zoom: number, y: number): Promise<void> {
    return this.postMessage('perform', iterations, zoom, y)
  }

  async afterPerform(): Promise<void> {
    return this.postMessage('afterPerform')
  }

  terminate() { this.worker.terminate() }

  private async postMessage<T>(name: string, ...args: [...any]): Promise<T> {
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
