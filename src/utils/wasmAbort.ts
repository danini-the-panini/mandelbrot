export default function wasmAbort(message: number, fileName: number, line: number, column: number) {
  throw new Error(`WASM ABORT: as/assembly.ts:${line}:${column}`)
}