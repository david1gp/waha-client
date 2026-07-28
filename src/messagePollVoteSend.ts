import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messagePollVoteSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  pollMessageId: a.pipe(a.string(), a.minLength(1)),
  votes: a.array(a.string()),
  pollServerId: a.optional(a.number()),
})

export type MessagePollVoteSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  pollMessageId: string
  votes: string[]
  pollServerId?: number
}

export async function messagePollVoteSend(options: MessagePollVoteSendOptions): PromiseResult<unknown> {
  const op = "messagePollVoteSend"
  const parsed = a.safeParse(messagePollVoteSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, pollMessageId, votes, pollServerId } = parsed.output

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathApi("/sendPollVote"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, pollMessageId, votes, pollServerId }),
  })
}
