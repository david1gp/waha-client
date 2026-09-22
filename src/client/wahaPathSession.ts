/** `/api/{session}{rest}` with session URI-encoded. `rest` should start with `/`. */
export function wahaPathSession(session: string, rest: string): string {
  return `/api/${encodeURIComponent(session)}${rest}`
}
