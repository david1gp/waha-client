import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { App } from "./appTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const appGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  id: a.string(),
})

export type AppGetOptions = {
  config: WahaClientConfig
  id: string
}

export async function appGet(options: AppGetOptions): PromiseResult<App> {
  const op = "appGet"
  const parsed = a.safeParse(appGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, id } = parsed.output
  return wahaRequest<App>({
    config,
    method: "GET",
    path: wahaPathApi(`/apps/${encodeURIComponent(id)}`),
  })
}
