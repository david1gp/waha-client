import type { AppGetOptions } from "./appGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { App } from "./app.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const appGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  id: a.string(),
})

export async function appGet(options: AppGetOptions): PromiseResult<App> {
  const op = "appGet"
  const parsed = a.safeParse(appGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, id } = parsed.output
  return wahaRequest<App>({
    config,
    method: "GET",
    path: wahaPathApi(`/apps/${encodeURIComponent(id)}`),
  })
}
