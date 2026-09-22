import type { ServerDebugHeapsnapshotGetOptions } from "./serverDebugHeapsnapshotGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const serverDebugHeapsnapshotGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export async function serverDebugHeapsnapshotGet(
  options: ServerDebugHeapsnapshotGetOptions,
): PromiseResult<Uint8Array> {
  const op = "serverDebugHeapsnapshotGet"
  const parsed = a.safeParse(serverDebugHeapsnapshotGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  return wahaRequest({
    config: parsed.output.config,
    method: "GET",
    path: wahaPathApi("/server/debug/heapsnapshot"),
    responseType: "bytes",
  })
}
