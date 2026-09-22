import type { ChannelCreateOptions } from "./channelCreateOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Channel } from "./channel.js"
import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

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

export async function channelCreate(options: ChannelCreateOptions): PromiseResult<Channel> {
  const op = "channelCreate"
  const parsed = a.safeParse(channelCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
