export default function setRGB(image: ImageData, x: number, y: number, rgb: number) {
  let idx = (x + y * image.width) * 4
  image.data[idx + 0] = (rgb >> 16) & 0xFF // red
  image.data[idx + 1] = (rgb >> 8) & 0xFF  // green
  image.data[idx + 2] = rgb & 0xFF         // blue
  image.data[idx + 3] = 255                // alpha
}
