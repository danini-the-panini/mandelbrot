export default function mandelbrot(x: number, y: number, width: number, height: number, iterations: number, zoom: number): number {
  let zx = 0
  let zy = 0
  let cX = (x - width/2) / zoom
  let cY = (y - height/2) / zoom

  let iter = iterations

  while (zx * zx + zy * zy < 4 && iter > 0) {
    let tmp = zx * zx - zy * zy + cX
    zy = 2.0 * zx * zy + cY
    zx = tmp
    iter--
  }

  return iter
}
