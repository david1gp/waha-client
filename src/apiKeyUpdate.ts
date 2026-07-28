import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ApiKeyDTO, ApiKeyRequest } from "./apiKeyTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const apiKeyUpdateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  id: a.string(),
  body: a.optional(a.record(a.string(), a.unknown())),
})

export type ApiKeyUpdateOptions = {
  config: WahaClientConfig
  id: string
  body?: ApiKeyRequest
}

export async function apiKeyUpdate(options: ApiKeyUpdateOptions): PromiseResult<ApiKeyDTO> {
  const op = "apiKeyUpdate"
  const parsed = a.safeParse(apiKeyUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, id, body } = parsed.output
  return wahaRequest<ApiKeyDTO>({
    config,
    method: "PUT",
    path: wahaPathApi(`/keys/${encodeURIComponent(id)}`),
    body: body ?? {},
  })
}
