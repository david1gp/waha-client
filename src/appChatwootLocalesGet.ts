import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChatwootLocale } from "./appTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const appChatwootLocalesGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export type AppChatwootLocalesGetOptions = {
  config: WahaClientConfig
}

export async function appChatwootLocalesGet(options: AppChatwootLocalesGetOptions): PromiseResult<ChatwootLocale[]> {
  const op = "appChatwootLocalesGet"
  const parsed = a.safeParse(appChatwootLocalesGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  return wahaRequest<ChatwootLocale[]>({
    config: parsed.output.config,
    method: "GET",
    path: wahaPathApi("/apps/chatwoot/locales"),
  })
}
