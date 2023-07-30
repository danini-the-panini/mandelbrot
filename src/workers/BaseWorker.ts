/// <reference lib="webworker" />

export default abstract class BaseWorker {
  width: number
  height: number

  start() {
    onmessage = this.onMessage.bind(this)
  }

  async beforePerform(width: number, height: number): Promise<void> {
    this.width = width
    this.height = height
  }
  abstract perform(iterations: number, zoom: number, y: number) : Promise<ImageBitmap>
  async afterPerform(): Promise<void> {}

  private async onMessage(event: MessageEvent) {
    const [name, ...args] = event.data
    if (name === 'perform') {
      const result = await this.perform(...args as [number, number, number])
      self.postMessage([name, result], [result])
    } else if (typeof this[name] === 'function') {
      await this[name](...args)
      self.postMessage([name])
    } else {
      throw new Error(`No such method '${name}' on ${this.constructor.name}`)
    }
  }
}
