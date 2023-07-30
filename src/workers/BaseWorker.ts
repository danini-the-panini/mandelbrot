export default abstract class BaseWorker<M> {
  width: number
  height: number
  buffer: M

  start() {
    onmessage = this.onMessage.bind(this)
  }

  async initialize(): Promise<void> {}
  async beforePerform(width: number, height: number, buffer: M): Promise<void> {
    this.width = width
    this.height = height
    this.buffer = buffer
  }
  abstract perform(iterations: number, zoom: number, y: number) : Promise<void>
  async afterPerform(): Promise<void> {}

  private async onMessage(event: MessageEvent) {
    const [name, ...args] = event.data
    if (typeof this[name] === 'function') {
      await this[name](...args)
      self.postMessage([name])
    } else {
      throw new Error(`No such method '${name}' on ${this.constructor.name}`)
    }
  }
}
