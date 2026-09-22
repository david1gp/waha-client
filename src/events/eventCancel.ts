import type { EventCancelOptions } from "./eventCancelOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WAMessage } from "../messages/waMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const eventCancelOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  id: a.pipe(a.string(), a.minLength(1)),
})

export async function eventCancel(options: EventCancelOptions): PromiseResult<WAMessage> {
  const op = "eventCancel"
  const parsed = a.safeParse(eventCancelOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, `/events/${encodeURIComponent(id)}/cancel`),
  })
}
