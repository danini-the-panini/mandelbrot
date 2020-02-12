const MAX_ITER: i32 = 570
const ZOOM: f64 = 150.0

export default function mandelbrot(x: i32, y: i32, width: i32, height: i32): i32 {
  let zx: f64 = 0.0
  let zy: f64 = 0.0
  let cX: f64 = (x - width / 2.0) / ZOOM
  let cY: f64 = (y - height / 2.0) / ZOOM

  let iter = MAX_ITER

  while (zx * zx + zy * zy < 4 && iter > 0) {
    let tmp = zx * zx - zy * zy + cX
    zy = 2.0 * zx * zy + cY
    zx = tmp
    iter--
  }

  return iter | (iter << 8)
}
