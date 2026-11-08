import type { ChannelUpdateOptions } from "./channelUpdateOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Channel } from "./channel.js"
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

const channelUpdateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.pipe(a.string(), a.minLength(1)),
  name: a.optional(a.string()),
  description: a.optional(a.string()),
  picture: a.optional(a.nullable(wahaFileSchema)),
})

/** Live update · PATCH /api/{session}/channels/{id} — picture null removes, undefined keeps. */
export async function channelUpdate(options: ChannelUpdateOptions): PromiseResult<Channel> {
  const op = "channelUpdate"
  const parsed = a.safeParse(channelUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id, name, description, picture } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: Record<string, unknown> = {}
  if (name !== undefined) body.name = name
  if (description !== undefined) body.description = description
  if (picture !== undefined) body.picture = picture

  return wahaRequest<Channel>({
    config,
    method: "PATCH",
    path: wahaPathSession(sessionR.data, `/channels/${encodeURIComponent(id)}`),
    body,
  })
}
