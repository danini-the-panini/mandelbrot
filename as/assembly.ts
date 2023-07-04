// TODO: make portable?
function setRGB(width: u32, x: u32, y: u32, iter: u32): void {
  let idx = (x + y * width) * 4
  let abc = iter | (iter << 8)

  let a: u8 = <u8>((abc >> 16) & 0xFF)
  let b: u8 = <u8>((abc >> 8) & 0xFF)
  let c: u8 = <u8>(abc & 0xFF)

  store<u8>(idx + 0, a)   // red
  store<u8>(idx + 1, c)   // green
  store<u8>(idx + 2, b)   // blue
  store<u8>(idx + 3, 255) // alpha
}

function mandelbrot(x: f32, y: f32, width: f32, height: f32, iterations: u32, zoom: f32): u32 {
  let zx: f32 = 0.0
  let zy: f32 = 0.0
  let cX: f32 = (x - width / 2.0) / zoom
  let cY: f32 = (y - height / 2.0) / zoom

  let iter = iterations

  while (zx * zx + zy * zy < 4.0 && iter > 0) {
    let tmp = zx * zx - zy * zy + cX
    zy = 2.0 * zx * zy + cY
    zx = tmp
    iter--
  }

  return iter
}

export function runSomeMandelbrot(width: u32, height: u32, iterations: u32, zoom: f32, offset: u32, rows: u32): void {
  let fwidth: f32 = <f32>width
  let fheight: f32 = <f32>height
  for (let r: u32 = 0; r < rows; r++) {
    for (let x: u32 = 0; x < width; x++) {
      let y = r + offset
      let iter = mandelbrot(<f32>x, <f32>y, fwidth, fheight, iterations, zoom)
      setRGB(width, x, r, iter)
    }
  }
}

export default function runMandelbrot(width: u32, height: u32, iterations: u32, zoom: f32): void {
  runSomeMandelbrot(width, height, iterations, zoom, 0, height)
}
