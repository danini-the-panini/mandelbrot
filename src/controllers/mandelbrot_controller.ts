import { Controller } from "@hotwired/stimulus";
import Vanillalbrot from "../brots/Vanillalbrot";
import Wasmelbrot from "../brots/Wasmelbrot";
import Mandelbrot, { MandelbrotConstructor, RunMode } from "../brots/Mandelbrot";
import debounce from "../utils/debounce";
import formatSeconds from "../utils/formatSeconds";
import Workelbrot from "../brots/Workelbrot";
import Wasmorkelbrot from "../brots/Wasmorkelbrot";
import Webgelbrot from "../brots/Webgelbrot";
import Webgpulbrot from "../brots/Webgpulbrot";

const BROTS = {
  'Vanilla':      Vanillalbrot,
  'WASM':         Wasmelbrot,
  'Workers':      Workelbrot,
  'WASM Workers': Wasmorkelbrot,
  'WebGL':        Webgelbrot,
  'WebGPU':       Webgpulbrot
}

export default class MandelbrotController extends Controller {
  static targets = [
    'output',
    'message',
    'iterations',
    'iterationsDisplay',
    'impl',
    'run'
  ]

  static classes = [
    'running',
    'loading',
    'error'
  ]
  
  declare readonly runningClass: string;
  declare readonly loadingClass: string;
  declare readonly errorClass: string;

  declare readonly outputTarget: HTMLElement;
  declare readonly messageTarget: HTMLElement;
  declare readonly runTarget: HTMLButtonElement;
  declare readonly iterationsTarget: HTMLInputElement;
  declare readonly iterationsDisplayTarget: HTMLElement;
  declare readonly implTarget: HTMLSelectElement;

  impl: Mandelbrot | null = null
  debounceRun: () => void;

  get iterations(): number {
    const n = parseInt(this.iterationsTarget.value, 10)

    return Math.round(Math.pow(2, n / 10))
  }

  get implClass() : MandelbrotConstructor {
    return BROTS[this.implTarget.value]
  }

  set message(value: string) {
    this.messageTarget.textContent = value
  }

  get running(): boolean {
    return this.element.classList.contains(this.runningClass)
  }

  initialize() {
    this.debounceRun = debounce(this.run, 1000)
  }

  connect() {
    this.layoutBackground()
    this.updateIterations()

    Object.keys(BROTS).forEach((name, index) => {
      const option = document.createElement('option')
      option.value = name
      option.textContent = name
      if (index === 0) option.selected = true
      this.implTarget.append(option)
    })

    this.switchImpl()
  }

  // actions

  async switchImpl() {
    this.beforeLoad()

    if (this.impl) {
      await this.impl.destroy()
    }

    try {
      this.impl = new this.implClass(this.outputTarget)
      if (!(await this.impl.isSupported())) {
        throw new Error(`${this.implTarget.value} is not supported`)
      }
      await this.impl.initialize()
      this.afterLoad()
    } catch(e) {
      console.error(e)
      this.element.classList.add(this.errorClass)
      this.impl.destroy()
      this.impl = null
      this.afterLoad(`${e.message} ❗️`)
    }

    if (this.impl?.mode === RunMode.autorun) this.run()
    if (this.impl?.mode === RunMode.render) this.render()
  }

  async run() {
    if (!this.impl) return
    if (this.running) return

    this.beforeRun()
    try {
      await this.implRun()
      this.afterRun()
    } catch (e) {
      console.error(e)
      this.element.classList.add(this.errorClass)
      this.afterRun(`${e.message} ❗️`)
    }
  }

  autorun() {
    if (!this.impl) return
    if (this.impl.mode !== RunMode.autorun) return
    
    this.run()
  }

  render() {
    if (!this.impl) return
    if (this.impl.mode !== RunMode.render) return

    this.implRun()
  }

  updateIterations() {
    this.iterationsDisplayTarget.textContent = this.iterations.toString()
    this.impl?.clearCanvas()
  }

  layout() {
    this.layoutBackground()
    if (!this.impl) return
    this.impl.layout()
    if (this.impl.mode === RunMode.autorun) this.debounceRun()
    if (this.impl.mode === RunMode.render) this.render()
  }

  // methods

  async implRun() {
    const elapsed = await this.impl.run(this.iterations)
    this.message = formatSeconds(elapsed)
  }

  beforeRun() {
    if (this.impl.mode === RunMode.render) return

    this.message = 'Running...'
    this.element.classList.add(this.runningClass)
    this.element.classList.remove(this.errorClass)
    this.disableInputs()
  }

  afterRun(message: string | null = null) {
    if (this.impl.mode === RunMode.render) return

    this.element.classList.remove(this.runningClass)
    if (message) this.message = message
    this.enableInputs()
  }

  beforeLoad() {
    this.element.classList.remove(this.errorClass)
    this.message = 'Loading...'
    this.element.classList.add(this.loadingClass)
    this.disableInputs()
  }

  afterLoad(message = 'Ready!') {
    this.message = message
    this.element.classList.remove(this.loadingClass)
    this.enableInputs()
  }

  disableInputs(value = true) {
    this.implTarget.disabled = value
    this.iterationsTarget.disabled = value
    this.runTarget.disabled = value
  }

  enableInputs() {
    this.disableInputs(false)
  }

  layoutBackground() {
    const devicePixelRatio = window.devicePixelRatio || 1
    const width = 800 / devicePixelRatio
    const height = 600 / devicePixelRatio
    this.outputTarget.style.backgroundSize = `${width}px ${height}px`
  }
}
