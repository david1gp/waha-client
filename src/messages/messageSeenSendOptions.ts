import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageSeenSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  messageId?: string
  messageIds?: string[]
  participant?: string
}
