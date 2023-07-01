export default function mandelbrot(x: f64, y: f64, width: f64, height: f64, iterations: u32, zoom: f64): i32 {
  let zx: f64 = 0.0
  let zy: f64 = 0.0
  let cX: f64 = (x - width / 2.0) / zoom
  let cY: f64 = (y - height / 2.0) / zoom

  let iter = iterations

  while (zx * zx + zy * zy < 4 && iter > 0) {
    let tmp = zx * zx - zy * zy + cX
    zy = 2.0 * zx * zy + cY
    zx = tmp
    iter--
  }

  return iter | (iter << 8)
}
