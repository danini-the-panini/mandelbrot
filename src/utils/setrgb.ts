export default function setRGB(image: ImageData, x: number, y: number, iter: number) {
  let idx = (x + y * image.width) * 4
  let abc = iter | (iter << 8)

  let a = (abc >> 16) & 0xFF
  let b = (abc >> 8) & 0xFF
  let c = abc & 0xFF

  image.data[idx + 0] = a   // red
  image.data[idx + 1] = c   // green
  image.data[idx + 2] = b   // blue
  image.data[idx + 3] = 255 // alpha
}
