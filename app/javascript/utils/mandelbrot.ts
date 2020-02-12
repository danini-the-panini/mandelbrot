const MAX_ITER = 100000
const ZOOM = 150.0

export default function mandelbrot(x: number, y: number, { iterations = MAX_ITER, zoom = ZOOM } = {}): number {
  let zx = 0
  let zy = 0
  let cX = (x - 400) / zoom
  let cY = (y - 300) / zoom

  let iter = iterations

  while (zx * zx + zy * zy < 4 && iter > 0) {
    let tmp = zx * zx - zy * zy + cX
    zy = 2.0 * zx * zy + cY
    zx = tmp
    iter--
  }

  return iter | (iter << 8)
}
