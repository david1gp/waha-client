import type { ApiKeyDeleteOptions } from "./apiKeyDeleteOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ApiKeyDeleteResult } from "./apiKeyDeleteResult.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const apiKeyDeleteOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  id: a.string(),
})

export async function apiKeyDelete(options: ApiKeyDeleteOptions): PromiseResult<ApiKeyDeleteResult> {
  const op = "apiKeyDelete"
  const parsed = a.safeParse(apiKeyDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, id } = parsed.output
  return wahaRequest<ApiKeyDeleteResult>({
    config,
    method: "DELETE",
    path: wahaPathApi(`/keys/${encodeURIComponent(id)}`),
  })
}
