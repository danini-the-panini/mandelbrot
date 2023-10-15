import { Point } from "../brots/Mandelbrot"

export default function mandelbrot(
  x:          number,
  y:          number,
  center:     Point,
  rectangle:  Point,
  iterations: number
): number {
  let cX = center.x + x * rectangle.x
  let cY = center.y + y * rectangle.y
  let zx = cX
  let zy = cY

  let iter = iterations

  while (zx * zx + zy * zy < 4 && iter > 0) {
    let tmp = zx * zx - zy * zy + cX
    zy = 2.0 * zx * zy + cY
    zx = tmp
    iter--
  }

  return iter
}
