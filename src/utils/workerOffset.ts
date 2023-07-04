export default function workerOffset(height: number, index: number, numWorkers: number) {
  const rows = Math.ceil(height / numWorkers)
  const offset = index * rows

  return [offset, rows]
}
