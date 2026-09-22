import type { FileGetOptions } from "./fileGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const fileGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  pathParts: a.array(a.string()),
})

export async function fileGet(options: FileGetOptions): PromiseResult<Uint8Array> {
  const op = "fileGet"
  const parsed = a.safeParse(fileGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, pathParts } = parsed.output
  if (pathParts.length === 0) {
    return createResultError(op, "pathParts must not be empty")
  }
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const rest = pathParts.map((p) => encodeURIComponent(p)).join("/")
  return wahaRequest({
    config,
    method: "GET",
    path: wahaPathApi(`/files/${encodeURIComponent(sessionR.data)}/${rest}`),
    responseType: "bytes",
  })
}
