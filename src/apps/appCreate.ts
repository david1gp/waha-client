import type { AppCreateOptions } from "./appCreateOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { App } from "./app.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const appCreateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  body: a.record(a.string(), a.unknown()),
})

export async function appCreate(options: AppCreateOptions): PromiseResult<App> {
  const op = "appCreate"
  const parsed = a.safeParse(appCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, body } = parsed.output
  return wahaRequest<App>({
    config,
    method: "POST",
    path: wahaPathApi("/apps"),
    body,
    injectSession: true,
  })
}
