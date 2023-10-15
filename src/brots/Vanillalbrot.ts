import mandelbrot from "../utils/mandelbrot";
import setRGB from "../utils/setrgb";
import Mandelbrot, { Point } from "./Mandelbrot";

export default class Vanillalbrot extends Mandelbrot {
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

  async perform(iterations: number, center: Point, rectangle: Point): Promise<void> {
    for (let y = 0; y < this.height; y++) {
      let fY = (y / this.height) * 2 - 1

      for (let x = 0; x < this.width; x++) {
        let fX = (x / this.width) * 2 - 1

        let iter = mandelbrot(fX, fY, center, rectangle, iterations)
        setRGB(this.image, x, y, iter)
      }
    }
  }

  async afterPerform(_iterations: number): Promise<void> {
    this.context.putImageData(this.image, 0, 0)
  }

}
