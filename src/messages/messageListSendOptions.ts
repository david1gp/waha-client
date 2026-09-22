import type { MessageListMessage } from "./messageListMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageListSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  message: MessageListMessage
  reply_to?: string
}
