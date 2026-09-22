import type { ApiKeyMediaCreateOptions } from "./apiKeyMediaCreateOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ApiKeyDTO } from "./apiKeyDTO.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const apiKeyMediaCreateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function apiKeyMediaCreate(options: ApiKeyMediaCreateOptions): PromiseResult<ApiKeyDTO> {
  const op = "apiKeyMediaCreate"
  const parsed = a.safeParse(apiKeyMediaCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ApiKeyDTO>({
    config,
    method: "POST",
    path: wahaPathApi("/keys/media"),
    body: { session: sessionR.data },
  })
}
