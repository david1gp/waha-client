import type { MessagePollVoteSendOptions } from "./messagePollVoteSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messagePollVoteSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  pollMessageId: a.pipe(a.string(), a.minLength(1)),
  votes: a.array(a.string()),
  pollServerId: a.optional(a.number()),
})

export async function messagePollVoteSend(options: MessagePollVoteSendOptions): PromiseResult<unknown> {
  const op = "messagePollVoteSend"
  const parsed = a.safeParse(messagePollVoteSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, pollMessageId, votes, pollServerId } = parsed.output

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathApi("/sendPollVote"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, pollMessageId, votes, pollServerId }),
  })
}
