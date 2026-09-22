import type { LabelUpdateOptions } from "./labelUpdateOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Label } from "./label.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const labelUpdateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  labelId: a.pipe(a.string(), a.minLength(1)),
  name: a.pipe(a.string(), a.minLength(1)),
  colorHex: a.optional(a.string()),
  color: a.optional(a.number()),
})

export async function labelUpdate(options: LabelUpdateOptions): PromiseResult<Label> {
  const op = "labelUpdate"
  const parsed = a.safeParse(labelUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, labelId, name, colorHex, color } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: Record<string, unknown> = { name }
  if (colorHex !== undefined) body.colorHex = colorHex
  if (color !== undefined) body.color = color

  return wahaRequest<Label>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, `/labels/${encodeURIComponent(labelId)}`),
    body,
  })
}
