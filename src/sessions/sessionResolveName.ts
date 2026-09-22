/** Resolve path/body session name from explicit value or config.session. */
export function sessionResolveName(session: string | undefined, configSession: string | undefined): string | undefined {
  const s = session ?? configSession
  if (s == null || s === "") return undefined
  return s
}
