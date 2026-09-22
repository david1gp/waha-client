import type { EventCreateOptions } from "./eventCreateOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WAMessage } from "../messages/waMessage.js"
import type { EventMessage } from "./eventMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

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

export async function eventCreate(options: EventCreateOptions): PromiseResult<WAMessage> {
  const op = "eventCreate"
  const parsed = a.safeParse(eventCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
