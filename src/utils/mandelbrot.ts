export default function mandelbrot(
  x:          number,
  y:          number,
  centerX:    number,
  centerY:    number,
  rectX:      number,
  rectY:      number,
  iterations: number
): number {
  let cX = centerX + x * rectX
  let cY = centerY + y * rectY
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
