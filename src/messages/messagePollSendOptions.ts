import type { MessagePoll } from "./messagePoll.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessagePollSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  poll: MessagePoll
  id?: string
  reply_to?: string
}
