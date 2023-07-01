export default function debounce<A extends [...any]>(
  fn: (...args: A) => any,
  ms: number
): (...args: A) => void {
  let timer: number;

  return function(...args: A) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn.bind(this), ms, ...args);
  }
}
