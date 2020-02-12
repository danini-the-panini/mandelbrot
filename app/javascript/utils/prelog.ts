export function clearlog(pre: Element) {
  pre.textContent = ''
}

export function prelog(pre: Element, message: string) {
  pre.textContent += `${message}\n`
}
