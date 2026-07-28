import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Label } from "./labelTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const labelCreateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  name: a.pipe(a.string(), a.minLength(1)),
  colorHex: a.optional(a.string()),
  color: a.optional(a.number()),
})

export type LabelCreateOptions = {
  config: WahaClientConfig
  session?: string
  name: string
  colorHex?: string
  color?: number
}

export async function labelCreate(options: LabelCreateOptions): PromiseResult<Label> {
  const op = "labelCreate"
  const parsed = a.safeParse(labelCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, name, colorHex, color } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: Record<string, unknown> = { name }
  if (colorHex !== undefined) body.colorHex = colorHex
  if (color !== undefined) body.color = color

  return wahaRequest<Label>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/labels"),
    body,
  })
}
