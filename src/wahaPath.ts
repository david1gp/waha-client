/** `/api/{session}{rest}` with session URI-encoded. `rest` should start with `/`. */
export function wahaPathSession(session: string, rest: string): string {
  return `/api/${encodeURIComponent(session)}${rest}`
}

/** `/api{rest}` — `rest` should start with `/`. */
export function wahaPathApi(rest: string): string {
  return `/api${rest}`
}
