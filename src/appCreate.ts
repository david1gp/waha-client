import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { App } from "./appTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const appCreateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  body: a.record(a.string(), a.unknown()),
})

export type AppCreateOptions = {
  config: WahaClientConfig
  body: App
}

export async function appCreate(options: AppCreateOptions): PromiseResult<App> {
  const op = "appCreate"
  const parsed = a.safeParse(appCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, body } = parsed.output
  return wahaRequest<App>({
    config,
    method: "POST",
    path: wahaPathApi("/apps"),
    body,
    injectSession: true,
  })
}
