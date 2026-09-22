import type { AppDeleteOptions } from "./appDeleteOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const appDeleteOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  id: a.string(),
})

export async function appDelete(options: AppDeleteOptions): PromiseResult<undefined> {
  const op = "appDelete"
  const parsed = a.safeParse(appDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, id } = parsed.output
  return wahaRequest({
    config,
    method: "DELETE",
    path: wahaPathApi(`/apps/${encodeURIComponent(id)}`),
    responseType: "void",
  })
}
