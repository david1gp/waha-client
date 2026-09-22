import type { AppChatwootLocalesGetOptions } from "./appChatwootLocalesGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChatwootLocale } from "./chatwootLocale.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const appChatwootLocalesGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export async function appChatwootLocalesGet(options: AppChatwootLocalesGetOptions): PromiseResult<ChatwootLocale[]> {
  const op = "appChatwootLocalesGet"
  const parsed = a.safeParse(appChatwootLocalesGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  return wahaRequest<ChatwootLocale[]>({
    config: parsed.output.config,
    method: "GET",
    path: wahaPathApi("/apps/chatwoot/locales"),
  })
}
