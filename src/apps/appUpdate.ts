import type { AppUpdateOptions } from "./appUpdateOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { App } from "./app.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const appUpdateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  id: a.string(),
  body: a.record(a.string(), a.unknown()),
})

export async function appUpdate(options: AppUpdateOptions): PromiseResult<App> {
  const op = "appUpdate"
  const parsed = a.safeParse(appUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, id, body } = parsed.output
  return wahaRequest<App>({
    config,
    method: "PUT",
    path: wahaPathApi(`/apps/${encodeURIComponent(id)}`),
    body,
  })
}
