import type { ApiKeyUpdateOptions } from "./apiKeyUpdateOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ApiKeyDTO } from "./apiKeyDTO.js"
import type { ApiKeyRequest } from "./apiKeyRequest.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const apiKeyUpdateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  id: a.string(),
  body: a.optional(a.record(a.string(), a.unknown())),
})

export async function apiKeyUpdate(options: ApiKeyUpdateOptions): PromiseResult<ApiKeyDTO> {
  const op = "apiKeyUpdate"
  const parsed = a.safeParse(apiKeyUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, id, body } = parsed.output
  return wahaRequest<ApiKeyDTO>({
    config,
    method: "PUT",
    path: wahaPathApi(`/keys/${encodeURIComponent(id)}`),
    body: body ?? {},
  })
}
