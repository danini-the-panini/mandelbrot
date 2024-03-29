const vThreshold = v128.splat<f32>(4.0)
const vOne = v128.splat<i32>(1)
const vTwo = v128.splat<i32>(2)
const vfOne = v128.splat<f32>(1)

function mandelSimdRow(
  y:          i32,
  width:      i32,
  height:     i32,
  centerX:    f32,
  centerY:    f32,
  rectX:      f32,
  rectY:      f32,
  iterations: i32
): void {
  let fY = (<f32>y / <f32>height) * 2.0 - 1.0

  let vWidth = v128.splat<f32>(<f32>width)
  let vCenterX = v128.splat<f32>(<f32>centerX)
  let vCenterY = v128.splat<f32>(<f32>centerY)
  let vRectX = v128.splat<f32>(<f32>rectX)
  let vRectY = v128.splat<f32>(<f32>rectY)

  for (let x: i32 = 0; x < width; x+=4) {
    let mx = f32x4(<f32>x + 3.0, <f32>x + 2.0, <f32>x + 1.0, <f32>x + 0.0)
    mx = v128.div<f32>(mx, vWidth)
    mx = v128.sub<f32>(v128.add<f32>(mx, mx), vfOne)
    let my = v128.splat<f32>(fY)

    let cx = v128.add<f32>(vCenterX, v128.mul<f32>(mx, vRectX))
    let cy = v128.add<f32>(vCenterY, v128.mul<f32>(my, vRectY))
    let zx = cx
    let zy = cy

    let iter = iterations
    let vIter = v128.splat<i32>(iter)

    let zx2 = v128.mul<f32>(zx, zx)
    let zy2 = v128.mul<f32>(zy, zy)
    while (iter > 0) {
      // tmp = zx * zx - zy * zy + cx
      let tmp = v128.add<f32>(v128.sub<f32>(zx2, zy2), cx)
      let zy1 = v128.mul<f32>(zx, zy)
      zy = v128.add<f32>(v128.add<f32>(zy1, zy1), cy)
      zx = tmp

      // zx * zx + zy * zy < 4.0
      zx2 = v128.mul<f32>(zx, zx)
      zy2 = v128.mul<f32>(zy, zy)
      let mask = v128.lt<f32>(v128.add<f32>(zx2, zy2), vThreshold)
      vIter = v128.sub<i32>(vIter, v128.and(mask, vOne))

      if (v128.bitmask<i32>(mask) == 0) break

      iter--
    }

    let vABC = v128.or(
      v128.or(vIter, v128.shl<i32>(vIter, 8)),
      v128(0, 0, 0, <u8>255, 0, 0, 0, <u8>255, 0, 0, 0, <u8>255, 0, 0, 0, <u8>255)
    )

    v128.store(
      (y * width + x) * 4,
      v128.swizzle(vABC, v128(
        12 + 2, 12 + 0, 12 + 1, 12 + 3,
         8 + 2,  8 + 0,  8 + 1,  8 + 3,
         4 + 2,  4 + 0,  4 + 1,  4 + 3,
         0 + 2,  0 + 0,  0 + 1,  0 + 3,
      ))
    )
  }
}

export function runMandelbrotRow(
  y:          i32,
  width:      i32,
  height:     i32,
  centerX:    f32,
  centerY:    f32,
  rectX:      f32,
  rectY:      f32,
  iterations: i32
): void {
  mandelSimdRow(y, width, height, centerX, centerY, rectX, rectY, iterations)
}

export default function runMandelbrot(
  width:      i32,
  height:     i32,
  centerX:    f32,
  centerY:    f32,
  rectX:      f32,
  rectY:      f32,
  iterations: i32
): void {
  for (let y: i32 = 0; y < height; y++) {
    mandelSimdRow(y, width, height, centerX, centerY, rectX, rectY, iterations)
  }
}
