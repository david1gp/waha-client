import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ApiKeyDTO } from "./apiKeyTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const apiKeyControlCreateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type ApiKeyControlCreateOptions = {
  config: WahaClientConfig
  session?: string
}

export async function apiKeyControlCreate(options: ApiKeyControlCreateOptions): PromiseResult<ApiKeyDTO> {
  const op = "apiKeyControlCreate"
  const parsed = a.safeParse(apiKeyControlCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ApiKeyDTO>({
    config,
    method: "POST",
    path: wahaPathApi("/keys/control"),
    body: { session: sessionR.data },
  })
}
