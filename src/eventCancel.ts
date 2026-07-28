import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const eventCancelOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  id: a.pipe(a.string(), a.minLength(1)),
})

export type EventCancelOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}

/** POST /api/{session}/events/{id}/cancel — may be disabled upstream; path matches WAHA DTO. */
export async function eventCancel(options: EventCancelOptions): PromiseResult<WAMessage> {
  const op = "eventCancel"
  const parsed = a.safeParse(eventCancelOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, `/events/${encodeURIComponent(id)}/cancel`),
  })
}
