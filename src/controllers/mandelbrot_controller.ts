import { Controller } from "@hotwired/stimulus";
import Vanillalbrot from "../brots/Vanillalbrot";
import Wasmelbrot from "../brots/Wasmelbrot";
import Mandelbrot, { MandelbrotConstructor, RunMode, Point } from "../brots/Mandelbrot";
import debounce from "../utils/debounce";
import formatSeconds from "../utils/formatSeconds";
import Workelbrot from "../brots/Workelbrot";
import Wasmorkelbrot from "../brots/Wasmorkelbrot";
import Webgelbrot from "../brots/Webgelbrot";
import Webgpulbrot from "../brots/Webgpulbrot";
import animationFrame from "../utils/animationFrame";

const BROTS = {
  'Vanilla':      Vanillalbrot,
  'WASM':         Wasmelbrot,
  'Workers':      Workelbrot,
  'WASM Workers': Wasmorkelbrot,
  'WebGL':        Webgelbrot,
  'WebGPU':       Webgpulbrot
}

const ZOOM_BASE = 2;

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

  impl: Mandelbrot | null = null;
  debounceRun: () => void;

  center: Point = { x: 0, y: 0 };
  zoomLevel = 0;

  elapsedTime = 0
  frameCount = 0
  lastTime = 0
  fps = 0

  get iterations(): number {
    const n = parseInt(this.iterationsTarget.value, 10)

    return Math.round(Math.pow(2, n / 10))
  }

  set iterations(value: number) {
    this.iterationsTarget.value = Math.round(Math.log2(value) * 10).toString()
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

  get width(): number {
    return this.impl.width;
  }

  get height(): number {
    return this.impl.height;
  }

  get rectangle(): Point {
    let scale = ZOOM_BASE ** -this.zoomLevel;
    let aspect = this.width / this.height;
    return { x: scale * aspect, y: scale }
  }

  get params() {
    return new URLSearchParams(location.search)
  }

  initialize() {
    this.debounceRun = debounce(this.run, 300)
  }

  connect() {
    if (this.params.has('x')) this.center.x = parseFloat(this.params.get('x'))
    if (this.params.has('y')) this.center.y = parseFloat(this.params.get('y'))
    if (this.params.has('zoomLevel')) this.zoomLevel = parseInt(this.params.get('zoomLevel'), 10)
    if (this.params.has('iterations')) this.iterations = parseInt(this.params.get('iterations'), 10)

    Object.keys(BROTS).forEach((name, index) => {
      const option = document.createElement('option')
      option.value = name
      option.textContent = name
      if (this.params.has('impl') ? this.params.get('impl') === name : index === 0) {
        option.selected = true
      }
      this.implTarget.append(option)
    })

    this.layoutBackground()
    this.updateIterations()

    this.switchImpl()
    this.layoutBackground()
  }

  // actions

  async switchImpl() {
    this.beforeLoad()

    this.updateUrl()

    await this.impl?.destroy()
    await animationFrame()

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
    if (this.impl?.mode === RunMode.render) {
      this.update()
      this.startRendering()
    }
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

  update() {
    if (!this.impl) return
    if (this.impl.mode !== RunMode.render) return

    this.impl.beforePerform(this.iterations, this.center, this.rectangle)
  }

  updateIterations() {
    this.iterationsDisplayTarget.textContent = this.iterations.toString()
    this.updateUrl()
    this.impl?.clearCanvas()
  }

  layout() {
    this.layoutBackground()
    if (!this.impl) return
    this.impl.layout()
    if (this.impl.mode === RunMode.autorun) this.debounceRun()
    if (this.impl.mode === RunMode.render) this.update()
  }

  wheelZoom({ offsetX, offsetY, deltaY }) {
    const zoom = ZOOM_BASE ** this.zoomLevel
    const aspect = this.width / this.height

    const pointX = ((offsetX / this.width * 2 - 1) / zoom * aspect) + this.center.x;
    const pointY = ((offsetY / this.height * 2 - 1) / zoom) + this.center.y;

    const delta = Math.min(Math.max(-deltaY * 5, -100), 100) / 100;
    const zoomDelta = ZOOM_BASE ** delta

    this.zoomLevel += delta;

    this.center.x = pointX - (pointX - this.center.x) / zoomDelta;
    this.center.y = pointY - (pointY - this.center.y) / zoomDelta;

    this.updateUrl()
    this.impl?.clearCanvas()
    this.layoutBackground()
    if (this.impl.mode === RunMode.autorun) this.debounceRun()
    if (this.impl.mode === RunMode.render) this.update()
  }

  mousePan({ buttons, movementX, movementY }) {
    if (!(buttons & 1)) return

    const scale = this.height * (ZOOM_BASE ** this.zoomLevel)

    this.center.x += -2 * movementX / scale
    this.center.y += -2 * movementY / scale

    this.impl?.clearCanvas()
    this.layoutBackground()
    if (this.impl.mode === RunMode.render) this.update()
  }

  stopPanning({ button }) {
    if (button !== 0) return

    this.updateUrl()
    this.autorun()
  }

  // methods

  async implRun() {
    const elapsed = await this.impl.run(this.iterations, this.center, this.rectangle)
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
    if (!this.impl) return

    const scale = this.height * (ZOOM_BASE ** this.zoomLevel)

    const height = scale * 2
    const width  = height

    const offsetX = -0.5 * this.center.x * scale
    const offsetY = -0.5 * this.center.y * scale

    const x = offsetX - width / 2 + this.width / 2
    const y = offsetY - height / 2 + this.height / 2

    this.outputTarget.style.backgroundSize     = `${width}px ${height}px`
    this.outputTarget.style.backgroundPosition = `${x}px ${y}px`
  }

  updateUrl() {
    const params = new URLSearchParams()
    params.append('impl', this.implTarget.value)
    params.append('x', this.center.x.toString())
    params.append('y', this.center.y.toString())
    params.append('zoomLevel', this.zoomLevel.toString())
    params.append('iterations', this.iterations.toString())

    history.replaceState(null, '', `?${params}`)
  }

  startRendering() {
    if (!this.impl) return
    if (this.impl.mode !== RunMode.render) return

    requestAnimationFrame(() => this.render(this.impl))
  }

  render(impl: Mandelbrot) {
    if (!impl) return
    if (impl.mode !== RunMode.render) return
    if (!impl.running) return
    
    impl.perform(this.iterations, this.center, this.rectangle)

    let now = performance.now()

    this.frameCount++
    this.elapsedTime += (now - this.lastTime)

    this.lastTime = now

    if (this.elapsedTime >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.elapsedTime = 0
    }

    this.message = `${this.fps} fps`

    requestAnimationFrame(() => this.render(impl))
  }
}
