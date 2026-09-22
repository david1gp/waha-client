import type { ApiKeyCreateOptions } from "./apiKeyCreateOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ApiKeyDTO } from "./apiKeyDTO.js"
import type { ApiKeyRequest } from "./apiKeyRequest.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const apiKeyCreateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  body: a.optional(a.record(a.string(), a.unknown())),
})

export async function apiKeyCreate(options: ApiKeyCreateOptions): PromiseResult<ApiKeyDTO> {
  const op = "apiKeyCreate"
  const parsed = a.safeParse(apiKeyCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, body } = parsed.output
  return wahaRequest<ApiKeyDTO>({
    config,
    method: "POST",
    path: wahaPathApi("/keys"),
    body: body ?? {},
  })
}
