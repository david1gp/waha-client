import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const s3ObjectGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  bucket: a.string(),
  pathParts: a.array(a.string()),
})

export type S3ObjectGetOptions = {
  config: WahaClientConfig
  bucket: string
  pathParts: string[]
}

/** GET /api/s3/{bucket}/*parts → object bytes. */
export async function s3ObjectGet(options: S3ObjectGetOptions): PromiseResult<Uint8Array> {
  const op = "s3ObjectGet"
  const parsed = a.safeParse(s3ObjectGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, bucket, pathParts } = parsed.output
  if (pathParts.length === 0) {
    return createResultError(op, "pathParts must not be empty")
  }

  const rest = pathParts.map((p) => encodeURIComponent(p)).join("/")
  return wahaRequest({
    config,
    method: "GET",
    path: wahaPathApi(`/s3/${encodeURIComponent(bucket)}/${rest}`),
    responseType: "bytes",
  })
}
