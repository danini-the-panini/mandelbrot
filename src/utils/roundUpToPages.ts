export default function roundUpToPages(bytes: number): number {
  return ((bytes + 0xffff) & ~0xffff) >>> 16
}
