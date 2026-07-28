import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaResult } from "./profileTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const profileStatusSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  status: a.pipe(a.string(), a.minLength(1)),
})

export type ProfileStatusSetOptions = {
  config: WahaClientConfig
  session?: string
  status: string
}

export async function profileStatusSet(options: ProfileStatusSetOptions): PromiseResult<WahaResult> {
  const op = "profileStatusSet"
  const parsed = a.safeParse(profileStatusSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, status } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WahaResult>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, "/profile/status"),
    body: { status },
  })
}
