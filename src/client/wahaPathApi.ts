/** `/api{rest}` — `rest` should start with `/`. */
export function wahaPathApi(rest: string): string {
  return `/api${rest}`
}
