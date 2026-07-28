import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Channel } from "./channelTypes.js"
import type { WahaFile } from "./profileTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const wahaFileSchema = a.union([
  a.object({
    mimetype: a.string(),
    filename: a.optional(a.string()),
    url: a.string(),
  }),
  a.object({
    mimetype: a.string(),
    filename: a.optional(a.string()),
    data: a.string(),
  }),
])

const channelCreateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  name: a.string(),
  description: a.optional(a.string()),
  picture: a.optional(wahaFileSchema),
})

export type ChannelCreateOptions = {
  config: WahaClientConfig
  session?: string
  name: string
  description?: string
  picture?: WahaFile
}

export async function channelCreate(options: ChannelCreateOptions): PromiseResult<Channel> {
  const op = "channelCreate"
  const parsed = a.safeParse(channelCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, name, description, picture } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: Record<string, unknown> = { name }
  if (description !== undefined) body.description = description
  if (picture !== undefined) body.picture = picture

  return wahaRequest<Channel>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/channels"),
    body,
  })
}
