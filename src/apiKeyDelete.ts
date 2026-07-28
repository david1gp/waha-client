import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ApiKeyDeleteResult } from "./apiKeyTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const apiKeyDeleteOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  id: a.string(),
})

export type ApiKeyDeleteOptions = {
  config: WahaClientConfig
  id: string
}

export async function apiKeyDelete(options: ApiKeyDeleteOptions): PromiseResult<ApiKeyDeleteResult> {
  const op = "apiKeyDelete"
  const parsed = a.safeParse(apiKeyDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, id } = parsed.output
  return wahaRequest<ApiKeyDeleteResult>({
    config,
    method: "DELETE",
    path: wahaPathApi(`/keys/${encodeURIComponent(id)}`),
  })
}
