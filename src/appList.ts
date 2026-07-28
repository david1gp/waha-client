import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { App } from "./appTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const appListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type AppListOptions = {
  config: WahaClientConfig
  session?: string
}

/** GET /api/apps?session=… — always sends session (options.session ?? config.session). */
export async function appList(options: AppListOptions): PromiseResult<App[]> {
  const op = "appList"
  const parsed = a.safeParse(appListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<App[]>({
    config,
    method: "GET",
    path: wahaPathApi("/apps"),
    query: { session: sessionR.data },
  })
}
