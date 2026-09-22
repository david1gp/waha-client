/** Inject default session into a plain object body when missing. */
export function wahaRequestBodyWithSession(
  body: unknown,
  session: string | undefined,
  injectSession: boolean | undefined,
): unknown {
  if (!injectSession || session == null || session === "") return body
  if (body === null || typeof body !== "object" || Array.isArray(body)) return body
  const obj = body as Record<string, unknown>
  if (obj.session !== undefined && obj.session !== null) return body
  return { ...obj, session }
}
