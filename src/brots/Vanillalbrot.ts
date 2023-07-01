import { ZOOM } from "../utils/constants";
import mandelbrot, { MandelbrotFn } from "../utils/mandelbrot";
import setRGB from "../utils/setrgb";
import Mandelbrot from "./Mandelbrot";

export default class Vanillalbrot extends Mandelbrot {
  mandelbrot: MandelbrotFn = mandelbrot
  context: CanvasRenderingContext2D
  image: ImageData | null

  async initialize(): Promise<void> {
    this.context = this.canvas.getContext('2d')
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  async beforePerform(_iterations: number): Promise<void> {
    this.image = this.context.createImageData(this.width, this.height)!
  }

  async perform(iterations: number): Promise<void> {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let rgb = this.mandelbrot(x, y, this.width, this.height, iterations, ZOOM)
        setRGB(this.image, x, y, rgb)
      }
    }

    this.context.putImageData(this.image, 0, 0)
  }

}
