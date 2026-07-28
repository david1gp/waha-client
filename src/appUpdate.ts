import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { App } from "./appTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const appUpdateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  id: a.string(),
  body: a.record(a.string(), a.unknown()),
})

export type AppUpdateOptions = {
  config: WahaClientConfig
  id: string
  body: App
}

export async function appUpdate(options: AppUpdateOptions): PromiseResult<App> {
  const op = "appUpdate"
  const parsed = a.safeParse(appUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, id, body } = parsed.output
  return wahaRequest<App>({
    config,
    method: "PUT",
    path: wahaPathApi(`/apps/${encodeURIComponent(id)}`),
    body,
  })
}
