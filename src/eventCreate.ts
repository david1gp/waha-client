import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WAMessage } from "./chattingTypes.js"
import type { EventMessage } from "./eventTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const eventLocationSchema = a.object({
  name: a.pipe(a.string(), a.minLength(1)),
})

const eventMessageSchema = a.object({
  name: a.pipe(a.string(), a.minLength(1)),
  description: a.optional(a.string()),
  startTime: a.number(),
  endTime: a.optional(a.number()),
  location: a.optional(eventLocationSchema),
  extraGuestsAllowed: a.optional(a.boolean()),
})

const eventCreateOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  event: eventMessageSchema,
  reply_to: a.optional(a.string()),
})

export type EventCreateOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  event: EventMessage
  reply_to?: string
}

export async function eventCreate(options: EventCreateOptions): PromiseResult<WAMessage> {
  const op = "eventCreate"
  const parsed = a.safeParse(eventCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, event, reply_to } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/events"),
    body: bodyOmitUndefined({ chatId, event, reply_to }),
  })
}
